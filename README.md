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
| Email         | monbudget.app44@gmail.com |
| Mot de passe  | Modetest44@app                 |

> ⚠️ Importez d'abord `database/schema.sql` — il crée le compte démo automatiquement.

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
