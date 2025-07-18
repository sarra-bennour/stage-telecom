const mongoose = require('mongoose');

const derangementSchema = new mongoose.Schema({
  type: {type: String, enum: ['énergie', 'environnement', 'transmission', 'hardware', 'software', 'qualité'], required: true},
  priorite: {type: String, enum: ['faible', 'moyenne', 'haute'], default: 'moyenne'},
  description: String,
  date_occurrence: {type: Date, default: Date.now},
  ticket: {type: mongoose.Schema.Types.ObjectId, ref: 'Ticket',required: true},
  createdBy: {type: mongoose.Schema.Types.ObjectId,ref: 'User',required: true}
}, { timestamps: true });

module.exports = mongoose.model('Derangement', derangementSchema);