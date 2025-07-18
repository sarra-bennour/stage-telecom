const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  nom: {type: String, required: true},
  position_x: {type: Number, required: true},
  position_y: {type: Number, required: true},
  statut: {type: String, enum: ['actif', 'maintenance'], default: 'actif'},
  type_technique: {type: String,enum: ['micro', 'macro', 'indoor','outdoor'], required: true},
  accessibilite: Boolean,
  generation: {type: String,enum: ['2G', '3G', '4G', '5G', 'autres']},
  fournisseur: {type: String,enum: ['Huawei', 'Alcatel', 'NokiaSiemens', 'autres']},
  montant_location: Number,
  type_support: {type: String,enum: ['mat', 'monopole', 'pilone']},
  hauteur_support: Number,
  configuration: String,
  images_secteurs: [String],
  puissance: Number,
  date_installation: Date,
  derniere_maintenance: Date,
  audits: [{type: mongoose.Schema.Types.ObjectId, ref: 'Audit'}],
  transmissions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Transmission'}],
  derangements: [{type: mongoose.Schema.Types.ObjectId, ref: 'Derangement'}],
  createdBy: {type: mongoose.Schema.Types.ObjectId,ref: 'User',required: true}
}, { timestamps: true });


module.exports = mongoose.model('Station', stationSchema);