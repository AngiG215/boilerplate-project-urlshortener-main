require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// 1. CONFIGURACIÓN BÁSICA
const port = process.env.PORT || 4000;

app.use(cors());

// ESTO ES NUEVO: Necesario para leer lo que envías en el formulario (POST)
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// 2. BASE DE DATOS TEMPORAL (En memoria)
const originalUrls = [];
const shortUrls = [];

// 3. RUTA POST: Aquí es donde creas el número corto
app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;
  
  // Validación de formato de URL
  const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
  
  if (!urlRegex.test(url)) {
    return res.json({ error: 'invalid url' });
  }

  // Guardamos la URL y le asignamos un número
  const index = originalUrls.indexOf(url);
  if (index === -1) {
    originalUrls.push(url);
    shortUrls.push(shortUrls.length + 1);
    return res.json({
      original_url: url,
      short_url: shortUrls.length
    });
  }

  res.json({
    original_url: url,
    short_url: shortUrls[index]
  });
});

// 4. RUTA GET: Aquí es donde el número te lleva a la web original
app.get('/api/shorturl/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = shortUrls.indexOf(id);
  
  if (index === -1) {
    return res.json({ error: "No short URL found" });
  }
  
  // Redireccionamos a la página real
  res.redirect(originalUrls[index]);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
