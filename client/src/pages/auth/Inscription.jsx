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