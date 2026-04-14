// client/src/pages/Accueil.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, BarChart2, CheckSquare, ArrowRight, Sparkles } from 'lucide-react';
import './Accueil.css';

const features = [
  { icon: BarChart2,   title: 'Tableaux de bord',   desc: 'Visualisez vos finances avec des graphiques interactifs en temps réel.' },
  { icon: TrendingUp,  title: 'Suivi revenus',       desc: 'Enregistrez et suivez toutes vos sources de revenus facilement.' },
  { icon: ShieldCheck, title: 'Sécurisé',            desc: 'Vos données sont protégées avec chiffrement JWT et bcrypt.' },
  { icon: CheckSquare, title: 'Gestion de tâches',   desc: 'Organisez vos tâches financières par priorité et échéance.' },
];

const Accueil = () => (
  <div className="accueil">
    {/* Nav */}
    <nav className="accueil__nav">
      <div className="accueil__nav-logo">💰 Mon Budget<span>+</span></div>
      <div className="accueil__nav-actions">
        <Link to="/connexion" className="btn-ghost">Connexion</Link>
        <Link to="/inscription" className="btn-primary">Commencer</Link>
      </div>
    </nav>

    {/* Hero */}
    <section className="accueil__hero">
      <div className="accueil__hero-badge">
        <Sparkles size={14} /> Nouvelle version disponible
      </div>
      <h1 className="accueil__hero-title">
        Gérez votre argent<br />
        <span className="accueil__hero-accent">intelligemment</span>
      </h1>
      <p className="accueil__hero-sub">
        Mon Budget+ est l'outil de gestion financière conçu pour les étudiants et jeunes actifs.
        Suivez vos revenus, contrôlez vos dépenses et atteignez vos objectifs.
      </p>
      <div className="accueil__hero-cta">
        <Link to="/inscription" className="btn-primary btn-lg">
          Créer mon compte gratuitement <ArrowRight size={18} />
        </Link>
        <Link to="/connexion" className="btn-outline">
          J'ai déjà un compte
        </Link>
      </div>

      {/* Dashboard preview mockup */}
      <div className="accueil__mockup">
        <div className="mockup__bar">
          <span /><span /><span />
        </div>
        <div className="mockup__content">
          <div className="mockup__stat-row">
            <div className="mockup__stat green">
              <div className="mockup__stat-label">Budget du mois</div>
              <div className="mockup__stat-value">2 000 €</div>
            </div>
            <div className="mockup__stat blue">
              <div className="mockup__stat-label">Total revenus</div>
              <div className="mockup__stat-value">1 850 €</div>
            </div>
            <div className="mockup__stat orange">
              <div className="mockup__stat-label">Dépenses</div>
              <div className="mockup__stat-value">1 230 €</div>
            </div>
            <div className="mockup__stat purple">
              <div className="mockup__stat-label">Reste</div>
              <div className="mockup__stat-value">620 €</div>
            </div>
          </div>
          <div className="mockup__chart">
            {[40, 65, 50, 80, 60, 90, 45, 70, 55, 85, 62, 75].map((h, i) => (
              <div key={i} className="mockup__bar-item" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="accueil__features">
      <h2 className="accueil__section-title">Tout ce dont vous avez besoin</h2>
      <div className="accueil__features-grid">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="feature-card">
            <div className="feature-card__icon"><Icon size={22} /></div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA final */}
    <section className="accueil__cta-final">
      <h2>Prêt à reprendre le contrôle ?</h2>
      <p>Rejoignez des milliers d'utilisateurs qui gèrent leur budget avec Mon Budget+</p>
      <Link to="/inscription" className="btn-primary btn-lg">
        Démarrer maintenant — c'est gratuit <ArrowRight size={18} />
      </Link>
    </section>

    {/* Footer */}
    <footer className="accueil__footer">
      <p>© 2024 Mon Budget+ · Projet BTS SIO SLAM</p>
    </footer>
  </div>
);

export default Accueil;
