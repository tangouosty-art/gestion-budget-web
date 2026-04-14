// client/src/pages/depenses/Depenses.jsx
import React, { useEffect, useState } from 'react';
import { depensesAPI, categoriesAPI } from '../../services/api';
import { formaterMonnaie, formaterDate, moisActuel, anneeActuelle, moisNoms } from '../../utils/helpers';
import { Plus, Edit2, Trash2, X, TrendingDown } from 'lucide-react';
import '../../styles/page.css';

const ANNEES = [anneeActuelle() - 1, anneeActuelle()];
const vide = { libelle:'', montant:'', date_depense: new Date().toISOString().slice(0,10), categorie_id:'', description:'' };

const Depenses = () => {
  const [depenses, setDepenses]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [filtre, setFiltre]       = useState({ mois: moisActuel(), annee: anneeActuelle(), categorie_id: '' });
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState(vide);
  const [editId, setEditId]       = useState(null);
  const [message, setMessage]     = useState(null);
  const [loading, setLoading]     = useState(false);

  const charger = async () => {
    let q = `?mois=${filtre.mois}&annee=${filtre.annee}`;
    if (filtre.categorie_id) q += `&categorie_id=${filtre.categorie_id}`;
    const [d, c] = await Promise.all([depensesAPI.lister(q), categoriesAPI.lister()]);
    setDepenses(d); setCategories(c);
  };

  useEffect(() => { charger(); }, [filtre]);

  const ouvrirCreer    = () => { setForm(vide); setEditId(null); setModal('form'); };
  const ouvrirModifier = (d) => {
    setForm({ libelle:d.libelle, montant:d.montant, date_depense: d.date_depense?.slice(0,10), categorie_id: d.categorie_id, description: d.description||'' });
    setEditId(d.id); setModal('form');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.categorie_id) return setMessage({ type:'warning', texte:'Veuillez choisir une catégorie.' });
    setLoading(true);
    try {
      if (editId) {
        await depensesAPI.modifier(editId, form);
        setMessage({ type:'success', texte:'Dépense modifiée !' });
      } else {
        await depensesAPI.creer(form);
        setMessage({ type:'success', texte:'Dépense ajoutée !' });
      }
      setModal(null); charger();
    } catch (err) {
      setMessage({ type:'danger', texte: err.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer cette dépense ?')) return;
    await depensesAPI.supprimer(id);
    charger();
  };

  const total = depenses.reduce((s, d) => s + parseFloat(d.montant), 0);

  return (
    <div className="page animate-fade">
      <div className="page__header">
        <div>
          <h1 className="page__title">Dépenses</h1>
          <p className="page__subtitle">Suivez et contrôlez toutes vos dépenses</p>
        </div>
        <button className="btn btn--primary" onClick={ouvrirCreer}>
          <Plus size={16} /> Ajouter une dépense
        </button>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.texte}</div>}

      <div className="stat-grid" style={{marginBottom:20}}>
        <div className="stat-card stat-card--orange">
          <div className="stat-card__label"><TrendingDown size={12} style={{display:'inline',marginRight:4}}/>Total dépenses</div>
          <div className="stat-card__value">{formaterMonnaie(total)}</div>
          <div className="stat-card__sub">{depenses.length} dépense(s) · {moisNoms[filtre.mois-1]} {filtre.annee}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="filter-bar">
        <select value={filtre.mois} onChange={e => setFiltre(f=>({...f, mois:parseInt(e.target.value)}))}>
          {moisNoms.map((n,i) => <option key={i} value={i+1}>{n}</option>)}
        </select>
        <select value={filtre.annee} onChange={e => setFiltre(f=>({...f, annee:parseInt(e.target.value)}))}>
          {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={filtre.categorie_id} onChange={e => setFiltre(f=>({...f, categorie_id:e.target.value}))}>
          <option value="">Toutes catégories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
      </div>

      {/* Tableau */}
      <div className="card">
        {depenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🛒</div>
            <h3>Aucune dépense</h3>
            <p>Aucune dépense enregistrée pour cette période.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Libellé</th><th>Catégorie</th><th>Date</th><th>Montant</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {depenses.map(d => (
                  <tr key={d.id}>
                    <td style={{fontWeight:600}}>{d.libelle}</td>
                    <td>
                      <span style={{
                        display:'inline-flex', alignItems:'center', gap:6,
                        padding:'3px 10px', borderRadius:99,
                        background: `${d.categorie_couleur}20`,
                        color: d.categorie_couleur, fontSize:'0.78rem', fontWeight:600,
                      }}>
                        <span style={{width:7,height:7,borderRadius:'50%',background:d.categorie_couleur,display:'inline-block'}} />
                        {d.categorie_nom}
                      </span>
                    </td>
                    <td style={{color:'var(--text-muted)'}}>{formaterDate(d.date_depense)}</td>
                    <td className="td-mono td-negative">−{formaterMonnaie(d.montant)}</td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-icon btn--ghost btn-sm" onClick={() => ouvrirModifier(d)}><Edit2 size={14}/></button>
                        <button className="btn btn-icon btn--danger btn-sm" onClick={() => supprimer(d.id)}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal__title">
              {editId ? 'Modifier la dépense' : 'Nouvelle dépense'}
              <button className="btn btn-icon btn--ghost btn-sm" onClick={() => setModal(null)}><X size={16}/></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Libellé *</label>
                <input value={form.libelle} onChange={e => setForm(f=>({...f,libelle:e.target.value}))} required placeholder="Courses, loyer..." />
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div className="form-group">
                  <label>Montant (€) *</label>
                  <input type="number" step="0.01" min="0" value={form.montant} onChange={e => setForm(f=>({...f,montant:e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" value={form.date_depense} onChange={e => setForm(f=>({...f,date_depense:e.target.value}))} required />
                </div>
              </div>
              <div className="form-group">
                <label>Catégorie *</label>
                <select value={form.categorie_id} onChange={e => setForm(f=>({...f,categorie_id:e.target.value}))} required>
                  <option value="">Choisir une catégorie</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} rows={2} placeholder="Optionnel..." style={{resize:'vertical'}} />
              </div>
              <div className="modal__actions">
                <button type="button" className="btn btn--ghost" onClick={() => setModal(null)}>Annuler</button>
                <button type="submit" className="btn btn--primary" disabled={loading}>
                  {loading ? <span className="spinner" /> : editId ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Depenses;
