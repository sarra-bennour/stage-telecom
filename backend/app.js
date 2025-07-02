require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const mongo = require('mongoose');
const http = require('http');
const bodyparser = require('body-parser');
const MongoStore = require('connect-mongo');
const User = require('./models/User')
const bcrypt = require('bcryptjs');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Connect to MongoDB
mongo
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log(err);
  });



const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // Autorise les credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configuration de la session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 30 * 24 * 60 * 60 //session expire apres 30 jours
    }),
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: 'lax',
    },
  })
);


// Middleware
//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));



// Initialisation de Passport
app.use(passport.initialize());
app.use(passport.session());

// Stratégie locale
passport.use(new LocalStrategy({
  usernameField: 'email'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return done(null, false, { message: 'Email incorrect' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return done(null, false, { message: 'Mot de passe incorrect' });
    
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Sérialisation de l'utilisateur
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Désérialisation de l'utilisateur
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password'); // Exclure le mot de passe
    if (!user) {
      return done(new Error('Utilisateur non trouvé'));
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
});


// Routes
const usersRouter = require('./routes/userRoute');
const stationRouter = require('./routes/stationRoute');
const antenneRouter = require('./routes/antenneRoute');
const transmissionRouter = require('./routes/transmissionRoute');
const derangementRouter = require('./routes/derangementRoute');
const ticketRouter = require('./routes/ticketRoute');


app.use('/users', usersRouter);
app.use('/stations', stationRouter);
app.use('/antennes', antenneRouter);
app.use('/transmissions', transmissionRouter);
app.use('/derangements', derangementRouter);
app.use('/tickets', ticketRouter);


// Middleware de vérification d'authentification
const requireAuth = (req, res, next) => {
  console.log('Session verification:', {
    sessionID: req.sessionID,
    authenticated: req.isAuthenticated(),
    user: req.user
  });
  
  if (req.isAuthenticated()) return next();
  
  console.warn('Unauthorized access attempt', {
    headers: req.headers,
    cookies: req.cookies
  });
  
  res.status(401).json({ 
    status: 'fail', 
    message: 'Non authentifié',
    session: req.session 
  });
};

// Error handling
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.json({ message: "error" });
});

  
// Start server
server.listen(3000, () => {
  console.log('Server is running on port 3000');
});