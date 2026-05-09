// client/src/pages/profil/Profil.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../utils/AuthContext';
import { User, Lock, LogOut, Save, Eye, EyeOff, Trash2, AlertTriangle } from 'lucide-react';
import '../../styles/page.css';

const Profil = () => {
  const { utilisateur, setUtilisateur, deconnexion } = useAuth();
  const navigate = useNavigate();

  const [formProfil, setFormProfil] = useState({
    prenom: utilisateur?.prenom || '',
    nom:    utilisateur?.nom    || '',
  });
  const [formMdp, setFormMdp] = useState({ ancien_mdp: '', nouveau_mdp: '', confirmation: '' });
  const [formSupprimer, setFormSupprimer] = useState({ mot_de_passe: '' });

  const [msgProfil,    setMsgProfil]    = useState(null);
  const [msgMdp,       setMsgMdp]       = useState(null);
  const [msgSupprimer, setMsgSupprimer] = useState(null);

  const [loadProfil,    setLoadProfil]    = useState(false);
  const [loadMdp,       setLoadMdp]       = useState(false);
  const [loadSupprimer, setLoadSupprimer] = useState(false);

  // États voir/cacher mot de passe
  const [voirAncienMdp,    setVoirAncienMdp]    = useState(false);
  const [voirNouveauMdp,   setVoirNouveauMdp]   = useState(false);
  const [voirConfirmation, setVoirConfirmation] = useState(false);
  const [voirMdpSupprimer, setVoirMdpSupprimer] = useState(false);

  // Afficher/cacher le formulaire de suppression
  const [modalSupprimer, setModalSupprimer] = useState(false);

  const notify = (setter, type, texte) => {
    setter({ type, texte });
    setTimeout(() => setter(null), 4000);
  };

  const handleProfil = async e => {
    e.preventDefault();
    setLoadProfil(true);
    try {
      await authAPI.modifierProfil(formProfil);
      setUtilisateur(u => ({ ...u, ...formProfil }));
      notify(setMsgProfil, 'success', 'Profil mis à jour !');
    } catch (err) {
      notify(setMsgProfil, 'danger', err.message);
    } finally {
      setLoadProfil(false);
    }
  };

  const handleMdp = async e => {
    e.preventDefault();
    if (formMdp.nouveau_mdp !== formMdp.confirmation) {
      return notify(setMsgMdp, 'danger', 'Les mots de passe ne correspondent pas.');
    }
    setLoadMdp(true);
    try {
      await authAPI.changerMdp({ ancien_mdp: formMdp.ancien_mdp, nouveau_mdp: formMdp.nouveau_mdp });
      setFormMdp({ ancien_mdp: '', nouveau_mdp: '', confirmation: '' });
      notify(setMsgMdp, 'success', 'Mot de passe modifié avec succès !');
    } catch (err) {
      notify(setMsgMdp, 'danger', err.message);
    } finally {
      setLoadMdp(false);
    }
  };

  const handleSupprimer = async e => {
    e.preventDefault();
    setLoadSupprimer(true);
    try {
      await authAPI.supprimerCompte({ mot_de_passe: formSupprimer.mot_de_passe });
      deconnexion();
      navigate('/');
    } catch (err) {
      notify(setMsgSupprimer, 'danger', err.message);
    } finally {
      setLoadSupprimer(false);
    }
  };

  const handleDeconnexion = () => {
    deconnexion();
    navigate('/');
  };

  const initiales = `${(utilisateur?.prenom || utilisateur?.email || 'U')[0]}${utilisateur?.nom ? utilisateur.nom[0] : ''}`.toUpperCase();

  // Composant réutilisable champ mot de passe avec icône œil
  const ChampMdp = ({ label, value, onChange, placeholder, voir, setVoir, required = true }) => (
    <div className="form-group">
      <label>{label}{required && ' *'}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={voir ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          style={{ paddingRight: '42px' }}
        />
        <button
          type="button"
          onClick={() => setVoir(!voir)}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            padding: 0,
          }}
          title={voir ? 'Cacher le mot de passe' : 'Voir le mot de passe'}
        >
          {voir ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="page animate-fade">
      <div className="page__header">
        <div>
          <h1 className="page__title">Mon Profil</h1>
          <p className="page__subtitle">Gérez vos informations personnelles</p>
        </div>
      </div>

      {/* Avatar + infos */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-dim), var(--accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 800, color: '#000', flexShrink: 0,
        }}>
          {initiales}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            {utilisateur?.prenom} {utilisateur?.nom}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{utilisateur?.email}</div>
          <div style={{ marginTop: 6 }}>
            {utilisateur?.email_verifie
              ? <span className="badge badge-done">✓ Email vérifié</span>
              : <span className="badge badge-urgent">Email non vérifié</span>
            }
          </div>
        </div>
        <button
          className="btn btn--danger"
          onClick={handleDeconnexion}
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <LogOut size={16} /> Déconnexion
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Modifier profil */}
        <div className="card">
          <div className="card__title"><User size={16} /> Informations personnelles</div>
          {msgProfil && (
            <div className={`alert alert-${msgProfil.type}`} style={{ marginBottom: 16 }}>
              {msgProfil.texte}
            </div>
          )}
          <form onSubmit={handleProfil} className="modal-form">
            <div className="form-group">
              <label>Email</label>
              <input
                value={utilisateur?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
            <div className="form-group">
              <label>Prénom</label>
              <input
                value={formProfil.prenom}
                onChange={e => setFormProfil(f => ({ ...f, prenom: e.target.value }))}
                placeholder="Votre prénom"
              />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input
                value={formProfil.nom}
                onChange={e => setFormProfil(f => ({ ...f, nom: e.target.value }))}
                placeholder="Votre nom"
              />
            </div>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loadProfil}
              style={{ alignSelf: 'flex-start' }}
            >
              {loadProfil ? <span className="spinner" /> : <><Save size={15} /> Enregistrer</>}
            </button>
          </form>
        </div>

        {/* Changer mot de passe */}
        <div className="card">
          <div className="card__title"><Lock size={16} /> Changer le mot de passe</div>
          {msgMdp && (
            <div className={`alert alert-${msgMdp.type}`} style={{ marginBottom: 16 }}>
              {msgMdp.texte}
            </div>
          )}
          <form onSubmit={handleMdp} className="modal-form">
            <ChampMdp
              label="Mot de passe actuel"
              value={formMdp.ancien_mdp}
              onChange={e => setFormMdp(f => ({ ...f, ancien_mdp: e.target.value }))}
              placeholder="••••••••"
              voir={voirAncienMdp}
              setVoir={setVoirAncienMdp}
            />
            <ChampMdp
              label="Nouveau mot de passe"
              value={formMdp.nouveau_mdp}
              onChange={e => setFormMdp(f => ({ ...f, nouveau_mdp: e.target.value }))}
              placeholder="Min. 8 caractères"
              voir={voirNouveauMdp}
              setVoir={setVoirNouveauMdp}
            />
            <ChampMdp
              label="Confirmer"
              value={formMdp.confirmation}
              onChange={e => setFormMdp(f => ({ ...f, confirmation: e.target.value }))}
              placeholder="Répéter le mot de passe"
              voir={voirConfirmation}
              setVoir={setVoirConfirmation}
            />
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loadMdp}
              style={{ alignSelf: 'flex-start' }}
            >
              {loadMdp ? <span className="spinner" /> : <><Lock size={15} /> Modifier</>}
            </button>
          </form>
        </div>
      </div>

      {/* ── ZONE DANGER ────────────────────────────────────── */}
      <div className="card" style={{
        marginTop: 20,
        border: '1px solid #ef4444',
        borderRadius: 'var(--radius, 8px)',
      }}>
        <div className="card__title" style={{ color: '#ef4444' }}>
          <AlertTriangle size={16} /> Zone de danger
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 16px' }}>
          La suppression de votre compte est <strong>définitive et irréversible</strong>.
          Toutes vos données seront effacées : dépenses, revenus, catégories, budgets et tâches.
        </p>

        {!modalSupprimer ? (
          <button
            className="btn btn--danger"
            onClick={() => setModalSupprimer(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Trash2 size={15} /> Supprimer mon compte
          </button>
        ) : (
          <div style={{
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8,
            padding: 20,
          }}>
            <p style={{ fontWeight: 600, marginBottom: 12, color: '#ef4444' }}>
              ⚠️ Confirmez la suppression en saisissant votre mot de passe
            </p>

            {msgSupprimer && (
              <div className={`alert alert-${msgSupprimer.type}`} style={{ marginBottom: 12 }}>
                {msgSupprimer.texte}
              </div>
            )}

            <form onSubmit={handleSupprimer} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <ChampMdp
                label="Mot de passe"
                value={formSupprimer.mot_de_passe}
                onChange={e => setFormSupprimer({ mot_de_passe: e.target.value })}
                placeholder="Confirmez votre mot de passe"
                voir={voirMdpSupprimer}
                setVoir={setVoirMdpSupprimer}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  className="btn btn--danger"
                  disabled={loadSupprimer || !formSupprimer.mot_de_passe}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {loadSupprimer
                    ? <span className="spinner" />
                    : <><Trash2 size={15} /> Confirmer la suppression</>
                  }
                </button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => {
                    setModalSupprimer(false);
                    setFormSupprimer({ mot_de_passe: '' });
                    setMsgSupprimer(null);
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profil;