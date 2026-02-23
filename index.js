require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// 1. CONFIGURACIÓN BÁSICA
const port = process.env.PORT || 3000;

app.use(cors());

// Middleware para leer datos del formulario POST
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
  
  // Validación de formato de URL (muy importante para freeCodeCamp)
  const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
  
  if (!urlRegex.test(url)) {
    return res.json({ error: 'invalid url' });
  }

  // Guardamos la URL si no existe
  let index = originalUrls.indexOf(url);
  if (index === -1) {
    originalUrls.push(url);
    shortUrls.push(shortUrls.length + 1);
    index = originalUrls.length - 1;
  }

  res.json({
    original_url: url,
    short_url: shortUrls[index]
  });
});

// 4. RUTA GET: Redirección (Aquí estaba el error de llaves)
app.get('/api/shorturl/:id', (req, res) => {
  const id = req.params.id;
  
  // Buscamos el índice usando el ID que viene en la URL
  const index = shortUrls.findIndex(s => s == id);
  
  if (index === -1) {
    return res.json({ error: "No short URL found" });
  }
  
  // Redireccionamos a la URL original
  res.redirect(originalUrls[index]);
});

// 5. INICIO DEL SERVIDOR (Único en el archivo)
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
