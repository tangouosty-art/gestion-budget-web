// client/src/routes/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const PrivateRoute = ({ children }) => {
  const { utilisateur, chargement } = useAuth();

  if (chargement) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg-base)' }}>
        <div className="spinner" style={{ width:36, height:36 }} />
      </div>
    );
  }

  return utilisateur ? children : <Navigate to="/connexion" replace />;
};

export default PrivateRoute;
