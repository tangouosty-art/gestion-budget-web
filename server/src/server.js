// server/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// ---- Middlewares globaux ----
app.use(cors({
  origin: (origin, callback) => {
    const originesAutorisees = [
      process.env.CLIENT_URL,
      'https://mon-budget-plus.vercel.app',
      'https://mon-budget-plus-git-main-tangouosty-arts-projects.vercel.app',
      'http://localhost:5173',
    ];
    if (!origin || originesAutorisees.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Routes ----
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/budgets',    require('./routes/budgets'));
app.use('/api/revenus',    require('./routes/revenus'));
app.use('/api/depenses',   require('./routes/depenses'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/taches',     require('./routes/taches'));

// ---- Route santé ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Mon Budget+', version: '1.0.0' });
});

// ---- Gestion 404 ----
app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable.' });
});

// ---- Gestion erreurs globales ----
app.use((err, req, res, next) => {
  console.error('Erreur globale :', err);
  res.status(500).json({ message: 'Erreur interne du serveur.' });
});

// ---- Démarrage ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Mon Budget+ API démarrée sur http://localhost:${PORT}`);
  console.log(`📊 Environnement : ${process.env.NODE_ENV || 'development'}\n`);
});