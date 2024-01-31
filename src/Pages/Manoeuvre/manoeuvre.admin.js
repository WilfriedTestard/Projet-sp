const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3005;

app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());


mongoose.connect('mongodb://127.0.0.1:27017/projet-sp'); // Connexion à la base de données MongoDB

mongoose.connection.on('error', (err) => {
  console.error('Erreur de connexion à MongoDB :', err);
});

mongoose.connection.once('open', () => {
  console.log('Connexion à la base de données réussie!');
});


const manoeuvreSchema = new mongoose.Schema({
  place: String,
  type: String,
  description: String,
}, { collection: 'Manoeuvre' });  // Connection à la collection 


const Manoeuvre = mongoose.model('Manoeuvre', manoeuvreSchema);


// -----------------------------------------POST--------------------------------------------------------
app.post('/creer-manoeuvre', async (req, res) => {
  try {
    const { place, type, description } = req.body;
    const nouvelleManoeuvre = new Manoeuvre({ place, type, description });
    await nouvelleManoeuvre.save();
    res.status(201).json({ message: 'Manœuvre créée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la création de la manœuvre :', error);
    res.status(500).json({ error: 'Erreur lors de la création de la manœuvre.' });
  }
});

// -----------------------------------------GET--------------------------------------------------------
app.get('/liste-manoeuvres', async (req, res) => {
  try {
    const manoeuvres = await Manoeuvre.find();
    res.json({ manoeuvres });
  } catch (error) {
    console.error('Erreur lors de la récupération des manœuvres :', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des manœuvres.' });
  }
});

// -----------------------------------------PUT--------------------------------------------------------
app.put('/modifier-manoeuvre/:id', async (req, res) => {
  try {
    let manoeuvreId = req.params.id.trim();

    console.log('Tentative de modification de la manœuvre avec l\'ID :', manoeuvreId);


    const manoeuvre = await Manoeuvre.findById(manoeuvreId); // Verif si manoeuvre exist

    if (!manoeuvre) {
      return res.status(404).json({ error: 'Manœuvre non trouvée.' });
    }

    // Mettre à jour les propriétés de la manoeuvre
    const { place, type, description } = req.body;
    manoeuvre.place = place;
    manoeuvre.type = type;
    manoeuvre.description = description;

    // Enregistrer la manoeuvre mise à jour
    await manoeuvre.save();
    console.log('Manoeuvre mise à jour:', manoeuvre);

    res.json({ message: 'Manœuvre modifiée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la modification de la manœuvre :', error);
  
    if (error.name === 'MongoError' && error.code === 11000) {
      console.error('Erreur de duplication détectée. Cela peut être dû à un problème d\'index unique.');
      res.status(400).json({ error: 'Erreur de duplication détectée.' });
    } else {
      res.status(500).json({ error: 'Erreur lors de la modification de la manœuvre.' });
    }
  }
});

// -----------------------------------------DELETE--------------------------------------------------------

app.delete('/supprimer-manoeuvre/:id', async (req, res) => {
  const manoeuvreId = req.params.id;

  try {
    const manoeuvre = await Manoeuvre.findByIdAndDelete(manoeuvreId);

    if (manoeuvre) {
      res.json({ message: 'Manœuvre supprimée avec succès.' });
    } else {
      res.status(404).json({ error: 'Manœuvre non trouvée.' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la manœuvre :', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la manœuvre.' });
  }
});


app.listen(port, () => {
  console.log(`Serveur écoutant sur le port ${port}`);
});
