# FundEd Projects — Tasarım Dokümanı

**Tarih:** 2026-05-19  
**Platform:** Next.js 14, MongoDB + Prisma, Iyzico, NextAuth  
**Mimari:** Ayrı modül — mevcut sistemle entegre, bağımsız koleksiyonlar

---

## 1. Amaç ve Kapsam

FundEd Projects, bireysel öğrenci desteğinin ötesinde kulüp projeleri, Teknofest ekipleri, araştırma çalışmaları, yarışma ekipleri ve öğrenci topluluklarının doğrulanmış şekilde fon bulmasını sağlar. Temel prensip: **doğrulanmış proje + ölçülebilir çıktı + güven**.

Desteklenen proje tipleri: `club | team | research | competition | social | event | conference`

---

## 2. Veritabanı Şeması

### 2.1 Project

```prisma
model Project {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  title           String
  description     String
  type            ProjectType
  status          ProjectStatus @default(Draft)

  // Sahip — ownerId, NextAuth MongoDB adapter'ın User.id'sine karşılık gelir.
  // Prisma cross-schema @relation desteklenmez; sahiplik API katmanında
  // session.user.id === project.ownerId kontrolüyle doğrulanır.
  ownerId         String   @db.ObjectId
  ownerType       OwnerType  // student | institution

  // Okul bilgisi
  schoolName      String
  schoolEmail     String
  clubName        String?

  // Danışman
  advisorName     String?
  advisorEmail    String?
  advisorToken    String?   @unique
  advisorApprovedAt DateTime?

  // Bütçe
  targetBudget    Float
  budgetItems     BudgetItem[]
  expectedOutputs String[]
  timeline        TimelineItem[]

  // Medya
  files           String[]   // Cloudinary URL'leri
  videoUrl        String?

  // Alan (domain) — filtreleme için
  domain          String[]   // ["mühendislik", "yapay zeka", "sürdürülebilirlik"]
  schoolLevel     SchoolLevel @default(university)

  // Risk
  riskScore       Int        @default(0)

  // İlişkiler
  members         ProjectMember[]
  milestones      Milestone[]
  escrow          ProjectEscrow?
  verification    ProjectVerification?
  follows         SponsorProjectFollow[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  publishedAt     DateTime?
}

enum ProjectType {
  club
  team
  research
  competition
  social
  event
  conference
}

enum ProjectStatus {
  Draft
  Pending
  Verified
  Rejected
  Published
  Suspended
  Completed    // Tüm milestone'lar Paid olduğunda otomatik geçiş
}

enum OwnerType {
  student
  institution
}

enum SchoolLevel {
  high_school
  university
}

type BudgetItem {
  name     String
  amount   Float
  category String
}

type TimelineItem {
  week    Int
  task    String
}
```

### 2.2 ProjectMember

```prisma
model ProjectMember {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  projectId   String   @db.ObjectId
  project     Project  @relation(fields: [projectId], references: [id])
  userId      String?  @db.ObjectId  // nullable: email ile eklenebilir
  name        String
  email       String
  role        MemberRole
  verifiedAt  DateTime?
  createdAt   DateTime @default(now())
}

enum MemberRole {
  leader
  member
  advisor
}
```

### 2.3 Milestone

```prisma
model Milestone {
  id            String          @id @default(auto()) @map("_id") @db.ObjectId
  projectId     String          @db.ObjectId
  project       Project         @relation(fields: [projectId], references: [id])
  order         Int             // 1, 2, 3
  title         String
  description   String
  percentage    Int             // 20, 30, 50
  status        MilestoneStatus @default(Locked)
  evidenceFiles String[]
  evidenceNote  String?
  adminNote     String?
  approvedAt    DateTime?
  approvedBy    String?         @db.ObjectId
  createdAt     DateTime        @default(now())
}

enum MilestoneStatus {
  Locked             // Önceki milestone henüz tamamlanmadı
  EvidenceRequired   // Sistem tarafından set edilir: hedef eşiğe ulaşıldı, ekip kanıt yükleyebilir
  UnlockRequested    // Ekip tarafından set edilir: kanıt yüklendi, admin onayı bekleniyor
  Approved           // Admin onayladı, payout tetiklendi
  Paid               // Iyzico payout tamamlandı
}
```

### 2.4 ProjectEscrow

