const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/logout', userController.logout);
router.get('/check-auth', userController.checkAuth);
router.get('/users-list', userController.getAllUsers);
router.post('/create-user', userController.addUser);
router.put('/update-role/:userId', userController.updateUserRole);
router.get('/get-superviseur', userController.getSuperviseurs);
router.get('/get-technicien', userController.getTechniciens);

module.exports = router;