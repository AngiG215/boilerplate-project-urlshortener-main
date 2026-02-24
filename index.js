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

// 4. RUTA POST (Ajustada para pasar el test)
app.post('/api/shorturl', (req, res) => {
  const urlInput = req.body.url;
  
  // Usamos una validación más sencilla pero efectiva que pide FCC
  try {
    const urlObj = new URL(urlInput);
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return res.json({ error: 'invalid url' });
    }
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  // Guardar en la "DB"
  let entry = urlDatabase.find(item => item.original_url === urlInput);
  if (!entry) {
    entry = {
      original_url: urlInput,
      short_url: urlDatabase.length + 1
    };
    urlDatabase.push(entry);
  }

  return res.json({
    original_url: entry.original_url,
    short_url: entry.short_url
  });
});

// 5. RUTA GET (Forzando el éxito del test)
app.get('/api/shorturl/:id', (req, res) => {
  const id = req.params.id;
  // Buscamos con == para evitar líos de tipos de datos
  const entry = urlDatabase.find(item => item.short_url == id);

  if (entry) {
    // IMPORTANTE: res.status(301) ayuda a que el test vea la redirección clara
    return res.redirect(entry.original_url);
  } else {
    return res.json({ error: "No short URL found" });
  }
});
// 6. ESCUCHA DEL SERVIDOR
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
