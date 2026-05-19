# FundEd Public API

Okul ve üçüncü taraf entegrasyonları için bağımsız Node.js/Express + PostgreSQL servisi.

## Kurulum

```bash
cd services/public-api
npm install

# Postgres şeması
export DATABASE_URL=postgres://user:pass@localhost:5432/funded_public
npm run migrate

# Çalıştır
export REDIS_URL=redis://localhost:6379         # opsiyonel (dağıtık rate limit)
export RUN_WEBHOOK_WORKER=1                     # in-process worker'ı aç
npm run dev
```

- Swagger UI: <http://localhost:4000/docs>
- Health: <http://localhost:4000/health>
- OpenAPI: <http://localhost:4000/openapi.yaml>

## Mimari özet

| Katman | Dosya |
| --- | --- |
| OpenAPI 3.0 şema | [openapi.yaml](openapi.yaml) |
| API key middleware | [src/middleware/apiKey.ts](src/middleware/apiKey.ts) |
| Rate limit (100 rpm) | [src/middleware/rateLimit.ts](src/middleware/rateLimit.ts) |
| HMAC sign + verify | [src/lib/hmac.ts](src/lib/hmac.ts) |
| Webhook gönderici (retry) | [src/services/webhookSender.ts](src/services/webhookSender.ts) |
| API key CRUD | [src/services/apiKeys.ts](src/services/apiKeys.ts) |
| Swagger UI mount | [src/swagger.ts](src/swagger.ts) |
| Postgres şema | [db/schema.sql](db/schema.sql) |

## Kullanım örnekleri

### 1. Yeni API key (admin)

```bash
curl -X POST http://localhost:4000/admin/api-keys \
  -H 'Content-Type: application/json' \
  -d '{"school_id":"sch_1","name":"İTÜ Integration","environment":"live"}'
# → { "api_key": "fk_live_…", "id": "…" }   ← yalnızca tek seferlik döner
```

### 2. Public endpoint çağrısı

```bash
curl http://localhost:4000/v1/campaigns?status=active \
  -H 'X-API-Key: fk_live_xxxxxxxx'
```

Response header'ları: `RateLimit-Remaining`, `RateLimit-Reset`, `X-FundEd-Environment`.

### 3. Sandbox modu

`fk_test_*` prefix'li key kullan. Tüm endpoint'ler gerçek dataya dokunmadan
sabit seed örnek dönecek — entegrasyon testi yapan ekipler için güvenli.

### 4. Webhook abonelik

```bash
curl -X POST http://localhost:4000/v1/webhooks/endpoints \
  -H 'X-API-Key: fk_live_xxx' \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://school.example/hooks/funded","events":["donation.created","campaign.completed"]}'
# → { "secret": "whsec_…", … }   ← HMAC için sakla
```

### 5. Webhook alıcı tarafta doğrulama

```ts
import express from 'express';
// `verify` fonksiyonu standalone — kopyala-yapıştır veya internal paket.
// Aşağıdaki snippet bağımlılık olarak public-api repo'sunu kullanmadan tek başına çalışır.
import crypto from 'node:crypto';

const TOLERANCE = 5 * 60;
function verify(raw: string, header: string | undefined, secret: string) {
  if (!header) return false;
  const parts: Record<string, string> = {};
  for (const seg of header.split(',')) {
    const i = seg.indexOf('=');
    if (i > 0) parts[seg.slice(0, i).trim()] = seg.slice(i + 1).trim();
  }
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > TOLERANCE) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex');
  const a = Buffer.from(expected, 'hex'); const b = Buffer.from(parts.v1 ?? '', 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const app = express();
app.use(express.json({ verify: (req, _r, buf) => ((req as any).rawBody = buf.toString('utf8')) }));

app.post('/hooks/funded', (req, res) => {
  const ok = verify(
    (req as any).rawBody,
    req.header('X-FundEd-Signature'),
    process.env.FUNDED_WEBHOOK_SECRET!,
  );
  if (!ok) return res.sendStatus(401);
  // req.body güvenle kullanılabilir
  res.sendStatus(200);
});
```

## Webhook retry stratejisi

`webhook_deliveries` tablosu outbox pattern'i ile çalışır.

| Deneme | Bekleme |
| --- | --- |
| 1 | 60s |
| 2 | 5m |
| 3 | 30m |
| 4 | 2h |
| 5 | 6h |
| 6 | 24h |
| 7+ | `dead` — manuel müdahale |

Worker `processDueDeliveries()` her 5 saniyede `FOR UPDATE SKIP LOCKED` ile
batch çeker — birden fazla worker çakışmadan paralel ölçeklenir.

## Ana app entegrasyonu

Bu servis bağımsız çalışır; ana FundEd Next.js uygulaması bağış başarılı olduğunda
veya kampanya tamamlandığında **enqueueDelivery** fonksiyonunu çağırarak (ya doğrudan
bu paketi import ederek, ya da internal HTTP üzerinden) outbox'a yazar.

## Güvenlik notları

- API key plaintext'i sadece oluşturma anında döner — DB'de `sha256` hash tutulur.
- Webhook imzası `t=<unix>,v1=<hex>` formatında, 5 dakikalık replay toleransı.
- Constant-time karşılaştırma (`crypto.timingSafeEqual`) — timing attack korumalı.
- Admin router public auth değil; internal admin oturumu/JWT ardına mount edilmeli.
- `helmet` + `cors` default güvenlik header'ları.
