const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  date_audit: {type: Date, default: Date.now},
  type_audit: {type: String, enum: ['annuel', 'technique'], required: true},
  observations: [String],
  ticket: {type: mongoose.Schema.Types.ObjectId, ref: 'Ticket'},
}, { timestamps: true });

module.exports = mongoose.model('Audit', auditSchema);