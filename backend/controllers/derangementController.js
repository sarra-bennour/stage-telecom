const Derangement = require('../models/Derangement');
const History = require('../models/Historique');

// Créer un nouveau dérangement
exports.createDerangement = async (req, res) => {
  try {
    const derangement = new Derangement(req.body);
    await derangement.save();

    // Enregistrement direct de l'historique
          await History.create({
            action: `Création du dérangement de type ${derangement.type} de ${derangement.description}`,
            entity: 'Dérangement',
            entityId: derangement._id,
            user: derangement.createdBy
          });

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

    // Enregistrement direct de l'historique
          await History.create({
            action: `Mise à jour du dérangement de type ${derangement.type} de fournisseur ${derangement.description}`,
            entity: 'Dérangement',
            entityId: derangement._id,
            user: derangement.createdBy
          });

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

    // Enregistrement direct de l'historique
          await History.create({
            action: `Suppression du dérangement de type ${derangement.type} de fournisseur ${derangement.description}`,
            entity: 'Dérangement',
            entityId: derangement._id,
            user: derangement.createdBy
          });

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