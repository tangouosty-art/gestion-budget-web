// server/src/controllers/categoriesController.js
const db = require('../config/db');

exports.lister = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM categories WHERE utilisateur_id = ? ORDER BY nom ASC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.creer = async (req, res) => {
  const { nom, couleur, icone } = req.body;
  if (!nom) return res.status(422).json({ message: 'Le nom est requis.' });
  try {
    const [result] = await db.query(
      'INSERT INTO categories (utilisateur_id, nom, couleur, icone) VALUES (?, ?, ?, ?)',
      [req.user.id, nom, couleur || '#6366f1', icone || 'tag']
    );
    res.status(201).json({ id: result.insertId, message: 'Catégorie créée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.modifier = async (req, res) => {
  const { nom, couleur, icone } = req.body;
  try {
    await db.query(
      'UPDATE categories SET nom=?, couleur=?, icone=? WHERE id=? AND utilisateur_id=?',
      [nom, couleur, icone, req.params.id, req.user.id]
    );
    res.json({ message: 'Catégorie modifiée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.supprimer = async (req, res) => {
  try {
    // Vérifier si des dépenses utilisent cette catégorie
    const [depenses] = await db.query(
      'SELECT COUNT(*) as nb FROM depenses WHERE categorie_id = ?', [req.params.id]
    );
    if (depenses[0].nb > 0) {
      return res.status(400).json({ message: 'Impossible de supprimer : des dépenses utilisent cette catégorie.' });
    }
    await db.query('DELETE FROM categories WHERE id=? AND utilisateur_id=?', [req.params.id, req.user.id]);
    res.json({ message: 'Catégorie supprimée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
