// client/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import PrivateRoute from './routes/PrivateRoute';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages publiques
import Accueil from './pages/Accueil';
import Inscription from './pages/auth/Inscription';
import Connexion from './pages/auth/Connexion';
import VerificationEmail from './pages/auth/VerificationEmail';
import MotDePasseOublie from './pages/auth/MotDePasseOublie';

// Pages privées
import Dashboard from './pages/dashboard/Dashboard';
import Budget from './pages/budget/Budget';
import Revenus from './pages/revenus/Revenus';
import Depenses from './pages/depenses/Depenses';
import Categories from './pages/categories/Categories';
import Taches from './pages/taches/Taches';
import Profil from './pages/profil/Profil';

const App = () => (
  <AuthProvider>
    <Routes>
      {/* Publiques */}
      <Route path="/" element={<Accueil />} />
      <Route path="/inscription" element={<Inscription />} />
      <Route path="/connexion" element={<Connexion />} />
      <Route path="/verification-email" element={<VerificationEmail />} />
      <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />

      {/* Privées — avec DashboardLayout */}
      <Route path="/app" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="budget"     element={<Budget />} />
        <Route path="revenus"    element={<Revenus />} />
        <Route path="depenses"   element={<Depenses />} />
        <Route path="categories" element={<Categories />} />
        <Route path="taches"     element={<Taches />} />
        <Route path="profil"     element={<Profil />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AuthProvider>
);

export default App;
