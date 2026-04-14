// server/src/controllers/tachesController.js
const db = require('../config/db');

exports.lister = async (req, res) => {
  const { statut, priorite } = req.query;
  let sql = 'SELECT * FROM taches WHERE utilisateur_id = ?';
  const params = [req.user.id];
  if (statut) { sql += ' AND statut = ?'; params.push(statut); }
  if (priorite) { sql += ' AND priorite = ?'; params.push(priorite); }
  sql += ' ORDER BY FIELD(priorite,"urgente","haute","normale","basse"), date_echeance ASC';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.creer = async (req, res) => {
  const { titre, description, statut, priorite, date_echeance } = req.body;
  if (!titre) return res.status(422).json({ message: 'Le titre est requis.' });
  try {
    const [result] = await db.query(
      'INSERT INTO taches (utilisateur_id, titre, description, statut, priorite, date_echeance) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, titre, description || null, statut || 'a_faire', priorite || 'normale', date_echeance || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Tâche créée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.modifier = async (req, res) => {
  const { titre, description, statut, priorite, date_echeance } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE taches SET titre=?, description=?, statut=?, priorite=?, date_echeance=? WHERE id=? AND utilisateur_id=?',
      [titre, description || null, statut, priorite, date_echeance || null, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Tâche introuvable.' });
    res.json({ message: 'Tâche modifiée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.supprimer = async (req, res) => {
  try {
    await db.query('DELETE FROM taches WHERE id=? AND utilisateur_id=?', [req.params.id, req.user.id]);
    res.json({ message: 'Tâche supprimée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
