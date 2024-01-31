// IL FAUDRAIT RELIER CELA A LA DB PLUTOT QUE DE CODER EN DUR? 


const express = require('express');
const multer = require('multer');

const app = express();
const port = 3001;


const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });


const photos = [];


app.use(express.json());

// -----------------------------------------POST--------------------------------------------------------

app.post('/ajouter-photo', upload.single('photo'), (req, res) => {


  const { originalname, buffer } = req.file;


  photos.push({
    id: photos.length + 1, 
    name: originalname,
    data: buffer.toString('base64') 
  });

  res.status(201).json({ message: 'Photo ajoutée avec succès.' });
});

// -----------------------------------------GET--------------------------------------------------------

app.get('/liste-photos', (req, res) => {
  res.json({ photos });
});

// -----------------------------------------DELETE--------------------------------------------------------

app.delete('/supprimer-photo/:id', (req, res) => {
  const photoId = parseInt(req.params.id);


  const photoIndex = photos.findIndex(photo => photo.id === photoId);

  if (photoIndex !== -1) {

    photos.splice(photoIndex, 1);

    res.json({ message: 'Photo supprimée avec succès.' });
  } else {
    res.status(404).json({ error: 'Photo non trouvée.' });
  }
});


app.listen(port, () => {
  console.log(`Serveur écoutant sur le port ${port}`);
});
