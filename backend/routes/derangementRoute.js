const express = require('express');
const router = express.Router();
const derangementController = require('../controllers/derangementController');

// Routes CRUD pour les dérangements
router.post('/create-derangement', derangementController.createDerangement);
router.get('/derangement-list', derangementController.getDerangementList);
router.put('/update-derangement/:id', derangementController.updateDerangement);
router.delete('/delete-derangement/:id', derangementController.deleteDerangement);

module.exports = router;