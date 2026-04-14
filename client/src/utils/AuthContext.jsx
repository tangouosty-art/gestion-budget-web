// client/src/utils/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('mbp_token');
    if (token) {
      authAPI.profil()
        .then(data => setUtilisateur(data))
        .catch(() => { localStorage.removeItem('mbp_token'); })
        .finally(() => setChargement(false));
    } else {
      setChargement(false);
    }
  }, []);

  const connexion = (token, userData) => {
    localStorage.setItem('mbp_token', token);
    setUtilisateur(userData);
  };

  const deconnexion = () => {
    localStorage.removeItem('mbp_token');
    setUtilisateur(null);
  };

  return (
    <AuthContext.Provider value={{ utilisateur, connexion, deconnexion, chargement, setUtilisateur }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
