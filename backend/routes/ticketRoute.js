const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

// Routes CRUD pour les tickets
router.post('/create-ticket', ticketController.createTicket);
router.get('/ticket-list', ticketController.getTicketList);
router.put('/update-ticket/:id', ticketController.updateTicket);
router.delete('/delete-ticket/:id', ticketController.deleteTicket);
router.get('/ticket/:id', ticketController.getTicketById);

module.exports = router;