const Station = require('../models/Station');
const path = require('path');
const fs = require('fs');
const History = require('../models/Historique');


// Contrôleur pour créer une nouvelle station
exports.createStation = async (req, res) => {
  try {
    const stationData = req.body;
    
    // Validation des données requises
    if (!stationData.nom || !stationData.position_x || !stationData.position_y || !stationData.type_technique) {
      // Supprimer les fichiers uploadés si validation échoue
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          fs.unlinkSync(path.join(__dirname, `../public/uploads/${file.filename}`));
        });
      }
      return res.status(400).json({ 
        success: false,
        message: 'Les champs nom, position_x, position_y et type_technique sont obligatoires' 
      });
    }

    // Gestion des images uploadées - stockage des URLs seulement
    if (req.files && req.files.length > 0) {
        stationData.images_secteurs = req.files.map(file => `/uploads/${file.filename}`);
    }

    const newStation = new Station(stationData);
    await newStation.save();

    // Enregistrement direct de l'historique
      await History.create({
        action: `Création de la station ${newStation.nom}`,
        entity: 'Station',
        entityId: newStation._id,
        user: req.body.createdBy
      });
    
    
    res.status(201).json({
      success: true,
      data: newStation,
      message: 'Station créée avec succès'
    });
  } catch (error) {
    // Supprimer les fichiers uploadés en cas d'erreur
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlinkSync(path.join(__dirname, `../public/uploads/${file.filename}`));
      });
    }
    
    console.error('Erreur lors de la création de la station:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de la création de la station',
      error: error.message 
    });
  }
};

// Contrôleur pour supprimer une image
exports.deleteImage = async (req, res) => {
  try {
    const { stationId, imageUrl } = req.params;
    const station = await Station.findById(stationId);
    
    if (!station) {
      return res.status(404).json({ 
        success: false,
        message: 'Station non trouvée' 
      });
    }

    // Extraire le nom du fichier à partir de l'URL
    const filename = imageUrl.split('/uploads/')[1];
    if (!filename) {
      return res.status(400).json({ 
        success: false,
        message: 'URL d\'image invalide' 
      });
    }

    // Supprimer le fichier physique
    const filePath = path.join(__dirname, `../public/uploads/${filename}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Supprimer la référence dans la station
    station.images_secteurs = station.images_secteurs.filter(img => img !== imageUrl);
    await station.save();

    res.json({
      success: true,
      message: 'Image supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'image',
      error: error.message 
    });
  }
};



exports.getStationList = async (req, res) => {
  try {
    // Extraire les paramètres de requête
    const { search, type, status, sort } = req.query;
    
    // Construire l'objet de filtrage
    const filter = {};
    
    // Filtre de recherche (nom, type_technique ou fournisseur)
    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { type_technique: { $regex: search, $options: 'i' } },
        { fournisseur: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtre par type
    if (type) {
      filter.type_technique = type;
    }
    
    // Filtre par statut
    if (status) {
      filter.statut = status;
    }

    // Options de tri
    let sortOption = { date_installation: -1 };
    
    switch (sort) {
      case 'oldest':
        sortOption = { date_installation: 1 };
        break;
      case 'name':
        sortOption = { nom: 1 };
        break;
      case 'power':
        sortOption = { puissance: -1 };
        break;
      default:
        sortOption = { date_installation: -1 };
    }

    // Exécuter la requête
    const stations = await Station.find(filter)
      .sort(sortOption)
      .lean();

    // Calculer les statistiques pour les cartes d'information
    const totalStations = await Station.countDocuments();
    const activeStations = await Station.countDocuments({ statut: 'actif' });
    const maintenanceStations = await Station.countDocuments({ statut: 'maintenance' });
    const totalPower = await Station.aggregate([
      { $group: { _id: null, total: { $sum: "$puissance" } } }
    ]);


    res.status(200).json({
      success: true,
      count: stations.length,
      data: stations,
      stats: {
        totalStations,
        activeStations,
        maintenanceStations,
        totalPower: totalPower[0]?.total || 0,
        avgPower: totalStations > 0 ? Math.round(totalPower[0]?.total / totalStations) || 0 : 0
      }
    });

  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des stations'
    });
  }
};


// Méthode pour mettre à jour une station
exports.updateStation = async (req, res) => {
  try {
    const stationId = req.params.id;
    const updateData = req.body;

    // Récupérer la station existante
    const existingStation = await Station.findById(stationId);
    if (!existingStation) {
      return res.status(404).json({
        success: false,
        message: "Station non trouvée"
      });
    }

    // Initialiser avec les images existantes
    let allImages = existingStation.images_secteurs || [];

    // Gestion des images existantes à conserver
    if (req.body.existingImages) {
      // Si existingImages est déjà un tableau (cas où le frontend l'envoie correctement)
      if (Array.isArray(req.body.existingImages)) {
        allImages = req.body.existingImages;
      } 
      // Si c'est une chaîne qui pourrait être du JSON
      else if (typeof req.body.existingImages === 'string') {
        try {
          const parsedImages = JSON.parse(req.body.existingImages);
          if (Array.isArray(parsedImages)) {
            allImages = parsedImages;
          }
        } catch (e) {
          console.error("Erreur parsing existingImages:", e);
          // Si le parsing échoue, on suppose que c'est une URL simple
          allImages = [req.body.existingImages];
        }
      }
    }

    // Gestion des nouvelles images
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(file => `/uploads/${file.filename}`);
      allImages = [...allImages, ...newImagePaths];
    }

    // Mettre à jour avec toutes les images
    updateData.images_secteurs = allImages;

    const updatedStation = await Station.findByIdAndUpdate(
      stationId,
      updateData,
      { new: true, runValidators: true }
    );

    // Enregistrement direct de l'historique
      await History.create({
        action: `Mise à jour de la station ${updateData.nom}`,
        entity: 'Station',
        entityId: stationId,
        user: updateData.createdBy
      });

    res.status(200).json({
      success: true,
      message: "Station mise à jour avec succès",
      data: updatedStation
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la mise à jour de la station"
    });
  }
};