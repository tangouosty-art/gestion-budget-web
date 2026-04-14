// server/src/routes/depenses.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/depensesController');
const auth = require('../middlewares/auth');

router.use(auth);
router.get('/', ctrl.lister);
router.get('/par-categorie', ctrl.parCategorie);
router.get('/evolution', ctrl.evolutionMensuelle);
router.post('/', ctrl.creer);
router.put('/:id', ctrl.modifier);
router.delete('/:id', ctrl.supprimer);

module.exports = router;
