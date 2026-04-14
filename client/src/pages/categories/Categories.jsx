// client/src/pages/categories/Categories.jsx
import React, { useEffect, useState } from 'react';
import { categoriesAPI } from '../../services/api';
import { Plus, Trash2, X, Tag } from 'lucide-react';
import '../../styles/page.css';

const COULEURS = ['#4ade80','#60a5fa','#f59e0b','#f87171','#a78bfa','#fb923c','#06b6d4','#ec4899','#10b981','#6b7280'];
const vide = { nom:'', couleur:'#4ade80', icone:'tag' };

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [modal, setModal]           = useState(false);
  const [form, setForm]             = useState(vide);
  const [message, setMessage]       = useState(null);
  const [loading, setLoading]       = useState(false);

  const charger = () => categoriesAPI.lister().then(setCategories);
  useEffect(() => { charger(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await categoriesAPI.creer(form);
      setMessage({ type:'success', texte:'Catégorie créée !' });
      setModal(false); setForm(vide); charger();
    } catch (err) {
      setMessage({ type:'danger', texte: err.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await categoriesAPI.supprimer(id);
      charger();
    } catch (err) {
      setMessage({ type:'danger', texte: err.message });
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="page animate-fade">
      <div className="page__header">
        <div>
          <h1 className="page__title">Catégories</h1>
          <p className="page__subtitle">Organisez vos dépenses par catégorie</p>
        </div>
        <button className="btn btn--primary" onClick={() => setModal(true)}>
          <Plus size={16} /> Nouvelle catégorie
        </button>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.texte}</div>}

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:14}}>
        {categories.map(c => (
          <div key={c.id} style={{
            background:'var(--bg-card)', border:'1px solid var(--border)',
            borderRadius:'var(--radius-lg)', padding:'20px', display:'flex',
            flexDirection:'column', gap:10, transition:'var(--transition)',
          }}
          className="stat-card"
          >
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{
                width:38, height:38, borderRadius:'50%',
                background:`${c.couleur}22`, border:`2px solid ${c.couleur}`,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <Tag size={16} color={c.couleur} />
              </div>
              <span style={{fontWeight:700, flex:1}}>{c.nom}</span>
              <button className="btn btn-icon btn--danger btn-sm" onClick={() => supprimer(c.id)}>
                <Trash2 size={13} />
              </button>
            </div>
            <div style={{
              height:4, borderRadius:99,
              background:`${c.couleur}30`,
              overflow:'hidden',
            }}>
              <div style={{width:'100%', height:'100%', background:c.couleur, borderRadius:99}} />
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="empty-state" style={{gridColumn:'1/-1'}}>
            <div className="empty-state__icon">🏷️</div>
            <h3>Aucune catégorie</h3>
            <p>Créez vos catégories de dépenses.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal__title">
              Nouvelle catégorie
              <button className="btn btn-icon btn--ghost btn-sm" onClick={() => setModal(false)}><X size={16}/></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nom *</label>
                <input value={form.nom} onChange={e => setForm(f=>({...f,nom:e.target.value}))} required placeholder="Ex: Alimentation" />
              </div>
              <div className="form-group">
                <label>Couleur</label>
                <div style={{display:'flex', flexWrap:'wrap', gap:8, marginTop:4}}>
                  {COULEURS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(f=>({...f,couleur:c}))}
                      style={{
                        width:28, height:28, borderRadius:'50%', background:c, border:'none', cursor:'pointer',
                        outline: form.couleur === c ? `3px solid white` : 'none',
                        outlineOffset: 2, transition:'var(--transition)',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="modal__actions">
                <button type="button" className="btn btn--ghost" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn--primary" disabled={loading}>
                  {loading ? <span className="spinner" /> : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
