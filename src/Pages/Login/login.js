const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3111;

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/projet-sp', {  // Connection avec la DB
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
}, { collection: 'Authentification' });    // Connection avec la collection 

const User = mongoose.model('User', userSchema);

const secretKey = 'aaa'; // PENSER A SECURISER LA CLEE

const generateToken = (user) => {
  const payload = {
    username: user.username,
    role: user.role,
  };
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

const authenticateUser = async (req, res, next) => {
  const { username, password, role } = req.body;

  try {
    const user = await User.findOne({ username, password, role });

    if (user) {
      const token = generateToken(user);
      req.user = user;
      res.json({ message: 'Connexion réussie.', isAdmin: user.role === 'admin', role: user.role, token });
    } else {
      res.status(401).json({ error: 'Nom d\'utilisateur, mot de passe ou rôle incorrect.' });
    }
  } catch (error) {
    console.error('Erreur lors de l\'authentification de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur lors de l\'authentification.' });
  }
};

const jwtMiddleware = (req, res, next) => {
  const authHeader = req.header('authorization');

  if (!authHeader) return res.status(401).json({ error: 'Accès refusé. Token non fourni.' });

  const token = authHeader.split(' ')[1]; 

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Token invalide.' });
  }
};

// -----------------------------------------CHAT GPT?--------------------------------------------------------

app.post('/login', authenticateUser, (req, res) => {
  const redirectUrl = req.user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard';
  res.json({ message: 'Connexion réussie.', redirectUrl, isAdmin: req.user.role === 'admin', role: req.user.role });
});


app.get('/liste-evenements', jwtMiddleware, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin'; 

    const events = isAdmin
      ? await CalendrierEvent.find()
      : await CalendrierEvent.find({}, 'eventName eventDate _id');

    res.json({ events });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements :', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des événements.' });
  }
});

app.get('/user-dashboard', jwtMiddleware, (req, res) => {
  res.send(`Page utilisateur pour ${req.user.username}`);
});

app.listen(port, () => {
  console.log(`Serveur écoutant sur le port ${port}`);
});
