// server/src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const db = require('../config/db');
const emailService = require('../services/emailService');

const SALT_ROUNDS = 12;

// Générer un JWT
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
    // Vérifier email unique
    const [existant] = await db.query('SELECT id FROM utilisateurs WHERE email = ?', [email]);
    if (existant.length > 0) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
    }

    const hash = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);
    // Token cryptographiquement sûr (64 caractères hex)
    const tokenVerif = crypto.randomBytes(32).toString('hex');

    const [result] = await db.query(
      'INSERT INTO utilisateurs (email, mot_de_passe, prenom, nom, token_verification) VALUES (?, ?, ?, ?, ?)',
      [email, hash, prenom || null, nom || null, tokenVerif]
    );

    // Créer catégories par défaut
    const categoriesDefaut = [
      ['Alimentation', '#f59e0b', 'shopping-cart'],
      ['Transport', '#3b82f6', 'car'],
      ['Logement', '#8b5cf6', 'home'],
      ['Santé', '#ef4444', 'heart'],
      ['Loisirs', '#10b981', 'smile'],
      ['Autres', '#6b7280', 'more-horizontal'],
    ];
    for (const [nomCat, couleur, icone] of categoriesDefaut) {
      await db.query(
        'INSERT INTO categories (utilisateur_id, nom, couleur, icone) VALUES (?, ?, ?, ?)',
        [result.insertId, nomCat, couleur, icone]
      );
    }

    // Envoi de l'email de vérification
    try {
      await emailService.envoyerEmailVerification(email, prenom, tokenVerif);
    } catch (emailErr) {
      console.error('Erreur envoi email de vérification :', emailErr);
      // On ne bloque pas l'inscription si l'email échoue
    }

    const utilisateur = { id: result.insertId, email };
    const token = genererToken(utilisateur);

    res.status(201).json({
      message: 'Inscription réussie. Vérifiez votre email pour activer votre compte.',
      token,
      utilisateur: { id: utilisateur.id, email, prenom, nom },
    });
  } catch (err) {
    console.error('Erreur inscription:', err);
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
    console.error('Erreur connexion:', err);
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
    const [rows] = await db.query(
      'SELECT id FROM utilisateurs WHERE token_verification = ?', [token]
    );
    if (rows.length === 0) return res.status(400).json({ message: 'Token invalide.' });
    await db.query(
      'UPDATE utilisateurs SET email_verifie = 1, token_verification = NULL WHERE id = ?',
      [rows[0].id]
    );
    res.json({ message: 'Email vérifié avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