```prisma
model ProjectEscrow {
  id                String              @id @default(auto()) @map("_id") @db.ObjectId
  projectId         String              @unique @db.ObjectId
  project           Project             @relation(fields: [projectId], references: [id])
  totalCollected    Float               @default(0)
  totalReleased     Float               @default(0)
  pendingRelease    Float               @default(0)
  iyzicoEscrowRef   String?
  transactions      EscrowTransaction[]
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
}

model EscrowTransaction {
  id              String          @id @default(auto()) @map("_id") @db.ObjectId
  escrowId        String          @db.ObjectId
  escrow          ProjectEscrow   @relation(fields: [escrowId], references: [id])
  milestoneId     String?         @db.ObjectId
  type            EscrowTxType    // collect | release | refund
  amount          Float
  currency        String          @default("TRY")
  iyzicoPaymentId String?
  status          String
  createdAt       DateTime        @default(now())
}

enum EscrowTxType {
  collect
  release
  refund
}
```

### 2.5 ProjectVerification

```prisma
model ProjectVerification {
  id                    String   @id @default(auto()) @map("_id") @db.ObjectId
  projectId             String   @unique @db.ObjectId
  project               Project  @relation(fields: [projectId], references: [id])
  studentEmailVerified  Boolean  @default(false)
  schoolDocVerified     Boolean  @default(false)
  advisorApproved       Boolean  @default(false)
  adminReviewedAt       DateTime?
  adminReviewedBy       String?  @db.ObjectId
  rejectionReason       String?
  createdAt             DateTime @default(now())
}
```

### 2.6 SponsorProjectFollow

```prisma
model SponsorProjectFollow {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  donorId     String   @db.ObjectId
  projectId   String   @db.ObjectId
  project     Project  @relation(fields: [projectId], references: [id])
  followedAt  DateTime @default(now())

  @@unique([donorId, projectId])
}
```

---

## 3. API Route Yapısı

```
/api/projects/
├── POST   /                           Yeni proje oluştur (Draft)
├── GET    /                           Proje listesi (filtreli, public)
├── GET    /my                         Oturum sahibinin projeleri

/api/projects/[id]/
├── GET    /                           Proje detayı
├── PATCH  /                           Güncelle (Draft aşamasında)
├── DELETE /                           Sil (sadece Draft)
├── POST   /submit                     Draft → Pending + danışman emaili
├── GET    /advisor-approve?token=...  Danışman onay linki (GET, token ile)
├── POST   /members                    Ekip üyesi ekle
├── GET    /members                    Ekip listesi
├── POST   /donate                     Bağış yap (Iyzico escrow'a)
├── POST   /follow                     Takip et / takibi bırak (toggle)
├── GET    /esg                        ESG metrik verisi

/api/projects/[id]/milestones/
├── GET    /                           Milestone listesi
├── POST   /[milestoneId]/evidence     Kanıt yükle
├── POST   /[milestoneId]/request      Ödeme kilidi açma talebi

/api/admin/projects/
├── GET    /                           Başvuru kuyruğu (risk skoruna göre sıralı)
├── GET    /[id]                       Detaylı inceleme
├── POST   /[id]/verify                Pending → Verified → Published
├── POST   /[id]/reject                Reddet + sebep
├── POST   /[id]/milestone-approve     Milestone onayı → Iyzico payout tetikle
├── POST   /[id]/suspend               Yayından kaldır
├── GET    /[id]/risk                  Risk skoru detay raporu
```

**Auth:** Tüm yazma endpointleri `authz.ts` middleware ile korunur. Danışman onayı `?token=` parametresiyle oturumsuz çalışır (tek kullanımlık).

---

## 4. Proje Oluşturma Akışı

4 adımlı wizard — her adım ayrı kaydedilir, proje Draft olarak kalır:

```
Adım 1 — Temel Bilgiler
  Proje adı, açıklama, tip, tanıtım videosu

Adım 2 — Ekip & Okul
  Okul adı, okul emaili, kulüp/topluluk adı
  Danışman adı + email
  Ekip üyeleri (ad, email, rol)

Adım 3 — Bütçe & Çıktı
  Hedef bütçe, kalem bazlı giderler
  Beklenen çıktılar, zaman planı

Adım 4 — Dosyalar & Gönder
  Belge yükleme (Cloudinary)
  Son inceleme + "Başvuruyu Gönder" butonu
```

"Gönder" tetikleyicisi:
1. Status: `Draft → Pending`
2. `ProjectVerification` kaydı oluşturulur
3. Risk skoru hesaplanır (bkz. §8)
4. Danışmana `advisorToken` içeren onay linki emaili gönderilir (Resend)
5. Öğrenci emaili doğrulama maili gönderilir (mevcut OTP sistemi)

---

## 5. Doğrulama Pipeline

