// server/src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const db = require('../config/db');
const emailService = require('../services/emailService');

const SALT_ROUNDS = 12;

const genererToken = (utilisateur) => {
  return jwt.sign(
    { id: utilisateur.id, email: utilisateur.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ---- INSCRIPTION ----
exports.inscription = async (req, res) => {
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty()) {
    return res.status(422).json({ erreurs: erreurs.array() });
  }

  const { email, mot_de_passe, prenom, nom } = req.body;
  try {
    const [existant] = await db.query('SELECT id FROM utilisateurs WHERE email = ?', [email]);
    if (existant.length > 0) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
    }

    const hash = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);
    const tokenVerif = crypto.randomBytes(32).toString('hex');
    const tokenExpire = new Date(Date.now() + 24 * 3600000); // 24 heures

    const [result] = await db.query(
      'INSERT INTO utilisateurs (email, mot_de_passe, prenom, nom, token_verification, token_verification_expire) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hash, prenom || null, nom || null, tokenVerif, tokenExpire]
    );

    const categoriesDefaut = [
      ['Alimentation', '#f59e0b', 'shopping-cart'],
      ['Transport', '#3b82f6', 'car'],
      ['Logement', '#8b5cf6', 'home'],
      ['Santé', '#ef4444', 'heart'],
      ['Loisirs', '#10b981', 'smile'],
      ['Vêtements', '#f97316', 'shirt'],
      ['Éducation', '#06b6d4', 'book'],
      ['Autres', '#6b7280', 'more-horizontal'],
    ];
    for (const [nomCat, couleur, icone] of categoriesDefaut) {
      await db.query(
        'INSERT INTO categories (utilisateur_id, nom, couleur, icone) VALUES (?, ?, ?, ?)',
        [result.insertId, nomCat, couleur, icone]
      );
    }

    try {
      await emailService.envoyerEmailVerification(email, prenom, tokenVerif);
    } catch (emailErr) {
      console.error('Erreur envoi email vérification:', emailErr.message);
    }

    res.status(201).json({
      message: 'Inscription réussie. Vérifiez votre email pour activer votre compte.',
    });
  } catch (err) {
    console.error('Erreur inscription:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ---- CONNEXION ----
exports.connexion = async (req, res) => {
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty()) {
    return res.status(422).json({ erreurs: erreurs.array() });
  }

  const { email, mot_de_passe } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const utilisateur = rows[0];
    const mdpValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!mdpValide) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    if (!utilisateur.email_verifie) {
      return res.status(403).json({ message: 'Veuillez vérifier votre email avant de vous connecter.' });
    }

    const token = genererToken(utilisateur);
    res.json({
      token,
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        email_verifie: utilisateur.email_verifie,
      },
    });
  } catch (err) {
    console.error('Erreur connexion:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ---- PROFIL ----
exports.profil = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, email, prenom, nom, avatar_url, email_verifie, created_at FROM utilisateurs WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ---- MODIFIER PROFIL ----
exports.modifierProfil = async (req, res) => {
  const { prenom, nom } = req.body;
  try {
    await db.query(
      'UPDATE utilisateurs SET prenom = ?, nom = ? WHERE id = ?',
      [prenom, nom, req.user.id]
    );
    res.json({ message: 'Profil mis à jour.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ---- CHANGER MOT DE PASSE ----
exports.changerMotDePasse = async (req, res) => {
  const { ancien_mdp, nouveau_mdp } = req.body;
  try {
    const [rows] = await db.query('SELECT mot_de_passe FROM utilisateurs WHERE id = ?', [req.user.id]);
    const valide = await bcrypt.compare(ancien_mdp, rows[0].mot_de_passe);
    if (!valide) return res.status(400).json({ message: 'Ancien mot de passe incorrect.' });

    const hash = await bcrypt.hash(nouveau_mdp, SALT_ROUNDS);
    await db.query('UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ message: 'Mot de passe modifié avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ---- VÉRIFICATION EMAIL ----
exports.verifierEmail = async (req, res) => {
  const { token } = req.params;
  try {
    // 1. Chercher l'utilisateur avec ce token
    const [rows] = await db.query(
      'SELECT id, email_verifie, token_verification_expire FROM utilisateurs WHERE token_verification = ?',
      [token]
    );

    // 2. Token introuvable — déjà utilisé ou invalide
    if (rows.length === 0) {
      return res.status(400).json({
        message: 'Ce lien a déjà été utilisé ou est invalide. Si votre compte est déjà vérifié, connectez-vous directement.',
      });
    }

    const utilisateur = rows[0];

    // 3. Email déjà vérifié
    if (utilisateur.email_verifie === 1) {
      return res.status(400).json({
        message: 'Votre email est déjà vérifié. Vous pouvez vous connecter.',
      });
    }

    // 4. Token expiré
    if (new Date(utilisateur.token_verification_expire) < new Date()) {
      return res.status(400).json({
        message: 'Ce lien a expiré. Veuillez vous réinscrire.',
      });
    }

    // 5. ✅ Token valide
    await db.query(
      'UPDATE utilisateurs SET email_verifie = 1, token_verification = NULL, token_verification_expire = NULL WHERE id = ?',
      [utilisateur.id]
    );
    res.json({ message: 'Email vérifié avec succès.' });

  } catch (err) {
    console.error('Erreur vérification email:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ---- DEMANDE RESET MOT DE PASSE ----
exports.demanderResetMdp = async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT id, prenom FROM utilisateurs WHERE email = ?', [email]
    );
    if (rows.length === 0) {
      return res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
    }

    const utilisateur = rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expire = new Date(Date.now() + 3600000); // 1 heure

    await db.query(
      'UPDATE utilisateurs SET token_reset_mdp = ?, token_reset_expire = ? WHERE id = ?',
      [token, expire, utilisateur.id]
    );

    try {
      await emailService.envoyerEmailResetMdp(email, utilisateur.prenom, token);
    } catch (emailErr) {
      console.error('Erreur envoi email reset:', emailErr.message);
    }

    res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
  } catch (err) {
    console.error('Erreur reset mdp:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ---- RÉINITIALISER MOT DE PASSE ----
exports.reinitialiserMdp = async (req, res) => {
  const { token, nouveau_mdp } = req.body;
  if (!token || !nouveau_mdp) {
    return res.status(422).json({ message: 'Token et nouveau mot de passe requis.' });
  }
  try {
    const [rows] = await db.query(
      'SELECT id FROM utilisateurs WHERE token_reset_mdp = ? AND token_reset_expire > NOW()',
      [token]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Lien invalide ou expiré.' });
    }

    const hash = await bcrypt.hash(nouveau_mdp, SALT_ROUNDS);
    await db.query(
      'UPDATE utilisateurs SET mot_de_passe = ?, token_reset_mdp = NULL, token_reset_expire = NULL WHERE id = ?',
      [hash, rows[0].id]
    );
    res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (err) {
    console.error('Erreur réinitialisation:', err.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};