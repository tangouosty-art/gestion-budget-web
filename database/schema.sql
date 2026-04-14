-- ============================================================
-- MON BUDGET+ - Script SQL complet
-- ============================================================

CREATE DATABASE IF NOT EXISTS mon_budget_plus
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mon_budget_plus;

-- ============================================================
-- TABLE : utilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS utilisateurs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  prenom VARCHAR(100),
  nom VARCHAR(100),
  avatar_url VARCHAR(500),
  email_verifie TINYINT(1) DEFAULT 0,
  token_verification VARCHAR(255),
  token_reset_mdp VARCHAR(255),
  token_reset_expire DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT UNSIGNED NOT NULL,
  nom VARCHAR(100) NOT NULL,
  couleur VARCHAR(20) DEFAULT '#6366f1',
  icone VARCHAR(50) DEFAULT 'tag',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : budgets
-- ============================================================
CREATE TABLE IF NOT EXISTS budgets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT UNSIGNED NOT NULL,
  mois INT NOT NULL COMMENT '1-12',
  annee INT NOT NULL,
  montant DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_budget (utilisateur_id, mois, annee),
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : revenus
-- ============================================================
CREATE TABLE IF NOT EXISTS revenus (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT UNSIGNED NOT NULL,
  libelle VARCHAR(255) NOT NULL,
  montant DECIMAL(12,2) NOT NULL,
  date_revenu DATE NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : depenses
-- ============================================================
CREATE TABLE IF NOT EXISTS depenses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT UNSIGNED NOT NULL,
  categorie_id INT UNSIGNED NOT NULL,
  libelle VARCHAR(255) NOT NULL,
  montant DECIMAL(12,2) NOT NULL,
  date_depense DATE NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : taches
-- ============================================================
CREATE TABLE IF NOT EXISTS taches (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT UNSIGNED NOT NULL,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  statut ENUM('a_faire','en_cours','termine') DEFAULT 'a_faire',
  priorite ENUM('basse','normale','haute','urgente') DEFAULT 'normale',
  date_echeance DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- DONNÉES DE DÉMONSTRATION
-- ============================================================

-- Utilisateur de test (mdp: Test1234!)
INSERT INTO utilisateurs (email, mot_de_passe, prenom, nom, email_verifie) VALUES
('demo@monbudgetplus.fr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniMrKHGPCl1Kj1JCsT5NEHaJu', 'Alex', 'Demo', 1);

-- Catégories par défaut pour l'utilisateur demo (id=1)
INSERT INTO categories (utilisateur_id, nom, couleur, icone) VALUES
(1, 'Alimentation', '#f59e0b', 'shopping-cart'),
(1, 'Transport', '#3b82f6', 'car'),
(1, 'Logement', '#8b5cf6', 'home'),
(1, 'Santé', '#ef4444', 'heart'),
(1, 'Loisirs', '#10b981', 'smile'),
(1, 'Vêtements', '#f97316', 'shirt'),
(1, 'Éducation', '#06b6d4', 'book'),
(1, 'Autres', '#6b7280', 'more-horizontal');