```
[Başvuru Gönderildi]
        ↓
[Otomatik Kontroller]
  ├── Okul emaili geçerli format mı?
  ├── En az 1 belge yüklendi mi?
  ├── Bütçe kalemleri toplam hedefle uyuşuyor mu?
  ├── Hesap yaşı > 7 gün mi?
  └── Risk skoru hesapla (0–100)
        ↓
[Danışman Onay Emaili]
  └── advisorToken ile tek kullanımlık link
  └── Onay → advisorApproved: true, advisorApprovedAt: Date
        ↓
[Admin Kuyruğu]
  ├── Risk skoru < 60 → "Öncelikli İnceleme" etiketiyle öne alınır
  ├── Admin belgeleri inceler, danışman onayını kontrol eder
  └── ONAYLA → status: Published, publishedAt: Date
      REDDET  → status: Rejected, rejectionReason kaydedilir
```

**Kural:** Danışman onayı gelmeden admin "Onayla" butonu disable edilir (ownerType === "student" ise).

---

## 6. Milestone Ödeme Sistemi

### Milestone Yapısı

Her proje 3 milestone içerir (başvuruda tanımlanır):

```
Milestone 1: %20 — Ekipman / hazırlık aşaması
Milestone 2: %30 — Prototip / orta aşama
Milestone 3: %50 — Final teslim
```

### Kilit Açma Akışı

İki ayrı olay vardır: (1) sistem funding eşiğini algılar, (2) ekip kanıt yükler.

```
[Bağışlar hedefin %20'sine ulaşır]
        ↓ (sistem otomatik)
[Milestone 1 → EvidenceRequired]
  Ekibe email bildirimi: "Kanıt yükleme zamanı"
        ↓ (ekip aksiyonu)
[Ekip kanıt yükler via POST /milestones/[id]/evidence]
  fotoğraf / video / rapor + açıklama notu
        ↓
[POST /milestones/[id]/request ile talep gönderir]
[Milestone 1 → UnlockRequested]
  Admin kuyruğuna düşer
        ↓
[Admin inceler via POST /admin/projects/[id]/milestone-approve]
  ONAYLA → MilestoneStatus: Approved
         → Iyzico payout tetiklenir (escrow.totalCollected * 0.20)
         → EscrowTransaction: type: release, milestoneId
         → Milestone 1 → Paid, Milestone 2 → EvidenceRequired izlenmeye başlar
  REDDET → adminNote ile ekibe Resend bildirimi
          → Milestone EvidenceRequired'a döner, tekrar yükleme hakkı
```

### Escrow Mantığı

- Bağışlar `ProjectEscrow.totalCollected`'a eklenir
- Payout'ta `totalReleased` güncellenir
- Proje `Rejected` veya `Suspended` durumuna geçtiğinde refund tetiklenir

### Refund Akışı

Route: `POST /api/admin/projects/[id]/cancel` (status → Rejected/Suspended tetikler)

```
totalReleased === 0 → Tüm bağışçılara tam iade
totalReleased > 0  → Kısmi iade: her bağışçıya
  iade = (kişi_bağışı / totalCollected) * (totalCollected - totalReleased)
```

Her `EscrowTransaction` (type: collect) için Iyzico refund API çağrısı yapılır.
Refund işlemleri `EscrowTransaction` tablosuna `type: refund` olarak kaydedilir.
Iyzico refund webhook sonucunda `ProjectEscrow.totalCollected` sıfırlanır.

---

## 7. Sponsor Filtre Sistemi

`/browse/projects` sayfası — mevcut `/browse` ile aynı pattern:

```typescript
// Filtre parametreleri
type ProjectFilters = {
  type?: ProjectType[]           // club, team, research, competition...
  domain?: string[]              // Project.domain alanındaki değerler:
                                 // "mühendislik" | "sağlık" | "yapay zeka" |
                                 // "sürdürülebilirlik" | "sosyal etki" | "biyoteknoloji"
  schoolLevel?: SchoolLevel      // high_school | university
  city?: string
  budgetMin?: number
  budgetMax?: number
  status?: 'Published' | 'Completed'
  hasAdvisor?: boolean
}
```

**Proje kartı:** İsim, tip, okul, şehir, hedef/toplanan bütçe, risk skoru (admin görür), takip butonu.

**Takip:** `POST /api/projects/[id]/follow` — `SponsorProjectFollow` oluştur/sil (toggle). Donor dashboard'unda "Takip Ettiğim Projeler" sekmesi.

---

## 8. Risk / Güven Skoru Algoritması

0–100 arası skor. **Düşük = riskli**, 60 altı öncelikli admin incelemesine girer.

