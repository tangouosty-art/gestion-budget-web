// client/src/pages/auth/VerificationEmail.jsx
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './auth.css';

const VerificationEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [etat, setEtat] = useState('attente'); // 'attente' | 'chargement' | 'succes' | 'erreur'

  useEffect(() => {
    if (!token) return;
    setEtat('chargement');
    authAPI.verifierEmail(token)
      .then(() => setEtat('succes'))
      .catch(() => setEtat('erreur'));
  }, [token]);

  if (etat === 'chargement') return (
    <div className="auth-page" style={{ gridTemplateColumns: '1fr' }}>
      <div className="auth-page__left" style={{ alignItems: 'center', textAlign: 'center', maxWidth: 480, margin: '0 auto', padding: '60px 24px' }}>
        <Link to="/" className="auth-page__logo">💰 Mon Budget<span>+</span></Link>
        <div className="spinner" style={{ width: 40, height: 40, margin: '24px auto' }} />
        <p className="auth-page__subtitle">Vérification en cours…</p>
      </div>
    </div>
  );

  if (etat === 'succes') return (
    <div className="auth-page" style={{ gridTemplateColumns: '1fr' }}>
      <div className="auth-page__left" style={{ alignItems: 'center', textAlign: 'center', maxWidth: 480, margin: '0 auto', padding: '60px 24px' }}>
        <Link to="/" className="auth-page__logo">💰 Mon Budget<span>+</span></Link>
        <div style={{ fontSize: '4rem', marginBottom: 24 }}>✅</div>
        <h1 className="auth-page__title">Email vérifié !</h1>
        <p className="auth-page__subtitle" style={{ marginBottom: 32 }}>
          Votre adresse email a bien été confirmée. Vous pouvez accéder à votre espace.
        </p>
        <Link to="/app/dashboard" className="auth-form__submit" style={{ display: 'inline-flex', textDecoration: 'none', padding: '13px 32px', borderRadius: 'var(--radius-md)' }}>
          Accéder au dashboard →
        </Link>
      </div>
    </div>
  );

  if (etat === 'erreur') return (
    <div className="auth-page" style={{ gridTemplateColumns: '1fr' }}>
      <div className="auth-page__left" style={{ alignItems: 'center', textAlign: 'center', maxWidth: 480, margin: '0 auto', padding: '60px 24px' }}>
        <Link to="/" className="auth-page__logo">💰 Mon Budget<span>+</span></Link>
        <div style={{ fontSize: '4rem', marginBottom: 24 }}>❌</div>
        <h1 className="auth-page__title">Lien invalide</h1>
        <p className="auth-page__subtitle" style={{ marginBottom: 32 }}>
          Ce lien est invalide ou a expiré. Reconnectez-vous pour en demander un nouveau.
        </p>
        <Link to="/auth/connexion" className="auth-form__submit" style={{ display: 'inline-flex', textDecoration: 'none', padding: '13px 32px', borderRadius: 'var(--radius-md)' }}>
          Retour à la connexion
        </Link>
      </div>
    </div>
  );

  // Etat 'attente' : email envoyé, en attente du clic
  return (
    <div className="auth-page" style={{ gridTemplateColumns: '1fr' }}>
      <div className="auth-page__left" style={{ alignItems: 'center', textAlign: 'center', maxWidth: 480, margin: '0 auto', padding: '60px 24px' }}>
        <Link to="/" className="auth-page__logo">💰 Mon Budget<span>+</span></Link>
        <div style={{ fontSize: '4rem', marginBottom: 24 }}>📧</div>
        <h1 className="auth-page__title">Vérifiez votre email</h1>
        <p className="auth-page__subtitle" style={{ marginBottom: 32 }}>
          Un lien de vérification a été envoyé à votre adresse email.<br />
          Cliquez sur ce lien pour activer votre compte.
        </p>
        <p style={{ marginTop: 24, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Pas reçu ? Vérifiez vos spams ou{' '}
          <Link to="/auth/connexion" style={{ color: 'var(--accent)' }}>reconnectez-vous</Link>.
        </p>
      </div>
    </div>
  );
};

export default VerificationEmail;
