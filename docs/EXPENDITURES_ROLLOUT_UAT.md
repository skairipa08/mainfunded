# Expenditures Rollout & UAT Runbook

**Amaç**: Harcama takip sistemini production’a güvenli şekilde almak ve release sonrası temel iş akışlarını doğrulamak.

**Kapsam**:
- `expenditures` collection + indexler
- Harcama ekleme/listeme API’leri
- Admin/Ops onay akışı
- Kampanya harcama zaman çizelgesi + özet paneli
- Donor e-posta + in-app bildirim tetiklemesi

---

## 1) Pre-Deployment Kontrolleri

### 1.1 Ortam Değişkenleri
Aşağıdakiler doğrulanmalı:
- `MONGO_URL`
- `DB_NAME`
- `AUTH_URL`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY` (e-posta için)
- `EMAIL_FROM`

Komutlar:
```bash
npm run check:env
npm run doctor
```

### 1.2 Test ve Build
```bash
npx vitest run __tests__/expenditures.test.ts
npm run build
```

Beklenen:
- Expenditure testleri yeşil
- Build hatasız

---

## 2) Rollout Sırası (Production)

### Adım 1 — Uygulamayı deploy etmeden önce indexleri hazırla
```bash
npm run db:indexes
```

Beklenen:
- `expenditures` için aşağıdaki indexler oluşur:
  - `expenditure_id` (unique)
  - `{ campaign_id: 1, created_at: -1 }`
  - `{ campaign_id: 1, status: 1, created_at: -1 }`
  - `{ created_by: 1, created_at: -1 }`
  - `{ status: 1, created_at: -1 }`
  - `approved_by` (sparse)

### Adım 2 — Uygulama deploy
- Mevcut pipeline ile release alın.
- Deploy sonrası health check ve kritik route smoke test yapılır.

### Adım 3 — Hızlı Smoke Test
Kontrol et:
- `GET /api/expenditures?campaign_id={id}`
- `GET /api/admin/expenditures?status=pending`
- Admin UI: `/admin/expenditures`
- Kampanya UI: `/campaign/{id}` harcama kartı görünüyor mu

---

## 3) UAT Senaryosu (Kısa)

## Senaryo A — Harcama Ekleme (Öğrenci / Okul Yöneticisi)
1. Kampanya sahibi kullanıcı ile giriş yap.
2. `POST /api/expenditures` çağrısı yap:
   - `campaign_id`
   - `category` (`Okul Ücreti`, `Kitap`, `Kırtasiye`, `Ulaşım`, `Diğer`)
   - `amount`
   - `description`
   - `receipt` (pdf/jpg/png)
3. **Beklenen**:
   - 201
   - kayıt `status=pending`
   - belge metadata dolu

### Negatif kontroller
- Geçersiz kategori → 400
- Dosya yok/geçersiz tür → 400
- Kampanya sahibi olmayan kullanıcı → 403

## Senaryo B — Admin/Ops Onay Akışı
1. Admin veya Ops kullanıcı ile `/admin/expenditures` aç.
2. Bekleyen kayıt için `Onayla` veya `Reddet` yap.
3. **Beklenen**:
   - `pending -> approved/rejected` geçişi olur
   - `reviewed_at`, `approved_by`, `review_note` dolu
   - pending olmayan kayıtta tekrar aksiyon 409 döner

## Senaryo C — Kampanya Zaman Çizelgesi
1. Onaylanmış harcama bulunan kampanyayı donor olarak aç (`/campaign/{id}`).
2. **Beklenen**:
   - “Toplanan / Harcanan / Kalan” değerleri görünür
   - yalnızca `approved` harcamalar listelenir
   - tarih, kategori, açıklama, tutar ve belge linki görünür

## Senaryo D — Donor Bildirimleri
1. Onaylanan harcama olan kampanyada daha önce bağış yapmış donor hesaplarını kontrol et.
2. **Beklenen**:
   - e-posta: “Yeni Harcama Güncellemesi • {kampanya}”
   - in-app notification: kampanya harcama güncellemesi başlığıyla kayıt oluşur

Not: `RESEND_API_KEY` yoksa e-posta gönderimi atlanır, ama akış kırılmaz.

---

## 4) Geri Dönüş (Rollback) Planı

### Düşük risk rollback
- Yeni UI linkini geçici olarak kaldır (`/admin/expenditures` menü)
- Harcama API route’larını geçici feature-flag ile kapat (varsa)

### Tam rollback
- Uygulama bir önceki release’e döndürülür.
- `expenditures` collection verisi kalabilir (geri uyumlu, read-only bırakılabilir).
- Gerekirse onay akışında oluşturulan kayıtlar admin scripti ile `rejected` statüsüne çekilir.

---

## 5) Operasyonel İzleme (İlk 24 Saat)

İzlenecek metrikler:
- `POST /api/expenditures` 4xx/5xx oranı
- `POST /api/admin/expenditures/{id}/action` hata oranı
- Harcama onay gecikmesi (pending bekleme süresi)
- E-posta gönderim başarısı (Resend)

Log anahtarları:
- `[Expenditures API]`
- `[Admin Expenditure Action API]`
- `[Email]`

---

## 6) Çıktı Doğrulama Özeti

- [x] Veritabanı şeması + ilişkiler dokümante edildi
- [x] Upload dahil harcama API eklendi
- [x] Kampanya harcama timeline bileşeni eklendi
- [x] Admin/Ops onay paneli eklendi
- [x] Donor e-posta şablonu ve in-app bildirim tetikleme eklendi
- [x] Hedefli testler eklendi ve geçti (`__tests__/expenditures.test.ts`)
