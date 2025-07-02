const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const axios = require('axios');
const LocalStrategy = require('passport-local').Strategy;


exports.signup = async (req, res) => {
  try {
    const { nom, prenom, email, password, role, tel, recaptchaToken } = req.body;

    // 1. Vérifier reCAPTCHA
    const recaptchaResponse = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
        },
      }
    );

    if (!recaptchaResponse.data.success) {
      return res.status(400).json({
        status: 'fail',
        message: 'Échec de la vérification reCAPTCHA',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      nom,
      prenom,
      email,
      password: hashedPassword,
      role,
      tel
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          nom: user.nom,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};




exports.login = async (req, res, next) => {
  const { email, password, rememberMe, recaptchaToken } = req.body;

  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
        },
      }
    );

    if (!response.data.success) {
      return res.status(400).json({
        status: 'fail',
        message: 'Échec de la vérification reCAPTCHA',
      });
    }
  } catch (err) {
    return next(err);
  }

  // Authentification normale
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: info.message,
      });
    }

    req.login(user, (err) => {
      if (err) return next(err);
      
      if (rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours
      } else {
        req.session.cookie.expires = false;
      }

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user._id,
            nom: user.nom,
            email: user.email,
            role: user.role,
          },
        },
      });
    });
  })(req, res, next);
};




exports.logout = (req, res) => {
  req.logout(() => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Erreur lors de la destruction de la session:', err);
        return res.status(500).json({ status: 'error', message: 'Échec de la déconnexion' });
      }
      res.clearCookie('connect.sid', {
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? 'votredomaine.com' : 'localhost'
      });
      res.status(200).json({ status: 'success', message: 'Déconnexion réussie' });
    });
  });
};


exports.checkAuth = (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({ 
      status: 'success',
      data: {
        user: req.user // Renvoie directement l'utilisateur de la session
      }
    });
  }
  
  res.status(401).json({ 
    status: 'fail', 
    message: 'Non authentifié'
  });
};


// Récupérer tous les superviseurs
exports.getSuperviseurs = async (req, res) => {
  try {
    const superviseurs = await User.find({ role: 'superviseur' })
      .select('-password') // Exclure le mot de passe
      .sort({ nom: 1 }); // Trier par nom

    res.status(200).json({
      success: true,
      message: 'Liste des superviseurs récupérée avec succès',
      data: superviseurs
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des superviseurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des superviseurs',
      error: error.message
    });
  }
};

// Récupérer tous les techniciens
exports.getTechniciens = async (req, res) => {
  try {
    const techniciens = await User.find({ role: 'technicien' })
      .select('-password') // Exclure le mot de passe
      .sort({ nom: 1 }); // Trier par nom

    res.status(200).json({
      success: true,
      message: 'Liste des techniciens récupérée avec succès',
      data: techniciens
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des techniciens:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des techniciens',
      error: error.message
    });
  }
};