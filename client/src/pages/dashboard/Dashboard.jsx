// client/src/pages/dashboard/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line,
} from 'recharts';
import { budgetsAPI, revenusAPI, depensesAPI, tachesAPI } from '../../services/api';
import { useAuth } from '../../utils/AuthContext';
import {
  formaterMonnaie, moisActuel, anneeActuelle,
  moisNoms, pourcentage, couleurPourcentage,
  dateDansXJours, labelStatut, classeBadgeStatut, classeBadgePriorite, labelPriorite,
} from '../../utils/helpers';
import { AlertTriangle, TrendingUp, TrendingDown, Wallet, ArrowRight, CheckSquare } from 'lucide-react';
import '../../styles/page.css';
import './Dashboard.css';

const MOIS = moisActuel();
const ANNEE = anneeActuelle();

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{background:'var(--bg-card)', border:'1px solid var(--border)', padding:'10px 14px', borderRadius:'var(--radius-md)', fontSize:'0.82rem'}}>
        <p style={{marginBottom:4, fontWeight:600}}>{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{color:p.color}}>{p.name} : {formaterMonnaie(p.value)}</p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { utilisateur } = useAuth();
  const [budget, setBudget]       = useState(null);
  const [revenus, setRevenus]     = useState([]);
  const [depenses, setDepenses]   = useState([]);
  const [parCat, setParCat]       = useState([]);
  const [evolution, setEvolution] = useState([]);
  const [taches, setTaches]       = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const q = `?mois=${MOIS}&annee=${ANNEE}`;
    Promise.allSettled([
      budgetsAPI.duMois(MOIS, ANNEE),
      revenusAPI.lister(q),
      depensesAPI.lister(q),
      depensesAPI.parCategorie(q),
      depensesAPI.evolution(`?annee=${ANNEE}`),
      tachesAPI.lister(),
    ]).then(([b, r, d, pc, ev, t]) => {
      if (b.status === 'fulfilled')  setBudget(b.value);
      if (r.status === 'fulfilled')  setRevenus(Array.isArray(r.value) ? r.value : []);
      if (d.status === 'fulfilled')  setDepenses(Array.isArray(d.value) ? d.value : []);
      if (pc.status === 'fulfilled') setParCat(Array.isArray(pc.value) ? pc.value : []);
      if (ev.status === 'fulfilled') setEvolution(Array.isArray(ev.value) ? ev.value : []);
      if (t.status === 'fulfilled')  setTaches((Array.isArray(t.value) ? t.value : []).filter(t => t.statut !== 'termine').slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300}}>
      <div className="spinner" style={{width:36,height:36}} />
    </div>
  );

  const totalRevenus  = revenus.reduce((s, r) => s + parseFloat(r.montant), 0);
  const totalDepenses = depenses.reduce((s, d) => s + parseFloat(d.montant), 0);
  const budgetMontant = budget?.montant ? parseFloat(budget.montant) : 0;

  // ✅ Logique métier cohérente :
  // - Si un budget est défini → on base tout sur le budget
  // - Sinon → on base sur les revenus
  const baseCalcul = budgetMontant > 0 ? budgetMontant : totalRevenus;
  const reste      = baseCalcul - totalDepenses;
  const pct        = pourcentage(totalDepenses, baseCalcul);
  const couleurPct = couleurPourcentage(pct);

  const tachesUrgentes = taches.filter(t => t.priorite === 'urgente' || dateDansXJours(t.date_echeance, 3));

  return (
    <div className="page animate-fade">
      {/* En-tête */}
      <div className="page__header">
        <div>
          <h1 className="page__title">
            Bonjour, {utilisateur?.prenom || 'vous'} 👋
          </h1>
          <p className="page__subtitle">
            {moisNoms[MOIS - 1]} {ANNEE} · Vue d'ensemble de votre budget
          </p>
        </div>
      </div>

      {/* Alertes intelligentes */}
      {budgetMontant > 0 && pct >= 100 && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <span>⚠️ Budget du mois <strong>dépassé</strong> ! Vous avez dépensé {formaterMonnaie(totalDepenses)} sur {formaterMonnaie(budgetMontant)}.</span>
        </div>
      )}
      {budgetMontant > 0 && pct >= 80 && pct < 100 && (
        <div className="alert alert-warning">
          <AlertTriangle size={18} />
          <span>Budget presque atteint ({pct}%) · Il reste {formaterMonnaie(budgetMontant - totalDepenses)}.</span>
        </div>
      )}
      {tachesUrgentes.length > 0 && (
        <div className="alert alert-danger">
          <CheckSquare size={18} />
          <span>{tachesUrgentes.length} tâche(s) urgente(s) ou à échéance proche. <Link to="/app/taches" style={{color:'var(--red)',textDecoration:'underline'}}>Voir</Link></span>
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card stat-card--purple">
          <div className="stat-card__label">Budget mensuel</div>
          <div className="stat-card__value">{formaterMonnaie(budgetMontant)}</div>
          <div className="stat-card__sub">{moisNoms[MOIS - 1]} {ANNEE}</div>
        </div>
        <div className="stat-card stat-card--blue">
          <div className="stat-card__label"><TrendingUp size={12} style={{display:'inline',marginRight:4}}/>Revenus</div>
          <div className="stat-card__value">{formaterMonnaie(totalRevenus)}</div>
          <div className="stat-card__sub">{revenus.length} entrée(s)</div>
        </div>
        <div className="stat-card stat-card--orange">
          <div className="stat-card__label"><TrendingDown size={12} style={{display:'inline',marginRight:4}}/>Dépenses</div>
          <div className="stat-card__value">{formaterMonnaie(totalDepenses)}</div>
          <div className="stat-card__sub">{depenses.length} dépense(s)</div>
        </div>
        <div className={`stat-card ${reste >= 0 ? 'stat-card--green' : 'stat-card--red'}`}>
          <div className="stat-card__label"><Wallet size={12} style={{display:'inline',marginRight:4}}/>Reste disponible</div>
          <div className="stat-card__value">{formaterMonnaie(reste)}</div>
          {/* ✅ Label cohérent avec la base de calcul utilisée */}
          <div className="stat-card__sub">
            {budgetMontant > 0
              ? `${pct}% du budget consommé`
              : `${pct}% des revenus dépensés`}
          </div>
          {baseCalcul > 0 && (
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{ width:`${Math.min(pct, 100)}%`, background: couleurPct }} />
            </div>
          )}
        </div>
      </div>

      {/* Graphiques */}
      <div className="chart-grid">
        {/* Camembert dépenses par catégorie */}
        <div className="card">
          <div className="card__title">🥧 Dépenses par catégorie</div>
          {parCat.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={parCat}
                  dataKey="total"
                  nameKey="nom"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ nom, percent }) => `${nom} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={11}
                >
                  {parCat.map((c, i) => <Cell key={i} fill={c.couleur || '#6366f1'} />)}
                </Pie>
                <Tooltip formatter={v => formaterMonnaie(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">📂</div>
              <p>Aucune dépense ce mois</p>
            </div>
          )}
        </div>

        {/* Évolution mensuelle */}
        <div className="card">
          <div className="card__title">📈 Évolution {ANNEE}</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={evolution} margin={{ top:5, right:10, bottom:5, left:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mois" tick={{ fill:'var(--text-muted)', fontSize:11 }} />
              <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }} tickFormatter={v => `${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'0.78rem'}} />
              <Line type="monotone" dataKey="revenus"  name="Revenus"  stroke="var(--blue)"   strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="depenses" name="Dépenses" stroke="var(--orange)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart revenus vs dépenses */}
        <div className="card">
          <div className="card__title">📊 Revenus vs Dépenses</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={evolution.filter(m => m.revenus > 0 || m.depenses > 0)} margin={{ top:5, right:10, bottom:5, left:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mois" tick={{ fill:'var(--text-muted)', fontSize:11 }} />
              <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'0.78rem'}} />
              <Bar dataKey="revenus"  name="Revenus"  fill="var(--blue)"   radius={[4,4,0,0]} />
              <Bar dataKey="depenses" name="Dépenses" fill="var(--orange)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tâches en cours */}
        <div className="card">
          <div className="card__title">
            ✅ Tâches en cours
            <Link to="/app/taches" style={{marginLeft:'auto', fontSize:'0.78rem', color:'var(--accent)', display:'flex', alignItems:'center', gap:4}}>
              Voir tout <ArrowRight size={13} />
            </Link>
          </div>
          {taches.length === 0 ? (
            <div className="empty-state" style={{padding:'30px 0'}}>
              <div className="empty-state__icon">🎉</div>
              <p>Toutes les tâches sont terminées !</p>
            </div>
          ) : (
            <div className="dashboard-tasks">
              {taches.map(t => (
                <div key={t.id} className="dashboard-task">
                  <div className="dashboard-task__info">
                    <span className="dashboard-task__titre">{t.titre}</span>
                    <div style={{display:'flex',gap:6,marginTop:4}}>
                      <span className={classeBadgeStatut[t.statut]}>{labelStatut[t.statut]}</span>
                      <span className={classeBadgePriorite[t.priorite]}>{labelPriorite[t.priorite]}</span>
                    </div>
                  </div>
                  {t.date_echeance && (
                    <span className="dashboard-task__date">
                      {new Date(t.date_echeance).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'})}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;