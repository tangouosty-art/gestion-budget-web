// client/src/pages/budget/Budget.jsx
import React, { useEffect, useState } from 'react';
import { budgetsAPI, revenusAPI, depensesAPI } from '../../services/api';
import { formaterMonnaie, moisActuel, anneeActuelle, moisNoms, pourcentage, couleurPourcentage } from '../../utils/helpers';
import { Wallet, Edit2, Trash2, Plus } from 'lucide-react';
import '../../styles/page.css';

const MOIS_OPTS = moisNoms.map((n, i) => ({ value: i + 1, label: n }));
const ANNEES = [anneeActuelle() - 1, anneeActuelle(), anneeActuelle() + 1];

const Budget = () => {
  const [budgets, setBudgets]   = useState([]);
  const [form, setForm]         = useState({ mois: moisActuel(), annee: anneeActuelle(), montant: '' });
  const [stats, setStats]       = useState({ revenus: 0, depenses: 0 });
  const [message, setMessage]   = useState(null);
  const [loading, setLoading]   = useState(false);

  const charger = async () => {
    const [b, r, d] = await Promise.all([
      budgetsAPI.lister(),
      revenusAPI.lister(`?mois=${moisActuel()}&annee=${anneeActuelle()}`),
      depensesAPI.lister(`?mois=${moisActuel()}&annee=${anneeActuelle()}`),
    ]);
    setBudgets(b);
    setStats({
      revenus:  r.reduce((s, x) => s + parseFloat(x.montant), 0),
      depenses: d.reduce((s, x) => s + parseFloat(x.montant), 0),
    });
  };

  useEffect(() => { charger(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await budgetsAPI.enregistrer(form);
      setMessage({ type:'success', texte:'Budget enregistré avec succès !' });
      charger();
    } catch (err) {
      setMessage({ type:'danger', texte: err.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer ce budget ?')) return;
    await budgetsAPI.supprimer(id);
    charger();
  };

  const budgetMois = budgets.find(b => b.mois === moisActuel() && b.annee === anneeActuelle());
  const pct = budgetMois ? pourcentage(stats.depenses, parseFloat(budgetMois.montant)) : 0;

  return (
    <div className="page animate-fade">
      <div className="page__header">
        <div>
          <h1 className="page__title">Budget</h1>
          <p className="page__subtitle">Définissez et suivez votre budget mensuel</p>
        </div>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.texte}</div>}

      {/* Résumé mois courant */}
      {budgetMois && (
        <div className="stat-grid" style={{marginBottom:28}}>
          <div className="stat-card stat-card--purple">
            <div className="stat-card__label">Budget {moisNoms[moisActuel()-1]}</div>
            <div className="stat-card__value">{formaterMonnaie(budgetMois.montant)}</div>
          </div>
          <div className="stat-card stat-card--orange">
            <div className="stat-card__label">Dépenses</div>
            <div className="stat-card__value">{formaterMonnaie(stats.depenses)}</div>
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{ width:`${pct}%`, background: couleurPourcentage(pct) }} />
            </div>
          </div>
          <div className="stat-card stat-card--blue">
            <div className="stat-card__label">Revenus</div>
            <div className="stat-card__value">{formaterMonnaie(stats.revenus)}</div>
          </div>
          <div className={`stat-card ${stats.revenus - stats.depenses >= 0 ? 'stat-card--green' : 'stat-card--red'}`}>
            <div className="stat-card__label">Solde</div>
            <div className="stat-card__value">{formaterMonnaie(stats.revenus - stats.depenses)}</div>
            <div className="stat-card__sub">{pct}% consommé</div>
          </div>
        </div>
      )}

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
        {/* Formulaire */}
        <div className="card">
          <div className="card__title"><Wallet size={16} /> Définir un budget</div>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>Mois</label>
              <select value={form.mois} onChange={e => setForm(f => ({...f, mois: parseInt(e.target.value)}))}>
                {MOIS_OPTS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Année</label>
              <select value={form.annee} onChange={e => setForm(f => ({...f, annee: parseInt(e.target.value)}))}>
                {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Montant (€)</label>
              <input type="number" step="0.01" min="0" placeholder="Ex : 1500" value={form.montant}
                onChange={e => setForm(f => ({...f, montant: e.target.value}))} required />
            </div>
            <button type="submit" className="btn btn--primary" disabled={loading} style={{alignSelf:'flex-start'}}>
              {loading ? <span className="spinner" /> : <><Plus size={15} /> Enregistrer</>}
            </button>
          </form>
        </div>

        {/* Historique */}
        <div className="card">
          <div className="card__title">📅 Historique budgets</div>
          {budgets.length === 0 ? (
            <div className="empty-state" style={{padding:'30px 0'}}>
              <div className="empty-state__icon">📋</div>
              <p>Aucun budget défini</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Période</th><th>Montant</th><th></th></tr>
                </thead>
                <tbody>
                  {budgets.map(b => (
                    <tr key={b.id}>
                      <td>{moisNoms[b.mois - 1]} {b.annee}</td>
                      <td className="td-mono">{formaterMonnaie(b.montant)}</td>
                      <td>
                        <button className="btn btn-icon btn--danger btn-sm" onClick={() => supprimer(b.id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budget;
