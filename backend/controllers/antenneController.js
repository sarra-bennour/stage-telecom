const Antenne = require('../models/Antenne');
const Station = require('../models/Station');

// Créer une nouvelle antenne
exports.createAntenne = async (req, res) => {
  try {
    const { station, ...antenneData } = req.body;

    // Vérifier si la station existe
    const stationExists = await Station.findById(station);
    if (!stationExists) {
      return res.status(400).json({
        success: false,
        message: "La station spécifiée n'existe pas"
      });
    }

    const newAntenne = new Antenne({
      ...antenneData,
      station
    });

    const savedAntenne = await newAntenne.save();
    
    res.status(201).json({
      success: true,
      message: "Antenne créée avec succès",
      data: savedAntenne
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'antenne:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la création de l'antenne"
    });
  }
};

// Récupérer toutes les antennes
exports.getAntennes = async (req, res) => {
  try {
    const antennes = await Antenne.find().populate('station', 'nom _id');
    
    res.status(200).json({
      success: true,
      count: antennes.length,
      data: antennes
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des antennes:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la récupération des antennes"
    });
  }
};

// Mettre à jour une antenne
exports.updateAntenne = async (req, res) => {
  try {
    const { id } = req.params;
    const { station, ...updateData } = req.body;

    // Vérifier si la station existe si elle est fournie
    if (station) {
      const stationExists = await Station.findById(station);
      if (!stationExists) {
        return res.status(400).json({
          success: false,
          message: "La station spécifiée n'existe pas"
        });
      }
    }

    const updatedAntenne = await Antenne.findByIdAndUpdate(
      id,
      { ...updateData, ...(station && { station }) },
      { new: true, runValidators: true }
    );

    if (!updatedAntenne) {
      return res.status(404).json({
        success: false,
        message: "Antenne non trouvée"
      });
    }

    res.status(200).json({
      success: true,
      message: "Antenne mise à jour avec succès",
      data: updatedAntenne
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'antenne:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la mise à jour de l'antenne"
    });
  }
};

// Supprimer une antenne
// exports.deleteAntenne = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedAntenne = await Antenne.findByIdAndDelete(id);

//     if (!deletedAntenne) {
//       return res.status(404).json({
//         success: false,
//         message: "Antenne non trouvée"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Antenne supprimée avec succès"
//     });
//   } catch (error) {
//     console.error("Erreur lors de la suppression de l'antenne:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Erreur lors de la suppression de l'antenne"
//     });
//   }
// };