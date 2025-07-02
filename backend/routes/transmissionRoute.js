const express = require('express');
const router = express.Router();
const transmissionController = require('../controllers/transmissionController');

// Routes sans validateurs
router.post('/create-transmission', transmissionController.createTransmission);
router.get('/transmission-list', transmissionController.getTransmissionList);
router.put('/update-transmission/:id', transmissionController.updateTransmission);
router.delete('/delete-transmission/:id', transmissionController.deleteTransmission);

module.exports = router;