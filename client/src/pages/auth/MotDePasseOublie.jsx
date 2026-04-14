// client/src/pages/auth/MotDePasseOublie.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './auth.css';

const MotDePasseOublie = () => {
  const [email, setEmail] = useState('');
  const [envoye, setEnvoye] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    // En prod : appel API reset password
    setEnvoye(true);
  };

  return (
    <div className="auth-page" style={{gridTemplateColumns:'1fr'}}>
      <div className="auth-page__left" style={{maxWidth:480, margin:'0 auto', padding:'60px 24px'}}>
        <Link to="/" className="auth-page__logo">💰 Mon Budget<span>+</span></Link>
        <h1 className="auth-page__title">Mot de passe oublié</h1>
        <p className="auth-page__subtitle">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>

        {envoye ? (
          <div className="alert alert-success">
            ✅ Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
            Vérifiez votre boîte mail.
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Adresse email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="votre@email.fr"
              />
            </div>
            <button type="submit" className="auth-form__submit">
              Envoyer le lien de réinitialisation
            </button>
          </form>
        )}

        <p className="auth-form__footer" style={{marginTop:24}}>
          <Link to="/connexion">← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
};

export default MotDePasseOublie;
