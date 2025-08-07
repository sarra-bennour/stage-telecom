const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historiqueController');

// Récupérer l'historique
router.get('/', historyController.getHistory);

module.exports = router;