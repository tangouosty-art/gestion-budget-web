// client/src/pages/revenus/Revenus.jsx
import React, { useEffect, useState } from 'react';
import { revenusAPI } from '../../services/api';
import { formaterMonnaie, formaterDate, moisActuel, anneeActuelle, moisNoms } from '../../utils/helpers';
import { Plus, Edit2, Trash2, X, TrendingUp } from 'lucide-react';
import '../../styles/page.css';

const ANNEES = [anneeActuelle() - 1, anneeActuelle()];
const vide = { libelle:'', montant:'', date_revenu: new Date().toISOString().slice(0,10), description:'' };

const Revenus = () => {
  const [revenus, setRevenus]   = useState([]);
  const [filtre, setFiltre]     = useState({ mois: moisActuel(), annee: anneeActuelle() });
  const [modal, setModal]       = useState(null); // null | 'creer' | 'modifier'
  const [form, setForm]         = useState(vide);
  const [editId, setEditId]     = useState(null);
  const [message, setMessage]   = useState(null);
  const [loading, setLoading]   = useState(false);

  const charger = async () => {
    const q = `?mois=${filtre.mois}&annee=${filtre.annee}`;
    const data = await revenusAPI.lister(q);
    setRevenus(data);
  };

  useEffect(() => { charger(); }, [filtre]);

  const ouvrirCreer = () => { setForm(vide); setEditId(null); setModal('form'); };
  const ouvrirModifier = (r) => {
    setForm({ libelle:r.libelle, montant:r.montant, date_revenu: r.date_revenu?.slice(0,10), description:r.description || '' });
    setEditId(r.id); setModal('form');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await revenusAPI.modifier(editId, form);
        setMessage({ type:'success', texte:'Revenu modifié !' });
      } else {
        await revenusAPI.creer(form);
        setMessage({ type:'success', texte:'Revenu ajouté !' });
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
    if (!confirm('Supprimer ce revenu ?')) return;
    await revenusAPI.supprimer(id);
    charger();
  };

  const total = revenus.reduce((s, r) => s + parseFloat(r.montant), 0);

  return (
    <div className="page animate-fade">
      <div className="page__header">
        <div>
          <h1 className="page__title">Revenus</h1>
          <p className="page__subtitle">Gérez toutes vos sources de revenus</p>
        </div>
        <button className="btn btn--primary" onClick={ouvrirCreer}>
          <Plus size={16} /> Ajouter un revenu
        </button>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.texte}</div>}

      {/* Stats */}
      <div className="stat-grid" style={{marginBottom:20}}>
        <div className="stat-card stat-card--blue">
          <div className="stat-card__label"><TrendingUp size={12} style={{display:'inline',marginRight:4}}/>Total revenus</div>
          <div className="stat-card__value">{formaterMonnaie(total)}</div>
          <div className="stat-card__sub">{revenus.length} entrée(s) · {moisNoms[filtre.mois-1]} {filtre.annee}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="filter-bar">
        <select value={filtre.mois} onChange={e => setFiltre(f => ({...f, mois: parseInt(e.target.value)}))}>
          {moisNoms.map((n, i) => <option key={i} value={i+1}>{n}</option>)}
        </select>
        <select value={filtre.annee} onChange={e => setFiltre(f => ({...f, annee: parseInt(e.target.value)}))}>
          {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Tableau */}
      <div className="card">
        {revenus.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">💰</div>
            <h3>Aucun revenu</h3>
            <p>Ajoutez votre premier revenu pour ce mois.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Libellé</th><th>Date</th><th>Montant</th><th>Description</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {revenus.map(r => (
                  <tr key={r.id}>
                    <td style={{fontWeight:600}}>{r.libelle}</td>
                    <td style={{color:'var(--text-muted)'}}>{formaterDate(r.date_revenu)}</td>
                    <td className="td-mono td-positive">+{formaterMonnaie(r.montant)}</td>
                    <td style={{color:'var(--text-muted)',fontSize:'0.82rem'}}>{r.description || '—'}</td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-icon btn--ghost btn-sm" onClick={() => ouvrirModifier(r)}><Edit2 size={14}/></button>
                        <button className="btn btn-icon btn--danger btn-sm" onClick={() => supprimer(r.id)}><Trash2 size={14}/></button>
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
              {editId ? 'Modifier le revenu' : 'Nouveau revenu'}
              <button className="btn btn-icon btn--ghost btn-sm" onClick={() => setModal(null)}><X size={16}/></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Libellé *</label>
                <input value={form.libelle} onChange={e => setForm(f=>({...f,libelle:e.target.value}))} required placeholder="Salaire, freelance..." />
              </div>
              <div className="form-group">
                <label>Montant (€) *</label>
                <input type="number" step="0.01" min="0" value={form.montant} onChange={e => setForm(f=>({...f,montant:e.target.value}))} required placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input type="date" value={form.date_revenu} onChange={e => setForm(f=>({...f,date_revenu:e.target.value}))} required />
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

export default Revenus;
