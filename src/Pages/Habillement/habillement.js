const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const port = 3001;


const transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: 'willur@outlook.com', // PENSER A CREER UNE ADRESSE MAIL QUE POUR CECI
    pass: '',  // PENSER A TROUVER UNE SOLUTION POUR NE PAS AVOIR BESOIN DECRIRE LE MDP
  },
});

app.use(cors()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// -----------------------------------------POST--------------------------------------------------------

app.post('/habillement', (req, res) => {
  const { prenom, nom, mail, centre, description } = req.body;

  if (!prenom || !nom || !mail || !centre || !description) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  // Configurer le contenu du courriel
  const mailOptions = {
    from: 'willur@outlook.com',
    to: 'wilfried.testard@sdis35.fr',
    subject: 'Nouvelle demande d\'habillement',
    text: `Prénom: ${prenom}\nNom: ${nom}\nMail: ${mail}\nCentre de secours: ${centre}\nDescription: ${description}`,
  };

  // Envoyer le courriel
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ error: `Erreur lors de l'envoi du courriel : ${error.message}` });
    }
    res.status(200).json({ success: 'Le courriel a été envoyé avec succès.' });
  });
});


app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
