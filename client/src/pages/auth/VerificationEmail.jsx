// client/src/pages/auth/VerificationEmail.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './auth.css';

const VerificationEmail = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const token = searchParams.get('token');
  const inscriptionReussie = location.state?.inscriptionReussie;
  const [etat, setEtat] = useState('attente');
  const [messageErreur, setMessageErreur] = useState('');
  const dejaAppele = useRef(false); // ✅ Empêche le double appel React StrictMode

  useEffect(() => {
    if (!token) return;
    if (dejaAppele.current) return; // ✅ Si déjà appelé, on sort
    dejaAppele.current = true;

    setEtat('chargement');
    authAPI.verifierEmail(token)
      .then(() => setEtat('succes'))
      .catch(err => {
        setMessageErreur(err.message);
        setEtat('erreur');
      });
  }, [token]);

  // Vérification en cours
  if (etat === 'chargement') return (
    <div className="auth-page" style={{ gridTemplateColumns: '1fr' }}>
      <div className="auth-page__left" style={{ alignItems: 'center', textAlign: 'center', maxWidth: 480, margin: '0 auto', padding: '60px 24px' }}>
        <Link to="/" className="auth-page__logo">💰 Mon Budget<span>+</span></Link>
        <div className="spinner" style={{ width: 40, height: 40, margin: '24px auto' }} />
        <p className="auth-page__subtitle">Vérification en cours…</p>
      </div>
    </div>
  );

  // ✅ Email vérifié avec succès
  if (etat === 'succes') return (
    <div className="auth-page" style={{ gridTemplateColumns: '1fr' }}>
      <div className="auth-page__left" style={{ alignItems: 'center', textAlign: 'center', maxWidth: 480, margin: '0 auto', padding: '60px 24px' }}>
        <Link to="/" className="auth-page__logo">💰 Mon Budget<span>+</span></Link>
        <div style={{ fontSize: '4rem', marginBottom: 24 }}>✅</div>
        <h1 className="auth-page__title">Email vérifié !</h1>
        <p className="auth-page__subtitle" style={{ marginBottom: 8 }}>
          Votre adresse email a bien été confirmée.
        </p>
        <p style={{ marginBottom: 32, color: 'var(--accent)', fontSize: '0.95rem' }}>
          Votre compte est maintenant actif. Vous pouvez vous connecter.
        </p>
        <Link to="/connexion" className="auth-form__submit" style={{ display: 'inline-flex', textDecoration: 'none', padding: '13px 32px', borderRadius: 'var(--radius-md)' }}>
          Se connecter →
        </Link>
      </div>
    </div>
  );

  // ❌ Lien invalide, expiré ou déjà utilisé
  if (etat === 'erreur') return (
    <div className="auth-page" style={{ gridTemplateColumns: '1fr' }}>
      <div className="auth-page__left" style={{ alignItems: 'center', textAlign: 'center', maxWidth: 480, margin: '0 auto', padding: '60px 24px' }}>
        <Link to="/" className="auth-page__logo">💰 Mon Budget<span>+</span></Link>
        <div style={{ fontSize: '4rem', marginBottom: 24 }}>❌</div>
        <h1 className="auth-page__title">Lien invalide</h1>
        <p className="auth-page__subtitle" style={{ marginBottom: 32 }}>
          {messageErreur || 'Ce lien est invalide ou a expiré.'}
        </p>
        <Link to="/connexion" className="auth-form__submit" style={{ display: 'inline-flex', textDecoration: 'none', padding: '13px 32px', borderRadius: 'var(--radius-md)' }}>
          Retour à la connexion
        </Link>
      </div>
    </div>
  );

  // 📧 Page après inscription : attente de vérification
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