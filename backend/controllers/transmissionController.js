const Transmission = require('../models/Transmission');

// Créer une nouvelle transmission
exports.createTransmission = async (req, res) => {
  try {
    const transmission = new Transmission(req.body);
    await transmission.save();

    res.status(201).json({
      success: true,
      message: 'Transmission créée avec succès',
      data: transmission
    });
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la transmission',
      error: error.message
    });
  }
};

// Obtenir la liste des transmissions
exports.getTransmissionList = async (req, res) => {
  try {
    const transmissions = await Transmission.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      message: 'Liste des transmissions récupérée avec succès',
      data: transmissions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des transmissions',
      error: error.message
    });
  }
};

// Mettre à jour une transmission
exports.updateTransmission = async (req, res) => {
  try {
    const { id } = req.params;
    const transmission = await Transmission.findByIdAndUpdate(id, req.body, {
      new: true
    });

    if (!transmission) {
      return res.status(404).json({
        success: false,
        message: 'Transmission non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transmission mise à jour avec succès',
      data: transmission
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la transmission',
      error: error.message
    });
  }
};

// Supprimer une transmission
exports.deleteTransmission = async (req, res) => {
  try {
    const { id } = req.params;
    const transmission = await Transmission.findByIdAndDelete(id);

    if (!transmission) {
      return res.status(404).json({
        success: false,
        message: 'Transmission non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transmission supprimée avec succès',
      data: transmission
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la transmission',
      error: error.message
    });
  }
};