const express = require('express');
const router = express.Router();
const authController = require('../controllers/userController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/check-auth', authController.checkAuth);
router.get('/get-superviseur', authController.getSuperviseurs);
router.get('/get-technicien', authController.getTechniciens);

module.exports = router;