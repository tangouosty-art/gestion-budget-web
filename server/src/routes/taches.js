// server/src/routes/taches.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tachesController');
const auth = require('../middlewares/auth');

router.use(auth);
router.get('/', ctrl.lister);
router.post('/', ctrl.creer);
router.put('/:id', ctrl.modifier);
router.delete('/:id', ctrl.supprimer);

module.exports = router;
