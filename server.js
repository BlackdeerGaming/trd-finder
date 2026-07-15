import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// CORS_ORIGIN es opcional: si se define (p. ej. "https://www.blackdeerbrand.com"),
// solo ese origen podrá llamar a la API. Sin definir, queda abierto (útil mientras se prueba el despliegue).
app.use(cors(process.env.CORS_ORIGIN ? { origin: process.env.CORS_ORIGIN } : {}));
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'convocatorias.json');
const LEADS_FILE = path.join(__dirname, 'data', 'leads.json');

app.get('/api/convocatorias', (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error al leer el archivo de datos:', error);
    res.status(500).json({ error: 'Fallo al obtener convocatorias.' });
  }
});

app.get('/api/leads', (req, res) => {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error al leer el archivo de leads:', error);
    res.status(500).json({ error: 'Fallo al obtener clientes potenciales.' });
  }
});

let scraperRunning = false;

app.post('/api/scraper/run', (req, res) => {
  if (scraperRunning) {
    return res.status(409).json({ message: 'El agente ya se está ejecutando.', status: 'BUSY' });
  }

  console.log('Iniciando scraper on-demand...');
  scraperRunning = true;
  const scraperPath = path.join(__dirname, 'agent', 'agent-scraper.js');

  execFile(process.execPath, [scraperPath], { cwd: __dirname }, (error, stdout, stderr) => {
    scraperRunning = false;
    if (stdout) console.log(stdout.trim());
    if (stderr) console.error(stderr.trim());

    if (error) {
      return res.status(500).json({ message: 'Fallo la ejecución del agente.', status: 'ERROR', detail: error.message });
    }

    res.json({ message: 'Agente ejecutado correctamente', status: 'OK', log: stdout.trim() });
  });
});

// cPanel (Passenger) y otros hosts Node asignan el puerto mediante process.env.PORT;
// en local, sin esa variable, sigue usando 3001 como antes.
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend de ConvocatoriasTRDExplorer corriendo en el puerto ${PORT}`);
});
