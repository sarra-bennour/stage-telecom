const mongoose = require('mongoose');

const transmissionSchema = new mongoose.Schema({
  type: {type: String,enum: ['hdsl', 'fibre', 'faisceau', 'autres'], required: true},
  configuration: {type: String, enum: ['1+1', '1+0']},
  debit: Number,
  fournisseur: String,
  observation: String,
  date_installation: Date,
  date_derniere_maintenance: Date,
}, { timestamps: true });

module.exports = mongoose.model('Transmission', transmissionSchema);