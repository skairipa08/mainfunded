# Expenditures Schema (MongoDB)

## Collection: `expenditures`

```json
{
  "expenditure_id": "uuid",
  "campaign_id": "campaign_id",
  "category": "Okul Ücreti | Kitap | Kırtasiye | Ulaşım | Diğer",
  "custom_category": "string?",
  "amount": 1250,
  "currency": "TRY",
  "description": "string",
  "receipt": {
    "storage_path": "expenditures/{campaign_id}/{expenditure_id}/receipt.pdf",
    "file_name": "receipt_may.pdf",
    "mime_type": "application/pdf",
    "file_size_bytes": 123456,
    "sha256_hash": "hex"
  },
  "status": "pending | approved | rejected",
  "created_by": "user_id",
  "created_by_name": "string",
  "created_by_role": "user | admin | ops | ...",
  "approved_by": "user_id?",
  "approved_by_name": "string?",
  "review_note": "string?",
  "reviewed_at": "ISODate?",
  "published_at": "ISODate?",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

## İlişkiler

- `expenditures.campaign_id` → `campaigns.campaign_id`
- `expenditures.created_by` → `users._id (string)`
- `expenditures.approved_by` → `users._id (string)`
- Donör bildirim hedefi, `donations` koleksiyonundan `campaign_id + status=paid` ile türetilir.

## İndeksler

- `expenditure_id` (unique)
- `{ campaign_id: 1, created_at: -1 }`
- `{ campaign_id: 1, status: 1, created_at: -1 }`
- `{ created_by: 1, created_at: -1 }`
- `{ status: 1, created_at: -1 }`
- `approved_by` (sparse)

## Yayın/Onay Akışı

1. Öğrenci/okul yöneticisi harcama ekler → `status=pending`
2. Admin/Ops panelinde inceleme yapılır
3. Onaylanırsa `status=approved`, `published_at` set edilir ve kampanya zaman çizelgesinde görünür
4. Reddedilirse `status=rejected` ve gerekçe notu tutulur
