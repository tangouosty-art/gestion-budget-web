// server/src/routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/authController');
const auth = require('../middlewares/auth');

const validationInscription = [
  body('email').isEmail().withMessage('Email invalide'),
  body('mot_de_passe')
    .isLength({ min: 8 }).withMessage('Minimum 8 caractères')
    .matches(/[A-Z]/).withMessage('Au moins une majuscule')
    .matches(/[0-9]/).withMessage('Au moins un chiffre'),
];

router.post('/register', validationInscription, ctrl.inscription);
router.post('/login', [
  body('email').isEmail(),
  body('mot_de_passe').notEmpty(),
], ctrl.connexion);
router.get('/profile', auth, ctrl.profil);
router.put('/profile', auth, ctrl.modifierProfil);
router.put('/change-password', auth, ctrl.changerMotDePasse);
router.get('/verify/:token', ctrl.verifierEmail);

module.exports = router;
