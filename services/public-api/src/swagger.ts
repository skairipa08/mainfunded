import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

/**
 * Swagger UI'ı /docs altında, raw spec'i /openapi.yaml altında sunar.
 * OpenAPI dosyası repo köküne (services/public-api/openapi.yaml) yazıldı.
 */
export function mountSwagger(app: Express) {
  const specPath = path.resolve(__dirname, '../openapi.yaml');
  const raw = fs.readFileSync(specPath, 'utf8');
  const spec = YAML.parse(raw);

  app.get('/openapi.yaml', (_req, res) => {
    res.type('text/yaml').send(raw);
  });
  app.get('/openapi.json', (_req, res) => {
    res.json(spec);
  });

  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      customSiteTitle: 'FundEd Public API',
      swaggerOptions: { persistAuthorization: true },
    }),
  );
}
