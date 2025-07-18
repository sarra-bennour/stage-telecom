const mongoose = require('mongoose');

const antenneSchema = new mongoose.Schema({
  type: {type: String,enum: ['2G', '3G', '4G', '5G', 'autres'], required: true},
  nombre_antennes: Number,
  frequence: Number,
  HBA: Number,
  type_feeder: String,
  longueur_feeder: Number,
  observation: String,
  etat: {type: String,enum: ['actif', 'inactif', 'maintenance'], default: 'actif'},
  etat_serrage: Boolean,
  dernier_controle: Date,
  fournisseur: {type: String,enum: ['Kathrein', 'Jaybeam', 'Huawei', 'autres']},
  tilt: Number,
  azimut: Number,
  station: {type: mongoose.Schema.Types.ObjectId, ref: 'Station',required: true},
  createdBy: {type: mongoose.Schema.Types.ObjectId,ref: 'User',required: true}
}, { timestamps: true });

module.exports = mongoose.model('Antenne', antenneSchema);