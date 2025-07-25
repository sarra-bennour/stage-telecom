const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: {type: String, required: true},
  prenom: {type: String, required: true},
  email: {type: String, required: true  },
  password: { type: String, required: true },
  role: {type: String, enum: ['admin', 'superviseur', 'technicien'], required: true},
  tel: {type: Number,required: true,unique: true
  }
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);