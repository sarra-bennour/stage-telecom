const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  num_ticket: { type: String, default: () => Math.random().toString(36).substring(2, 10).toUpperCase() },
  statut: {type: String, enum: ['ouvert', 'en_cours', 'résolu'], default: 'ouvert'},
  date_creation: {type: Date, default: Date.now},
  date_cloture: Date,
  description_resolution: String,
  superviseur_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User',required: true},
  technicien_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User',required: true}
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);