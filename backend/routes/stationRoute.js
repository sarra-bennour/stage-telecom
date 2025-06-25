const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const stationController = require('../controllers/stationController');

// Route pour créer une nouvelle station
router.get('/station-list',stationController.getStationList)
router.post('/create-station',upload.array('images', 5), stationController.createStation);
router.delete('/:stationId/images/:imageId', stationController.deleteImage);


module.exports = router;