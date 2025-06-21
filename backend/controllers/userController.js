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

    console.log("user******: ",user)

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

    req.login(user, (err) => {
      if (err) return next(err);
      
      // Si "Remember Me" est coché, prolongez la session
      if (req.body.rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours
      } else {
        req.session.cookie.expires = false; // Session du navigateur seulement
      }

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