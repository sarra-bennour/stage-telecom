const Ticket = require('../models/Ticket');
const History = require('../models/Historique');


// Créer un nouveau ticket
exports.createTicket = async (req, res) => {
  try {
    const ticket = new Ticket(req.body);
    await ticket.save();

    // Enregistrement direct de l'historique
          await History.create({
            action: `Création du ticket ${ticket.titre}`,
            entity: 'Ticket',
            entityId: ticket._id,
            user: ticket.createdBy
          });
    

    res.status(201).json({
      success: true,
      message: 'Ticket créé avec succès',
      data: ticket
    });
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du ticket',
      error: error.message
    });
  }
};

// Obtenir la liste des tickets
exports.getTicketList = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ date_creation: -1 }).populate('superviseur_id technicien_id' , 'nom prenom');;
    
    res.status(200).json({
      success: true,
      message: 'Liste des tickets récupérée avec succès',
      data: tickets
    });
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tickets',
      error: error.message
    });
  }
};

// Mettre à jour un ticket
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Si le statut est mis à "résolu", on ajoute la date de clôture
    if (updateData.statut === 'résolu' && !updateData.date_cloture) {
      updateData.date_cloture = new Date();
    }

    const ticket = await Ticket.findByIdAndUpdate(id, updateData, {
      new: true
    });

    // Enregistrement direct de l'historique
          await History.create({
            action: `Mise à jour du ticket ${ticket.titre}`,
            entity: 'Ticket',
            entityId: ticket._id,
            user: ticket.createdBy
          });


    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ticket mis à jour avec succès',
      data: ticket
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du ticket',
      error: error.message
    });
  }
};

// Supprimer un ticket
exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByIdAndDelete(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }

    // Enregistrement direct de l'historique
          await History.create({
            action: `Supression du ticket ${ticket.titre}`,
            entity: 'Ticket',
            entityId: ticket._id,
            user: ticket.createdBy
          });


    res.status(200).json({
      success: true,
      message: 'Ticket supprimé avec succès',
      data: ticket
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du ticket',
      error: error.message
    });
  }
};

// Obtenir un ticket par ID
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id).populate('superviseur_id technicien_id');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ticket récupéré avec succès',
      data: ticket
    });
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du ticket',
      error: error.message
    });
  }
};


exports.getTitres = async (req, res) => {
  try {
    const titres = await Ticket.distinct("titre")
    res.status(200).json({
      success: true,
      data: titres
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}