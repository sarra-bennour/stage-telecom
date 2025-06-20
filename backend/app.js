require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
//const cookieParser = require('cookie-parser');
//const logger = require('morgan');
const mongo = require('mongoose');
const http = require('http');
const bodyparser = require('body-parser');
//const transporter = require('./utils/emailConfig'); // Import the transporter from middleware
//const MongoStore = require('connect-mongo');
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

const usersRouter = require('./routes/userRoute');


const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true, // Allow cookies to be sent/received
}));

// View engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'twig');



// Middleware
//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session configuration
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET, // Use a secure secret key
//     resave: false,
//     saveUninitialized: true,
//     store: MongoStore.create({
//       mongoUrl: db.url, // MongoDB connection URL
//       ttl: 24 * 60 * 60, // Session TTL (1 day)
//     }),
//     cookie: {
//       secure: false, // Set to true if using HTTPS
//       httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
//       maxAge: 1000 * 60 * 60 * 24, // 1 day
//       sameSite: 'lax', // Prevent CSRF attacks
//     },
//   })
// );


// Configuration des sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 jour
}));

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
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});


// // Routes
 app.use('/users', usersRouter);

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