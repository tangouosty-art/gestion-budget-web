// client/src/layouts/DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import {
  LayoutDashboard, Wallet, TrendingUp, TrendingDown,
  Tag, CheckSquare, User, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import './DashboardLayout.css';

const navItems = [
  { to: '/app/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/budget',     icon: Wallet,           label: 'Budget' },
  { to: '/app/revenus',    icon: TrendingUp,       label: 'Revenus' },
  { to: '/app/depenses',   icon: TrendingDown,     label: 'Dépenses' },
  { to: '/app/categories', icon: Tag,              label: 'Catégories' },
  { to: '/app/taches',     icon: CheckSquare,      label: 'Tâches' },
];

const DashboardLayout = () => {
  const { utilisateur, deconnexion } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleDeconnexion = () => {
    deconnexion();
    navigate('/');
  };

  const initiales = utilisateur
    ? `${(utilisateur.prenom || utilisateur.email)[0]}${utilisateur.nom ? utilisateur.nom[0] : ''}`.toUpperCase()
    : 'U';

  return (
    <div className="layout">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="layout__overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        {/* Logo */}
        <div className="sidebar__logo">
          <span className="sidebar__logo-icon">💰</span>
          <span className="sidebar__logo-text">Mon Budget<span>+</span></span>
        </div>

        {/* Nav */}
        <nav className="sidebar__nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} className="sidebar__link-arrow" />
            </NavLink>
          ))}
        </nav>

        {/* Profil bas de sidebar */}
        <div className="sidebar__footer">
          <NavLink
            to="/app/profil"
            className={({ isActive }) =>
              `sidebar__profile ${isActive ? 'sidebar__link--active' : ''}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <div className="sidebar__avatar">{initiales}</div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">
                {utilisateur?.prenom || utilisateur?.email?.split('@')[0]}
              </span>
              <span className="sidebar__user-email">{utilisateur?.email}</span>
            </div>
          </NavLink>
          <button className="sidebar__logout" onClick={handleDeconnexion} title="Déconnexion">
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="layout__main">
        {/* Topbar mobile */}
        <header className="topbar">
          <button className="topbar__menu" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <span className="topbar__brand">💰 Mon Budget+</span>
          <NavLink to="/app/profil">
            <div className="sidebar__avatar topbar__avatar">{initiales}</div>
          </NavLink>
        </header>

        {/* Contenu page */}
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
