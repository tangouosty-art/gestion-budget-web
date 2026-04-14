// client/src/pages/auth/Connexion.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../utils/AuthContext';
import './auth.css';

const Connexion = () => {
  const navigate = useNavigate();
  const { connexion } = useAuth();
  const [form, setForm] = useState({ email:'', mot_de_passe:'' });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      const data = await authAPI.connexion(form);
      connexion(data.token, data.utilisateur);
      navigate('/app/dashboard');
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  };

  // ✅ Remplit automatiquement le formulaire avec le compte démo
  const remplirDemo = () => {
    setForm({
      email: 'monbudget.app44@gmail.com',
      mot_de_passe: 'Modetest44@app',
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-page__left">
        <Link to="/" className="auth-page__logo">💰 Mon Budget<span>+</span></Link>
        <h1 className="auth-page__title">Bon retour !</h1>
        <p className="auth-page__subtitle">Connectez-vous à votre espace budget.</p>

        {erreur && <div className="alert alert-danger" style={{marginBottom:16}}>{erreur}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="votre@email.fr" autoComplete="email" />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" name="mot_de_passe" value={form.mot_de_passe} onChange={handleChange} required placeholder="••••••••" autoComplete="current-password" />
          </div>
          <div style={{textAlign:'right', marginTop:-8}}>
            <Link to="/mot-de-passe-oublie" style={{color:'var(--text-muted)', fontSize:'0.82rem'}}>
              Mot de passe oublié ?
            </Link>
          </div>
          <button type="submit" className="auth-form__submit" disabled={chargement}>
            {chargement ? <span className="spinner" /> : 'Se connecter'}
          </button>
          <p className="auth-form__footer">
            Pas encore de compte ? <Link to="/inscription">S'inscrire</Link>
          </p>
        </form>

        {/* ✅ Compte démo mis à jour + bouton de remplissage automatique */}
        <div
          onClick={remplirDemo}
          style={{marginTop:24, padding:'14px 16px', background:'var(--bg-input)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', cursor:'pointer'}}
          title="Cliquez pour remplir automatiquement"
        >
          <p style={{fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:6}}>🧪 Compte de démonstration <span style={{color:'var(--accent)'}}>— cliquez pour remplir</span></p>
          <p style={{fontSize:'0.82rem'}}>Email : <strong>monbudget.app44@gmail.com</strong></p>
          <p style={{fontSize:'0.82rem'}}>Mot de passe : <strong>Modetest44@app</strong></p>
        </div>
      </div>

      <div className="auth-page__right">
        <div className="auth-page__illustration">
          <div className="auth-page__illustration-icon">💰</div>
          <h2>Votre argent sous contrôle</h2>
          <p>Accédez à votre tableau de bord et suivez vos finances en temps réel.</p>
          <div className="auth-features">
            {[
              { icon:'🔐', titre:'Sécurisé', desc:'Chiffrement JWT & bcrypt' },
              { icon:'📱', titre:'Responsive', desc:'Sur tous vos appareils' },
              { icon:'⚡', titre:'Rapide', desc:'Interface fluide et réactive' },
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

export default Connexion;