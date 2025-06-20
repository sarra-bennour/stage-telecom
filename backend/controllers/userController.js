const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


exports.signup = async (req, res) => {
  try {
    const { nom, prenom, email, password, role, tel } = req.body;
    
    // Hashage du mot de passe avant création
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


exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: info.message
      });
    }
    
    req.logIn(user, (err) => {
      if (err) return next(err);
      
      return res.status(200).json({
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
    });
  })(req, res, next);
};

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    // Destruction de la session
    req.session.destroy((err) => {
      if (err) {
        console.error('Erreur lors de la destruction de la session:', err);
        return res.status(500).json({ status: 'error', message: 'Échec de la déconnexion' });
      }
      // Effacer le cookie côté client
      res.clearCookie('connect.sid');
      res.status(200).json({ status: 'success', message: 'Déconnexion réussie' });
    });
  });
};

exports.checkAuth = (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: req.user._id,
          nom: req.user.nom,
          email: req.user.email,
          role: req.user.role
        }
      }
    });
  }
  res.status(401).json({ status: 'fail', message: 'Non authentifié' });
};