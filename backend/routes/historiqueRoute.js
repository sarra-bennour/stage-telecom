const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historiqueController');

// Récupérer l'historique
router.post('/', historyController.getHistory);

module.exports = router;