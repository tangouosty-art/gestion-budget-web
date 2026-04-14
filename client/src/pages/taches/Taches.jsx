// client/src/pages/taches/Taches.jsx
import React, { useEffect, useState } from 'react';
import { tachesAPI } from '../../services/api';
import {
  formaterDate, labelStatut, labelPriorite,
  classeBadgeStatut, classeBadgePriorite, dateDansXJours,
} from '../../utils/helpers';
import { Plus, Edit2, Trash2, X, CheckSquare, AlertTriangle } from 'lucide-react';
import '../../styles/page.css';
import './Taches.css';

const STATUTS   = ['a_faire','en_cours','termine'];
const PRIORITES = ['basse','normale','haute','urgente'];
const vide = { titre:'', description:'', statut:'a_faire', priorite:'normale', date_echeance:'' };

const Taches = () => {
  const [taches, setTaches]   = useState([]);
  const [filtreStatut, setFiltreStatut] = useState('');
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(vide);
  const [editId, setEditId]   = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vue, setVue]         = useState('liste'); // 'liste' | 'kanban'

  const charger = async () => {
    let q = filtreStatut ? `?statut=${filtreStatut}` : '';
    const data = await tachesAPI.lister(q);
    setTaches(data);
  };

  useEffect(() => { charger(); }, [filtreStatut]);

  const ouvrirCreer    = () => { setForm(vide); setEditId(null); setModal(true); };
  const ouvrirModifier = (t) => {
    setForm({ titre:t.titre, description:t.description||'', statut:t.statut, priorite:t.priorite, date_echeance: t.date_echeance?.slice(0,10)||'' });
    setEditId(t.id); setModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await tachesAPI.modifier(editId, form);
        setMessage({ type:'success', texte:'Tâche modifiée !' });
      } else {
        await tachesAPI.creer(form);
        setMessage({ type:'success', texte:'Tâche créée !' });
      }
      setModal(false); charger();
    } catch (err) {
      setMessage({ type:'danger', texte: err.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const changerStatut = async (t, statut) => {
    await tachesAPI.modifier(t.id, { ...t, statut, date_echeance: t.date_echeance?.slice(0,10)||null });
    charger();
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer cette tâche ?')) return;
    await tachesAPI.supprimer(id);
    charger();
  };

  const parStatut = (s) => taches.filter(t => t.statut === s);
  const totaux = { a_faire: parStatut('a_faire').length, en_cours: parStatut('en_cours').length, termine: parStatut('termine').length };

  return (
    <div className="page animate-fade">
      <div className="page__header">
        <div>
          <h1 className="page__title">Tâches</h1>
          <p className="page__subtitle">Gérez vos objectifs et tâches financières</p>
        </div>
        <div style={{display:'flex', gap:8}}>
          <div className="vue-toggle">
            <button className={`vue-toggle__btn ${vue==='liste'?'active':''}`} onClick={() => setVue('liste')}>☰ Liste</button>
            <button className={`vue-toggle__btn ${vue==='kanban'?'active':''}`} onClick={() => setVue('kanban')}>⬛ Kanban</button>
          </div>
          <button className="btn btn--primary" onClick={ouvrirCreer}>
            <Plus size={16} /> Nouvelle tâche
          </button>
        </div>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.texte}</div>}

      {/* Stats rapides */}
      <div className="stat-grid" style={{marginBottom:20}}>
        <div className="stat-card">
          <div className="stat-card__label">À faire</div>
          <div className="stat-card__value" style={{color:'var(--text-secondary)'}}>{totaux.a_faire}</div>
        </div>
        <div className="stat-card stat-card--blue">
          <div className="stat-card__label">En cours</div>
          <div className="stat-card__value">{totaux.en_cours}</div>
        </div>
        <div className="stat-card stat-card--green">
          <div className="stat-card__label">Terminées</div>
          <div className="stat-card__value">{totaux.termine}</div>
        </div>
        <div className="stat-card stat-card--red">
          <div className="stat-card__label">Urgentes</div>
          <div className="stat-card__value">{taches.filter(t => t.priorite==='urgente' && t.statut!=='termine').length}</div>
        </div>
      </div>

      {/* Filtre statut */}
      <div className="filter-bar">
        <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          {STATUTS.map(s => <option key={s} value={s}>{labelStatut[s]}</option>)}
        </select>
      </div>

      {/* Vue liste */}
      {vue === 'liste' && (
        <div className="card">
          {taches.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">✅</div>
              <h3>Aucune tâche</h3>
              <p>Créez votre première tâche.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Titre</th><th>Priorité</th><th>Statut</th><th>Échéance</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {taches.map(t => {
                    const urgente = dateDansXJours(t.date_echeance, 3) && t.statut !== 'termine';
                    return (
                      <tr key={t.id} style={urgente ? {background:'rgba(248,113,113,0.05)'} : {}}>
                        <td>
                          <div style={{display:'flex', alignItems:'center', gap:8}}>
                            {urgente && <AlertTriangle size={14} color="var(--red)" />}
                            <span style={{fontWeight:600, textDecoration: t.statut==='termine' ? 'line-through' : 'none', color: t.statut==='termine' ? 'var(--text-muted)' : 'inherit'}}>
                              {t.titre}
                            </span>
                          </div>
                          {t.description && <div style={{fontSize:'0.78rem', color:'var(--text-muted)', marginTop:2}}>{t.description}</div>}
                        </td>
                        <td><span className={classeBadgePriorite[t.priorite]}>{labelPriorite[t.priorite]}</span></td>
                        <td>
                          <select
                            value={t.statut}
                            onChange={e => changerStatut(t, e.target.value)}
                            style={{width:'auto', padding:'4px 8px', fontSize:'0.78rem'}}
                          >
                            {STATUTS.map(s => <option key={s} value={s}>{labelStatut[s]}</option>)}
                          </select>
                        </td>
                        <td style={{color: urgente ? 'var(--red)' : 'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.82rem'}}>
                          {t.date_echeance ? formaterDate(t.date_echeance) : '—'}
                        </td>
                        <td>
                          <div style={{display:'flex',gap:6}}>
                            <button className="btn btn-icon btn--ghost btn-sm" onClick={() => ouvrirModifier(t)}><Edit2 size={14}/></button>
                            <button className="btn btn-icon btn--danger btn-sm" onClick={() => supprimer(t.id)}><Trash2 size={14}/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Vue Kanban */}
      {vue === 'kanban' && (
        <div className="kanban">
          {STATUTS.map(statut => (
            <div key={statut} className="kanban__col">
              <div className="kanban__col-header">
                <span className={classeBadgeStatut[statut]}>{labelStatut[statut]}</span>
                <span className="kanban__count">{parStatut(statut).length}</span>
              </div>
              <div className="kanban__cards">
                {parStatut(statut).map(t => (
                  <div key={t.id} className="kanban__card">
                    <div className="kanban__card-top">
                      <span className={classeBadgePriorite[t.priorite]}>{labelPriorite[t.priorite]}</span>
                      <div style={{display:'flex',gap:4}}>
                        <button className="btn btn-icon btn--ghost btn-sm" onClick={() => ouvrirModifier(t)}><Edit2 size={12}/></button>
                        <button className="btn btn-icon btn--danger btn-sm" onClick={() => supprimer(t.id)}><Trash2 size={12}/></button>
                      </div>
                    </div>
                    <div className="kanban__card-titre">{t.titre}</div>
                    {t.description && <div className="kanban__card-desc">{t.description}</div>}
                    {t.date_echeance && (
                      <div className="kanban__card-date" style={{color: dateDansXJours(t.date_echeance,3) ? 'var(--red)' : 'var(--text-muted)'}}>
                        📅 {formaterDate(t.date_echeance)}
                      </div>
                    )}
                  </div>
                ))}
                {parStatut(statut).length === 0 && (
                  <div style={{textAlign:'center', padding:'20px', color:'var(--text-muted)', fontSize:'0.82rem'}}>
                    Aucune tâche
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal__title">
              {editId ? 'Modifier la tâche' : 'Nouvelle tâche'}
              <button className="btn btn-icon btn--ghost btn-sm" onClick={() => setModal(false)}><X size={16}/></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Titre *</label>
                <input value={form.titre} onChange={e => setForm(f=>({...f,titre:e.target.value}))} required placeholder="Payer le loyer..." />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} rows={2} placeholder="Détails optionnels..." style={{resize:'vertical'}} />
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div className="form-group">
                  <label>Statut</label>
                  <select value={form.statut} onChange={e => setForm(f=>({...f,statut:e.target.value}))}>
                    {STATUTS.map(s => <option key={s} value={s}>{labelStatut[s]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priorité</label>
                  <select value={form.priorite} onChange={e => setForm(f=>({...f,priorite:e.target.value}))}>
                    {PRIORITES.map(p => <option key={p} value={p}>{labelPriorite[p]}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Date d'échéance</label>
                <input type="date" value={form.date_echeance} onChange={e => setForm(f=>({...f,date_echeance:e.target.value}))} />
              </div>
              <div className="modal__actions">
                <button type="button" className="btn btn--ghost" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn--primary" disabled={loading}>
                  {loading ? <span className="spinner" /> : editId ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Taches;
