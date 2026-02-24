require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// 1. CONFIGURACIÓN
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true })); // Para leer el formulario
app.use('/public', express.static(`${process.cwd()}/public`));

// 2. BASE DE DATOS TEMPORAL (Un solo array de objetos es más seguro)
let urlDatabase = [];

// 3. RUTAS DE VISTA
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// 4. RUTA POST: CREAR URL CORTA
app.post('/api/shorturl', (req, res) => {
  const urlInput = req.body.url;
  
  // Regla estricta: debe tener http:// o https://
  const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

  if (!urlRegex.test(urlInput)) {
    return res.json({ error: 'invalid url' });
  }

  // Buscamos si ya existe para no duplicar
  let entry = urlDatabase.find(item => item.original_url === urlInput);
  
  if (!entry) {
    entry = {
      original_url: urlInput,
      short_url: urlDatabase.length + 1
    };
    urlDatabase.push(entry);
  }

  res.json({
    original_url: entry.original_url,
    short_url: entry.short_url
  });
});

// 5. RUTA GET: REDIRECCIÓN
app.get('/api/shorturl/:id', (req, res) => {
  const id = req.params.id; // Aquí captura el número (ej: el 5)
  
  // Aquí busca en tu "base de datos" el objeto que tiene ese número
  const entry = urlDatabase.find(item => item.short_url == id);

  if (entry) {
    // ESTA ES LA MAGIA: Aquí es donde ocurre la redirección física
    return res.redirect(entry.original_url); 
  } else {
    return res.json({ error: "No short URL found" });
  }
});
// 6. ESCUCHA DEL SERVIDOR
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
