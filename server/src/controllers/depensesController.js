// server/src/controllers/depensesController.js
const db = require('../config/db');

exports.lister = async (req, res) => {
  const { mois, annee, categorie_id } = req.query;
  let sql = `
    SELECT d.*, c.nom AS categorie_nom, c.couleur AS categorie_couleur
    FROM depenses d
    JOIN categories c ON d.categorie_id = c.id
    WHERE d.utilisateur_id = ?
  `;
  const params = [req.user.id];
  if (mois && annee) {
    sql += ' AND MONTH(d.date_depense) = ? AND YEAR(d.date_depense) = ?';
    params.push(mois, annee);
  }
  if (categorie_id) {
    sql += ' AND d.categorie_id = ?';
    params.push(categorie_id);
  }
  sql += ' ORDER BY d.date_depense DESC';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.parCategorie = async (req, res) => {
  const { mois, annee } = req.query;
  let sql = `
    SELECT c.nom, c.couleur, SUM(d.montant) AS total
    FROM depenses d
    JOIN categories c ON d.categorie_id = c.id
    WHERE d.utilisateur_id = ?
  `;
  const params = [req.user.id];
  if (mois && annee) {
    sql += ' AND MONTH(d.date_depense) = ? AND YEAR(d.date_depense) = ?';
    params.push(mois, annee);
  }
  sql += ' GROUP BY d.categorie_id, c.nom, c.couleur ORDER BY total DESC';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.evolutionMensuelle = async (req, res) => {
  const { annee } = req.query;
  const anneeActuelle = annee || new Date().getFullYear();
  try {
    const [depenses] = await db.query(`
      SELECT MONTH(date_depense) AS mois, SUM(montant) AS total_depenses
      FROM depenses WHERE utilisateur_id = ? AND YEAR(date_depense) = ?
      GROUP BY MONTH(date_depense)
    `, [req.user.id, anneeActuelle]);

    const [revenus] = await db.query(`
      SELECT MONTH(date_revenu) AS mois, SUM(montant) AS total_revenus
      FROM revenus WHERE utilisateur_id = ? AND YEAR(date_revenu) = ?
      GROUP BY MONTH(date_revenu)
    `, [req.user.id, anneeActuelle]);

    const moisNoms = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
    const data = moisNoms.map((nom, i) => {
      const m = i + 1;
      const dep = depenses.find(d => d.mois === m);
      const rev = revenus.find(r => r.mois === m);
      return {
        mois: nom,
        depenses: dep ? parseFloat(dep.total_depenses) : 0,
        revenus: rev ? parseFloat(rev.total_revenus) : 0,
      };
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.creer = async (req, res) => {
  const { libelle, montant, date_depense, categorie_id, description } = req.body;
  if (!libelle || !montant || !date_depense || !categorie_id) {
    return res.status(422).json({ message: 'Champs requis manquants.' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO depenses (utilisateur_id, categorie_id, libelle, montant, date_depense, description) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, categorie_id, libelle, montant, date_depense, description || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Dépense ajoutée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.modifier = async (req, res) => {
  const { libelle, montant, date_depense, categorie_id, description } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE depenses SET libelle=?, montant=?, date_depense=?, categorie_id=?, description=? WHERE id=? AND utilisateur_id=?',
      [libelle, montant, date_depense, categorie_id, description || null, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Dépense introuvable.' });
    res.json({ message: 'Dépense modifiée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.supprimer = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM depenses WHERE id=? AND utilisateur_id=?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Dépense supprimée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
