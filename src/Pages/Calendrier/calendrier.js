const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));  

mongoose.connect('mongodb://127.0.0.1:27017/projet-sp', {  // Mongodb DATA BASE
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const calendrierSchema = new mongoose.Schema(
  {
    eventName: String,
    eventDate: String,
    eventDescription: String,
    isAdmin: Boolean,
  },
  { collection: 'Calendrier' }  
);

const CalendrierEvent = mongoose.model('CalendrierEvent', calendrierSchema);  // Connection avec la collection

const secretKey = 'aaa';

const generateToken = (isAdmin) => {
  const payload = {
    isAdmin,
  };
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });  // Pas besoin de refresh ? 
};

const jwtMiddleware = (req, res, next) => {
  const authHeader = req.header('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Accès refusé. Token non fourni.' });
  }

  const token = authHeader.split(' ')[1]; 

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Token invalide.' });
  }
};

// -----------------------------------------POST--------------------------------------------------------

app.post('/ajouter-evenement', jwtMiddleware, async (req, res) => {
  try {
    const { eventName, eventDate, eventDescription } = req.body;

    const nouvelEvenement = new CalendrierEvent({
      eventName,
      eventDate,
      eventDescription,
      isAdmin: req.user.isAdmin,
    });
    await nouvelEvenement.save();

    res.status(201).json({ message: 'Événement ajouté avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'événement :', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'événement.' });
  }
});

// -----------------------------------------PUT--------------------------------------------------------

app.put('/modifier-evenement/:id', jwtMiddleware, async (req, res) => {
  const eventId = req.params.id;
  const { eventName, eventDate, eventDescription } = req.body;

  try {
    const existingEvent = await CalendrierEvent.findById(eventId);

    if (!existingEvent) {
      return res.status(404).json({ error: 'Événement non trouvé.' });
    }

    const updatedEvent = await CalendrierEvent.findByIdAndUpdate(
      eventId,
      { eventName, eventDate, eventDescription },
      { new: true }
    );

    if (updatedEvent) {
      res.json({ message: 'Événement modifié avec succès.' });
    } else {
      res.status(404).json({ error: 'Événement non trouvé.' });
    }
  } catch (error) {
    console.error('Erreur lors de la modification de l\'événement :', error);
    res.status(500).json({ error: 'Erreur lors de la modification de l\'événement.' });
  }
});

// -----------------------------------------Delete--------------------------------------------------------

app.delete('/supprimer-evenement/:id', jwtMiddleware, async (req, res) => {
  const eventId = req.params.id;

  try {
    const deletedEvent = await CalendrierEvent.findByIdAndRemove(eventId);

    if (deletedEvent) {
      res.json({ message: 'Événement supprimé avec succès.' });
    } else {
      res.status(404).json({ error: 'Événement non trouvé.' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement :', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'événement.' });
  }
});

// -----------------------------------------GET--------------------------------------------------------

app.get('/liste-evenements', jwtMiddleware, async (req, res) => {
  try {
    const isAdmin = req.user.isAdmin;

    const events = isAdmin
      ? await CalendrierEvent.find()
      : await CalendrierEvent.find({}, 'eventName eventDate _id'); 

    res.json({ events });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements :', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des événements.' });
  }
});



app.listen(port, () => {
  console.log(`Serveur écoutant sur le port ${port}`);
});
