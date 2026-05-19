import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { apiKeyAuth } from './middleware/apiKey';
import { adminAuth } from './middleware/adminAuth';
import { publicApiRateLimiter } from './middleware/rateLimit';
import { requestId } from './middleware/requestId';
import { mountSwagger } from './swagger';
import { campaignsRouter } from './routes/campaigns';
import { studentsRouter } from './routes/students';
import { donationsRouter } from './routes/donations';
import { webhooksRouter } from './routes/webhooks';
import { adminRouter } from './routes/admin';

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

// ── Global middleware ──────────────────────────────────────────────────────
// Swagger UI inline script'ler kullanır → CSP'yi kapat. Diğer header'lar açık.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE'] }));
app.use(requestId());
app.use(
  pinoHttp({
    genReqId: (req) => (req as any).id ?? 'unknown',
  }),
);
// Raw body — webhook receiver tarafında HMAC doğrulaması için gerekli olur.
app.use(
  express.json({
    limit: '256kb',
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf.toString('utf8');
    },
  }),
);

// ── Public docs (auth'suz) ─────────────────────────────────────────────────
mountSwagger(app);
app.get('/health', (_req, res) => res.json({ ok: true }));

// ── /v1: API key + rate limit ──────────────────────────────────────────────
const v1 = express.Router();
v1.use(apiKeyAuth());
v1.use(publicApiRateLimiter);

v1.use('/campaigns', campaignsRouter);
v1.use('/students', studentsRouter);
v1.use('/donations', donationsRouter);
v1.use('/webhooks', webhooksRouter);

app.use('/v1', v1);

// ── /admin: bearer token + (production'da ayrıca internal subnet/JWT) ──────
app.use('/admin', adminAuth(), adminRouter);

// ── Error handler ──────────────────────────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  req.log?.error({ err }, 'unhandled');
  res.status(500).json({
    error: { code: 'internal', message: 'Internal error', request_id: req.id },
  });
});

// Webhook worker ayrı process: `npm run worker` (src/worker.ts).

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[public-api] listening on :${PORT}  docs: http://localhost:${PORT}/docs`);
});

const shutdown = (signal: string) => {
  // eslint-disable-next-line no-console
  console.log(`[public-api] ${signal} — closing`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
