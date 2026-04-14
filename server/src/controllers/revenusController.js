// server/src/controllers/revenus Controller.js
const db = require('../config/db');

exports.lister = async (req, res) => {
  const { mois, annee } = req.query;
  let sql = 'SELECT * FROM revenus WHERE utilisateur_id = ?';
  const params = [req.user.id];
  if (mois && annee) {
    sql += ' AND MONTH(date_revenu) = ? AND YEAR(date_revenu) = ?';
    params.push(mois, annee);
  }
  sql += ' ORDER BY date_revenu DESC';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.creer = async (req, res) => {
  const { libelle, montant, date_revenu, description } = req.body;
  if (!libelle || !montant || !date_revenu) {
    return res.status(422).json({ message: 'Champs requis manquants.' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO revenus (utilisateur_id, libelle, montant, date_revenu, description) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, libelle, montant, date_revenu, description || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Revenu ajouté.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.modifier = async (req, res) => {
  const { libelle, montant, date_revenu, description } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE revenus SET libelle=?, montant=?, date_revenu=?, description=? WHERE id=? AND utilisateur_id=?',
      [libelle, montant, date_revenu, description || null, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Revenu introuvable.' });
    res.json({ message: 'Revenu modifié.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.supprimer = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM revenus WHERE id=? AND utilisateur_id=?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Revenu supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
