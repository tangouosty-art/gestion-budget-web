// server/src/routes/budgets.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/budgetController');
const auth = require('../middlewares/auth');

router.use(auth);
router.get('/', ctrl.lister);
router.get('/mois/:mois/annee/:annee', ctrl.getBudgetDuMois);
router.post('/', ctrl.creer);
router.delete('/:id', ctrl.supprimer);

module.exports = router;
