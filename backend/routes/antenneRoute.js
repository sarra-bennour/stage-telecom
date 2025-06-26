const express = require('express');
const router = express.Router();
const antenneController = require('../controllers/antenneController');

// Routes pour les antennes
router.post('/create-antenne', antenneController.createAntenne);
router.get('/antenne-list', antenneController.getAntennes);
//router.put('/update-antenne/:id', antenneController.updateAntenne);
//router.delete('/delete-antenne/:id', antenneController.deleteAntenne);

module.exports = router;