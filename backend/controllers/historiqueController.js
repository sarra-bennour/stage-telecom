const History = require('../models/History');
const User = require('../models/User');

// Récupérer tout l'historique
exports.getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const histories = await History.find()
      .populate('user', 'nom prenom')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await History.countDocuments();

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