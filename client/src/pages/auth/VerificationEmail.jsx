// client/src/pages/auth/VerificationEmail.jsx
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './auth.css';

const VerificationEmail = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const token = searchParams.get('token');
  const inscriptionReussie = location.state?.inscriptionReussie;
  const [etat, setEtat] = useState('attente');

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
          Votre adresse email a bien été confirmée. Vous pouvez maintenant vous connecter.
        </p>
        <Link to="/connexion" className="auth-form__submit" style={{ display: 'inline-flex', textDecoration: 'none', padding: '13px 32px', borderRadius: 'var(--radius-md)' }}>
          Se connecter →
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
          Ce lien est invalide ou a expiré.
        </p>
        <Link to="/connexion" className="auth-form__submit" style={{ display: 'inline-flex', textDecoration: 'none', padding: '13px 32px', borderRadius: 'var(--radius-md)' }}>
          Retour à la connexion
        </Link>
      </div>
    </div>
  );

  // Page après inscription : attente de vérification
  return (
    <div className="auth-page" style={{ gridTemplateColumns: '1fr' }}>
      <div className="auth-page__left" style={{ alignItems: 'center', textAlign: 'center', maxWidth: 480, margin: '0 auto', padding: '60px 24px' }}>
        <Link to="/" className="auth-page__logo">💰 Mon Budget<span>+</span></Link>
        <div style={{ fontSize: '4rem', marginBottom: 24 }}>📧</div>
        <h1 className="auth-page__title">Vérifiez votre email</h1>
        <p className="auth-page__subtitle" style={{ marginBottom: 32 }}>
          Un email de vérification a été envoyé à votre adresse.<br />
          Cliquez sur le lien pour activer votre compte avant de vous connecter.
        </p>
        <Link to="/connexion" className="auth-form__submit" style={{ display: 'inline-flex', textDecoration: 'none', padding: '13px 32px', borderRadius: 'var(--radius-md)' }}>
          Retour à la connexion
        </Link>
        <p style={{ marginTop: 24, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Pas reçu ? Vérifiez vos spams.
        </p>
      </div>
    </div>
  );
};

export default VerificationEmail;