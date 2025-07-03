const Derangement = require('../models/Derangement');

// Créer un nouveau dérangement
exports.createDerangement = async (req, res) => {
  try {
    const derangement = new Derangement(req.body);
    await derangement.save();

    res.status(201).json({
      success: true,
      message: 'Dérangement créé avec succès',
      data: derangement
    });
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du dérangement',
      error: error.message
    });
  }
};

// Obtenir la liste des dérangements
exports.getDerangementList = async (req, res) => {
  try {
    const derangements = await Derangement.find()
      .populate({
        path: 'ticket',
        select: 'num_ticket statut' // Spécifiez explicitement les champs à peupler
      })
      .sort({ date_occurrence: -1 });
    
    res.status(200).json({
      success: true,
      message: 'Liste des dérangements récupérée avec succès',
      data: derangements
    });
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des dérangements',
      error: error.message
    });
  }
};

// Mettre à jour un dérangement
exports.updateDerangement = async (req, res) => {
  try {
    const { id } = req.params;
    const derangement = await Derangement.findByIdAndUpdate(id, req.body, {
      new: true
    }).populate('ticket', 'numero titre statut');

    if (!derangement) {
      return res.status(404).json({
        success: false,
        message: 'Dérangement non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Dérangement mis à jour avec succès',
      data: derangement
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du dérangement',
      error: error.message
    });
  }
};

// Supprimer un dérangement
exports.deleteDerangement = async (req, res) => {
  try {
    const { id } = req.params;
    const derangement = await Derangement.findByIdAndDelete(id);

    if (!derangement) {
      return res.status(404).json({
        success: false,
        message: 'Dérangement non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Dérangement supprimé avec succès',
      data: derangement
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du dérangement',
      error: error.message
    });
  }
};