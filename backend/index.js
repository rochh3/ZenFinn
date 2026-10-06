require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1); // detrás de Render/Railway/etc.
app.use(helmet());

// La app móvil no necesita CORS; solo se permiten los orígenes configurados (p. ej. Expo web en desarrollo).
const origins = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
// En desarrollo (NODE_ENV != production) se permite también cualquier localhost (Expo web).
const isDevLocalhost = (o) => process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o || '');
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || origins.includes(origin) || isDevLocalhost(origin)),
  })
);

// Guardamos el body crudo: Meta firma el cuerpo exacto y hay que verificarlo.
app.use(
  express.json({
    limit: '50kb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use('/api/webhook', require('./src/routes/webhook'));
app.use('/api', require('./src/routes/api'));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  console.error(err);
  res.status(500).json({ error: 'Error interno' });
});

app.listen(PORT, () => console.log(`ZenFin API escuchando en el puerto ${PORT}`));
