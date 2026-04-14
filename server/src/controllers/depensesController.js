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
    // ✅ Conversion explicite en nombre
    res.json(rows.map(r => ({ ...r, total: parseFloat(r.total) })));
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};