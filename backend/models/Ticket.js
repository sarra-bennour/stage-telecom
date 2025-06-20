const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  statut: {type: String, enum: ['ouvert', 'en_cours', 'résolu'], default: 'ouvert'},
  date_creation: {type: Date, default: Date.now},
  date_cloture: Date,
  description_resolution: String,
  superviseur_id: {type: String, required: true},
  technicien_id: {type: String, required: true}
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);