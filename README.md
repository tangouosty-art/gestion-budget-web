# 💰 Mon Budget+

Application web fullstack de gestion du budget personnel — React · Node.js · Express · MySQL

---

## 🗂️ Structure du projet

```
mon-budget-plus/
├── client/          # Frontend React + Vite
├── server/          # Backend Express + Node.js
└── database/        # Script SQL
```

---

## ⚡ Lancement rapide

### 1. Base de données MySQL

```sql
-- Dans MySQL Workbench ou terminal :
mysql -u root -p < database/schema.sql
```

### 2. Backend

```bash
cd server
cp .env.example .env
# Éditez .env avec vos identifiants MySQL

npm install
npm run dev
# → API disponible sur http://localhost:5000
```

### 3. Frontend

```bash
cd client
cp .env.example .env

npm install
npm run dev
# → Application sur http://localhost:5173
```

---

## 🔐 Compte de démo

| Champ         | Valeur                    |
|---------------|---------------------------|
| Email         | demo@monbudgetplus.fr     |
| Mot de passe  | Test1234!                 |

> ⚠️ Importez d'abord `database/schema.sql` — il crée le compte démo automatiquement.

---

## 📡 API Routes

| Méthode | Route                          | Auth | Description                  |
|---------|--------------------------------|------|------------------------------|
| POST    | /api/auth/register             | ❌   | Inscription                  |
| POST    | /api/auth/login                | ❌   | Connexion → JWT              |
| GET     | /api/auth/profile              | ✅   | Profil utilisateur           |
| PUT     | /api/auth/profile              | ✅   | Modifier profil              |
| PUT     | /api/auth/change-password      | ✅   | Changer mot de passe         |
| GET     | /api/budgets                   | ✅   | Lister budgets               |
| POST    | /api/budgets                   | ✅   | Créer/modifier budget        |
| DELETE  | /api/budgets/:id               | ✅   | Supprimer budget             |
| GET     | /api/revenus                   | ✅   | Lister revenus               |
| POST    | /api/revenus                   | ✅   | Créer revenu                 |
| PUT     | /api/revenus/:id               | ✅   | Modifier revenu              |
| DELETE  | /api/revenus/:id               | ✅   | Supprimer revenu             |
| GET     | /api/depenses                  | ✅   | Lister dépenses              |
| GET     | /api/depenses/par-categorie    | ✅   | Dépenses groupées            |
| GET     | /api/depenses/evolution        | ✅   | Évolution mensuelle          |
| POST    | /api/depenses                  | ✅   | Créer dépense                |
| PUT     | /api/depenses/:id              | ✅   | Modifier dépense             |
| DELETE  | /api/depenses/:id              | ✅   | Supprimer dépense            |
| GET     | /api/categories                | ✅   | Lister catégories            |
| POST    | /api/categories                | ✅   | Créer catégorie              |
| DELETE  | /api/categories/:id            | ✅   | Supprimer catégorie          |
| GET     | /api/taches                    | ✅   | Lister tâches                |
| POST    | /api/taches                    | ✅   | Créer tâche                  |
| PUT     | /api/taches/:id                | ✅   | Modifier tâche               |
| DELETE  | /api/taches/:id                | ✅   | Supprimer tâche              |

---

## 🧱 Stack technique

| Couche      | Technologies                         |
|-------------|--------------------------------------|
| Frontend    | React 18, Vite, React Router 6, Recharts, Lucide |
| Backend     | Node.js, Express 4                   |
| Base de données | MySQL 8 + mysql2                 |
| Sécurité    | bcrypt, JWT, express-validator       |
| Autres      | dotenv, cors                         |

---

## 📁 Pages de l'application

### Publiques
- `/` — Accueil landing page premium
- `/inscription` — Création de compte avec indicateur force mot de passe
- `/connexion` — Authentification JWT
- `/verification-email` — Confirmation d'inscription
- `/mot-de-passe-oublie` — Réinitialisation

### Privées (`/app/...`)
- `dashboard` — Vue d'ensemble + 3 graphiques Recharts + alertes
- `budget` — Définir/historiser les budgets mensuels
- `revenus` — CRUD complet avec filtres date
- `depenses` — CRUD complet avec filtres date + catégorie
- `categories` — Gestion des catégories colorées
- `taches` — CRUD avec vue liste ET vue Kanban + priorités
- `profil` — Modifier profil + changer mot de passe

---

## 🔒 Sécurité

- Mots de passe hashés avec **bcrypt** (12 rounds)
- Authentification via **JWT** (7 jours)
- Routes protégées côté serveur et côté client
- Validation des données avec **express-validator**
- Isolation des données par utilisateur (WHERE utilisateur_id = ?)
- CORS configuré pour n'autoriser que le frontend

---

## 🎨 Design

- Thème **sombre premium** (bg `#0a0c14`)
- Police **Sora** (display) + **JetBrains Mono** (chiffres)
- Accents **vert néon** (#4ade80) sur fond sombre
- Responsive mobile / tablette / desktop
- Animations CSS légères (fadeIn, slideIn)
- Alertes intelligentes (budget dépassé, tâche urgente)
- Vue Kanban pour les tâches

---

*Projet réalisé dans le cadre du BTS SIO SLAM — Portfolio professionnel*
