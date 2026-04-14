// client/src/pages/auth/Inscription.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './auth.css';

const forceMdp = (mdp) => {
  const checks = [
    mdp.length >= 8,
    /[A-Z]/.test(mdp),
    /[0-9]/.test(mdp),
    /[^A-Za-z0-9]/.test(mdp),
  ];
  return checks.filter(Boolean).length;
};

const Inscription = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', mot_de_passe:'', confirmation:'', prenom:'', nom:'' });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const force = forceMdp(form.mot_de_passe);

  const couleurForce = ['var(--border)','var(--red)','var(--orange)','var(--yellow)','var(--accent)'][force];
  const labelForce   = ['','Faible','Moyen','Bon','Fort'][force];

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setErreur('');
    if (form.mot_de_passe !== form.confirmation) {
      return setErreur('Les mots de passe ne correspondent pas.');
    }
    if (force < 2) return setErreur('Mot de passe trop faible.');
    setChargement(true);
    try {
      await authAPI.inscription(form);
      // ✅ Pas de connexion automatique — redirection vers vérification
      navigate('/verification-email', { state: { inscriptionReussie: true } });
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__left">
        <Link to="/" className="auth-page__logo">💰 Mon Budget<span>+</span></Link>
        <h1 className="auth-page__title">Créer un compte</h1>
        <p className="auth-page__subtitle">Rejoignez Mon Budget+ gratuitement.</p>

        {erreur && <div className="alert alert-danger" style={{marginBottom:16}}>{erreur}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <div className="form-group">
              <label>Prénom</label>
              <input name="prenom" value={form.prenom} onChange={handleChange} placeholder="Alex" />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input name="nom" value={form.nom} onChange={handleChange} placeholder="Dupont" />
            </div>
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="alex@email.fr" />
          </div>
          <div className="form-group">
            <label>Mot de passe *</label>
            <input type="password" name="mot_de_passe" value={form.mot_de_passe} onChange={handleChange} required placeholder="Min. 8 caractères" />
            {form.mot_de_passe && (
              <div className="password-strength">
                <div className="password-strength__bar">
                  <div className="password-strength__fill" style={{ width:`${force * 25}%`, background: couleurForce }} />
                </div>
                <div className="password-strength__label">Force : {labelForce}</div>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Confirmation *</label>
            <input type="password" name="confirmation" value={form.confirmation} onChange={handleChange} required placeholder="Répéter le mot de passe" />
          </div>
          <button type="submit" className="auth-form__submit" disabled={chargement}>
            {chargement ? <span className="spinner" /> : 'Créer mon compte'}
          </button>
          <p className="auth-form__footer">
            Déjà inscrit ? <Link to="/connexion">Se connecter</Link>
          </p>
        </form>
      </div>

      <div className="auth-page__right">
        <div className="auth-page__illustration">
          <div className="auth-page__illustration-icon">🚀</div>
          <h2>Commencez dès aujourd'hui</h2>
          <p>Prenez le contrôle de vos finances avec des outils simples et puissants.</p>
          <div className="auth-features">
            {[
              { icon:'📊', titre:'Graphiques interactifs', desc:'Suivez vos tendances' },
              { icon:'🔔', titre:'Alertes intelligentes', desc:'Ne dépassez plus votre budget' },
              { icon:'✅', titre:'Gestion de tâches', desc:'Organisez vos objectifs' },
            ].map(f => (
              <div key={f.titre} className="auth-feature">
                <span className="auth-feature__icon">{f.icon}</span>
                <div>
                  <strong>{f.titre}</strong>
                  <span>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inscription;