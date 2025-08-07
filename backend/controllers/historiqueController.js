const History = require('../models/Historique');
const User = require('../models/User');

// Récupérer tout l'historique
exports.getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { userId, userRole } = req.body; // Récupération depuis le body
    
    // Créer un objet de requête de base
    let query = {};
    
    // Si l'utilisateur n'est pas admin, on filtre par son ID
    if (userRole !== 'admin') {
      query.user = userId;
    }
    // (Les admins voient tout sans filtre)

    const histories = await History.find(query)
      .populate('user', 'nom prenom role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await History.countDocuments(query);

    res.status(200).json({
      success: true,
      data: histories,
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération de l\'historique',
      error: error.message 
    });
  }
};