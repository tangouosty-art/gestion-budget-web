// server/src/controllers/budgetController.js
const db = require('../config/db');

// GET /api/budgets?mois=&annee=
exports.lister = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM budgets WHERE utilisateur_id = ? ORDER BY annee DESC, mois DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/budgets/mois/:mois/annee/:annee
exports.getBudgetDuMois = async (req, res) => {
  const { mois, annee } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM budgets WHERE utilisateur_id = ? AND mois = ? AND annee = ?',
      [req.user.id, mois, annee]
    );
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/budgets
exports.creer = async (req, res) => {
  const { mois, annee, montant } = req.body;
  if (!mois || !annee || montant === undefined) {
    return res.status(422).json({ message: 'Champs requis manquants.' });
  }
  try {
    // Upsert
    await db.query(
      `INSERT INTO budgets (utilisateur_id, mois, annee, montant)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE montant = VALUES(montant)`,
      [req.user.id, mois, annee, montant]
    );
    res.status(201).json({ message: 'Budget enregistré.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /api/budgets/:id
exports.supprimer = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM budgets WHERE id = ? AND utilisateur_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Budget supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
