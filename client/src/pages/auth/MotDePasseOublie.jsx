// client/src/pages/auth/MotDePasseOublie.jsx
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './auth.css';

const MotDePasseOublie = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const [succes, setSucces] = useState(false);

  const handleDemande = async e => {
    e.preventDefault();
    setErreur(''); setMessage('');
    setChargement(true);
    try {
      const data = await authAPI.demanderResetMdp({ email });
      setMessage(data.message);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  };

  const handleReset = async e => {
    e.preventDefault();
    setErreur('');
    if (nouveauMdp !== confirmation) {
      return setErreur('Les mots de passe ne correspondent pas.');
    }
    if (nouveauMdp.length < 8) {
      return setErreur('Le mot de passe doit contenir au moins 8 caractères.');
    }
    setChargement(true);
    try {
      await authAPI.reinitialiserMdp({ token, nouveau_mdp: nouveauMdp });
      setSucces(true);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  };

  if (succes) return (
    <div className="auth-page" style={{ gridTemplateColumns: '1fr' }}>
      <div className="auth-page__left" style={{ alignItems: 'center', textAlign: 'center', maxWidth: 480, margin: '0 auto', padding: '60px 24px' }}>
        <Link to="/" className="auth-page__logo">💰 Mon Budget<span>+</span></Link>
        <div style={{ fontSize: '4rem', marginBottom: 24 }}>✅</div>
        <h1 className="auth-page__title">Mot de passe mis à jour !</h1>
        <p className="auth-page__subtitle" style={{ marginBottom: 32 }}>
          Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
        </p>
        <Link to="/connexion" className="auth-form__submit" style={{ display: 'inline-flex', textDecoration: 'none', padding: '13px 32px', borderRadius: 'var(--radius-md)' }}>
          Se connecter →
        </Link>
      </div>
    </div>
  );

  return (
    <div className="auth-page" style={{ gridTemplateColumns: '1fr' }}>
      <div className="auth-page__left" style={{ maxWidth: 480, margin: '0 auto', padding: '60px 24px' }}>
        <Link to="/" className="auth-page__logo">💰 Mon Budget<span>+</span></Link>

        {token ? (
          <>
            <h1 className="auth-page__title">Nouveau mot de passe</h1>
            <p className="auth-page__subtitle">Choisissez un nouveau mot de passe sécurisé.</p>
            {erreur && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{erreur}</div>}
            <form className="auth-form" onSubmit={handleReset}>
              <div className="form-group">
                <label>Nouveau mot de passe *</label>
                <input type="password" value={nouveauMdp} onChange={e => setNouveauMdp(e.target.value)} required placeholder="Min. 8 caractères" />
              </div>
              <div className="form-group">
                <label>Confirmation *</label>
                <input type="password" value={confirmation} onChange={e => setConfirmation(e.target.value)} required placeholder="Répéter le mot de passe" />
              </div>
              <button type="submit" className="auth-form__submit" disabled={chargement}>
                {chargement ? <span className="spinner" /> : 'Réinitialiser le mot de passe'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="auth-page__title">Mot de passe oublié</h1>
            <p className="auth-page__subtitle">Entrez votre email pour recevoir un lien de réinitialisation.</p>
            {erreur && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{erreur}</div>}
            {message && <div className="alert alert-info" style={{ marginBottom: 16 }}>{message}</div>}
            <form className="auth-form" onSubmit={handleDemande}>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="votre@email.fr" />
              </div>
              <button type="submit" className="auth-form__submit" disabled={chargement}>
                {chargement ? <span className="spinner" /> : 'Envoyer le lien'}
              </button>
              <p className="auth-form__footer">
                <Link to="/connexion">Retour à la connexion</Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default MotDePasseOublie;