```typescript
function calculateRiskScore(project: Project, verification: ProjectVerification): number {
  let score = 0

  // Doğrulama faktörleri
  if (verification.advisorApproved)         score += 25
  if (verification.studentEmailVerified)    score += 15
  if (verification.schoolDocVerified)       score += 20

  // Proje kalitesi
  if (project.files.length >= 1)            score += 10
  if (project.budgetItems.length >= 3)      score += 10
  if (project.members.length > 1)           score += 10
  if (project.timeline.length >= 3)         score += 5
  if (project.videoUrl)                     score += 5

  // Hesap güveni (accountAge gün cinsinden)
  const accountAge = getDaysSinceCreation(project.ownerId)
  if (accountAge > 90)      score += 0   // zaten diğerlerinden alıyor
  else if (accountAge < 7)  score -= 10  // yeni hesap cezası

  return Math.max(0, Math.min(100, score))
}
```

**Otomatik uyarılar:**
- Skor < 40: "Yüksek Risk" — admin bildirim emaili
- Skor 40–60: "Orta Risk" — öncelik kuyruğu
- Skor > 60: "Normal" — standart kuyruk

---

## 9. Admin Panel Tasarımı

Mevcut `/admin` sayfasına yeni "Projeler" sekmesi:

**Başvuru Kuyruğu:**
- Risk skoruna göre sıralı liste
- Filtre: Pending / Verified / Rejected / Suspended
- Her satır: Proje adı, tip, okul, risk skoru badge, başvuru tarihi, hızlı işlem butonları

**Proje Detay Sayfası:**
- Sol panel: Proje bilgileri, ekip üyeleri, bütçe kalemleri
- Orta panel: Yüklenen belgeler (inline görüntüleme)
- Sağ panel: Risk skoru breakdown, doğrulama durumu, aksiyon butonları (Onayla / Reddet)
- Alt panel: Milestone durumu + kanıt dosyaları + onay/red

---

## 10. ESG Etki Paneli

Donor dashboard'una yeni "Etki" (Impact) sekmesi. Veri kaynağı: `GET /api/projects/[id]/esg`

```typescript
type ESGMetrics = {
  totalProjectsSupported: number
  totalStudentsReached: number    // ProjectMember toplamı
  completedProjectsRatio: number  // Paid milestone / total
  activeProjects: number
  domainBreakdown: { domain: string; count: number }[]
  totalAmountDonated: number
}
```

Görsel bileşenler: `Recharts` ile mevcut analytics pattern — `PieChart` (alan dağılımı), `BarChart` (aylık destek), `StatCard` (toplam metrikler).

---

## 11. Ölçeklenebilir Mimari Önerileri

1. **Escrow için Iyzico Sub-merchant:** Iyzico Marketplace API, ayrı bir sub-merchant sözleşmesi gerektirir. **MVP'de soft-lock yaklaşımı kullanılır:** fonlar platformun ana Iyzico hesabında toplanır, payout manuel olarak tetiklenir ve `ProjectEscrow` tablosu platform tarafından izlenir. Gerçek marketplace escrow (otomatik sub-merchant payout) v2 özelliği olarak planlanır. Geliştirme başlamadan önce Iyzico hesabının marketplace modunu destekleyip desteklemediği doğrulanmalıdır.

2. **Risk Skoru Servisi:** `lib/project-risk.ts` olarak izole edilir, unit test edilebilir, ileride ML modeline dönüştürülebilir.

3. **Webhook Tabanlı Milestone:** Iyzico ödeme webhook'u → milestone status güncellemesi zinciri `lib/campaign-state-machine.ts` pattern'ıyla `lib/project-state-machine.ts` olarak kurulur.

4. **Email Queue:** Danışman onayı, milestone bildirimleri, admin uyarıları — mevcut Resend entegrasyonu üzerinden `lib/email-service.ts` genişletilir.

5. **File Validation:** Cloudinary upload hook'larında dosya tipi (PDF, JPG, PNG, MP4) ve boyut (max 50MB video, 10MB belge) kontrolü.

6. **Internationalization:** Mevcut `next-intl` altyapısıyla proje tiplerinin Türkçe/İngilizce çevirileri `messages/` klasörüne eklenir.

---

## 12. Kontrol Listesi

- [ ] Okul/doğrulama sistemi çalışıyor
- [ ] Danışman onayı olmadan yayın açılmıyor
- [ ] Milestone sistemi ödeme kilidini yönetiyor
- [ ] Sponsor filtreleme doğru çalışıyor
- [ ] Risk skoru hesaplanıyor
- [ ] ESG paneli veri üretiyor
- [ ] Proje ilerleme raporları yayınlanıyor
- [ ] Sahte proje tespit sistemi test edildi
