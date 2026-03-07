/**
 * Centralized constants for FundEd application.
 * Used across browse filters, apply forms, campaign creation, and API validation.
 */

// ─── Funding Categories (matching browse page) ───────────────────────────────
export const FUNDING_CATEGORIES = [
  { value: 'tuition', label: 'Tuition', labelTr: 'Öğrenim Ücreti', icon: 'GraduationCap' },
  { value: 'books', label: 'Books & Materials', labelTr: 'Kitap ve Malzemeler', icon: 'BookOpen' },
  { value: 'laptop', label: 'Laptop & Equipment', labelTr: 'Laptop ve Ekipman', icon: 'Laptop' },
  { value: 'housing', label: 'Housing', labelTr: 'Barınma', icon: 'Home' },
  { value: 'travel', label: 'Travel', labelTr: 'Ulaşım', icon: 'Plane' },
  { value: 'emergency', label: 'Emergency', labelTr: 'Acil Durum', icon: 'AlertCircle' },
] as const;

// ─── Applicant Types ──────────────────────────────────────────────────────────
export const APPLICANT_TYPES = [
  { value: 'student', label: 'Student', labelTr: 'Öğrenci', icon: 'GraduationCap' },
  { value: 'parent', label: 'Parent / Guardian', labelTr: 'Veli', icon: 'Users' },
  { value: 'teacher', label: 'Teacher', labelTr: 'Öğretmen', icon: 'School' },
  { value: 'school', label: 'School / Institution', labelTr: 'Okul / Kurum', icon: 'Building' },
  { value: 'special-needs', label: 'Special Needs', labelTr: 'Özel Gereksinimli', icon: 'Heart' },
] as const;

// ─── Education Levels ─────────────────────────────────────────────────────────
export const EDUCATION_LEVELS = [
  { value: 'primary', label: 'Primary School', labelTr: 'İlkokul' },
  { value: 'middle', label: 'Middle School', labelTr: 'Ortaokul' },
  { value: 'high', label: 'High School', labelTr: 'Lise' },
  { value: 'vocational', label: 'Vocational School', labelTr: 'Meslek Yüksekokulu' },
  { value: 'university', label: 'University (Bachelor)', labelTr: 'Üniversite (Lisans)' },
  { value: 'masters', label: "Master's Degree", labelTr: 'Yüksek Lisans' },
  { value: 'phd', label: 'PhD / Doctorate', labelTr: 'Doktora' },
] as const;

// ─── Urgency Levels ───────────────────────────────────────────────────────────
export const URGENCY_LEVELS = [
  { value: 'low', label: 'Low', labelTr: 'Düşük' },
  { value: 'medium', label: 'Medium', labelTr: 'Orta' },
  { value: 'high', label: 'High', labelTr: 'Yüksek' },
  { value: 'critical', label: 'Critical', labelTr: 'Kritik' },
] as const;

// ─── Countries — Turkey first, then alphabetical ─────────────────────────────
export const COUNTRIES = [
  // ── Highlighted ──
  { value: 'TR', label: 'Turkey', labelTr: 'Türkiye', flag: '🇹🇷' },
  // ── Alphabetical ──
  { value: 'AF', label: 'Afghanistan', labelTr: 'Afganistan', flag: '🇦🇫' },
  { value: 'AL', label: 'Albania', labelTr: 'Arnavutluk', flag: '🇦🇱' },
  { value: 'DZ', label: 'Algeria', labelTr: 'Cezayir', flag: '🇩🇿' },
  { value: 'AD', label: 'Andorra', labelTr: 'Andorra', flag: '🇦🇩' },
  { value: 'AO', label: 'Angola', labelTr: 'Angola', flag: '🇦🇴' },
  { value: 'AG', label: 'Antigua and Barbuda', labelTr: 'Antigua ve Barbuda', flag: '🇦🇬' },
  { value: 'AR', label: 'Argentina', labelTr: 'Arjantin', flag: '🇦🇷' },
  { value: 'AM', label: 'Armenia', labelTr: 'Ermenistan', flag: '🇦🇲' },
  { value: 'AU', label: 'Australia', labelTr: 'Avustralya', flag: '🇦🇺' },
  { value: 'AT', label: 'Austria', labelTr: 'Avusturya', flag: '🇦🇹' },
  { value: 'AZ', label: 'Azerbaijan', labelTr: 'Azerbaycan', flag: '🇦🇿' },
  { value: 'BS', label: 'Bahamas', labelTr: 'Bahamalar', flag: '🇧🇸' },
  { value: 'BH', label: 'Bahrain', labelTr: 'Bahreyn', flag: '🇧🇭' },
  { value: 'BD', label: 'Bangladesh', labelTr: 'Bangladeş', flag: '🇧🇩' },
  { value: 'BB', label: 'Barbados', labelTr: 'Barbados', flag: '🇧🇧' },
  { value: 'BY', label: 'Belarus', labelTr: 'Belarus', flag: '🇧🇾' },
  { value: 'BE', label: 'Belgium', labelTr: 'Belçika', flag: '🇧🇪' },
  { value: 'BZ', label: 'Belize', labelTr: 'Belize', flag: '🇧🇿' },
  { value: 'BJ', label: 'Benin', labelTr: 'Benin', flag: '🇧🇯' },
  { value: 'BT', label: 'Bhutan', labelTr: 'Butan', flag: '🇧🇹' },
  { value: 'BO', label: 'Bolivia', labelTr: 'Bolivya', flag: '🇧🇴' },
  { value: 'BA', label: 'Bosnia and Herzegovina', labelTr: 'Bosna Hersek', flag: '🇧🇦' },
  { value: 'BW', label: 'Botswana', labelTr: 'Botsvana', flag: '🇧🇼' },
  { value: 'BR', label: 'Brazil', labelTr: 'Brezilya', flag: '🇧🇷' },
  { value: 'BN', label: 'Brunei', labelTr: 'Brunei', flag: '🇧🇳' },
  { value: 'BG', label: 'Bulgaria', labelTr: 'Bulgaristan', flag: '🇧🇬' },
  { value: 'BF', label: 'Burkina Faso', labelTr: 'Burkina Faso', flag: '🇧🇫' },
  { value: 'BI', label: 'Burundi', labelTr: 'Burundi', flag: '🇧🇮' },
  { value: 'KH', label: 'Cambodia', labelTr: 'Kamboçya', flag: '🇰🇭' },
  { value: 'CM', label: 'Cameroon', labelTr: 'Kamerun', flag: '🇨🇲' },
  { value: 'CA', label: 'Canada', labelTr: 'Kanada', flag: '🇨🇦' },
  { value: 'CF', label: 'Central African Republic', labelTr: 'Orta Afrika Cumhuriyeti', flag: '🇨🇫' },
  { value: 'TD', label: 'Chad', labelTr: 'Çad', flag: '🇹🇩' },
  { value: 'CL', label: 'Chile', labelTr: 'Şili', flag: '🇨🇱' },
  { value: 'CN', label: 'China', labelTr: 'Çin', flag: '🇨🇳' },
  { value: 'CO', label: 'Colombia', labelTr: 'Kolombiya', flag: '🇨🇴' },
  { value: 'KM', label: 'Comoros', labelTr: 'Komorlar', flag: '🇰🇲' },
  { value: 'CR', label: 'Costa Rica', labelTr: 'Kosta Rika', flag: '🇨🇷' },
  { value: 'HR', label: 'Croatia', labelTr: 'Hırvatistan', flag: '🇭🇷' },
  { value: 'CU', label: 'Cuba', labelTr: 'Küba', flag: '🇨🇺' },
  { value: 'CY', label: 'Cyprus', labelTr: 'Kıbrıs', flag: '🇨🇾' },
  { value: 'CZ', label: 'Czech Republic', labelTr: 'Çek Cumhuriyeti', flag: '🇨🇿' },
  { value: 'DK', label: 'Denmark', labelTr: 'Danimarka', flag: '🇩🇰' },
  { value: 'DJ', label: 'Djibouti', labelTr: 'Cibuti', flag: '🇩🇯' },
  { value: 'DO', label: 'Dominican Republic', labelTr: 'Dominik Cumhuriyeti', flag: '🇩🇴' },
  { value: 'EC', label: 'Ecuador', labelTr: 'Ekvador', flag: '🇪🇨' },
  { value: 'EG', label: 'Egypt', labelTr: 'Mısır', flag: '🇪🇬' },
  { value: 'SV', label: 'El Salvador', labelTr: 'El Salvador', flag: '🇸🇻' },
  { value: 'EE', label: 'Estonia', labelTr: 'Estonya', flag: '🇪🇪' },
  { value: 'ET', label: 'Ethiopia', labelTr: 'Etiyopya', flag: '🇪🇹' },
  { value: 'FI', label: 'Finland', labelTr: 'Finlandiya', flag: '🇫🇮' },
  { value: 'FR', label: 'France', labelTr: 'Fransa', flag: '🇫🇷' },
  { value: 'GA', label: 'Gabon', labelTr: 'Gabon', flag: '🇬🇦' },
  { value: 'GM', label: 'Gambia', labelTr: 'Gambiya', flag: '🇬🇲' },
  { value: 'GE', label: 'Georgia', labelTr: 'Gürcistan', flag: '🇬🇪' },
  { value: 'DE', label: 'Germany', labelTr: 'Almanya', flag: '🇩🇪' },
  { value: 'GH', label: 'Ghana', labelTr: 'Gana', flag: '🇬🇭' },
  { value: 'GR', label: 'Greece', labelTr: 'Yunanistan', flag: '🇬🇷' },
  { value: 'GT', label: 'Guatemala', labelTr: 'Guatemala', flag: '🇬🇹' },
  { value: 'GN', label: 'Guinea', labelTr: 'Gine', flag: '🇬🇳' },
  { value: 'HT', label: 'Haiti', labelTr: 'Haiti', flag: '🇭🇹' },
  { value: 'HN', label: 'Honduras', labelTr: 'Honduras', flag: '🇭🇳' },
  { value: 'HU', label: 'Hungary', labelTr: 'Macaristan', flag: '🇭🇺' },
  { value: 'IS', label: 'Iceland', labelTr: 'İzlanda', flag: '🇮🇸' },
  { value: 'IN', label: 'India', labelTr: 'Hindistan', flag: '🇮🇳' },
  { value: 'ID', label: 'Indonesia', labelTr: 'Endonezya', flag: '🇮🇩' },
  { value: 'IR', label: 'Iran', labelTr: 'İran', flag: '🇮🇷' },
  { value: 'IQ', label: 'Iraq', labelTr: 'Irak', flag: '🇮🇶' },
  { value: 'IE', label: 'Ireland', labelTr: 'İrlanda', flag: '🇮🇪' },
  { value: 'IL', label: 'Israel', labelTr: 'İsrail', flag: '🇮🇱' },
  { value: 'IT', label: 'Italy', labelTr: 'İtalya', flag: '🇮🇹' },
  { value: 'JM', label: 'Jamaica', labelTr: 'Jamaika', flag: '🇯🇲' },
  { value: 'JP', label: 'Japan', labelTr: 'Japonya', flag: '🇯🇵' },
  { value: 'JO', label: 'Jordan', labelTr: 'Ürdün', flag: '🇯🇴' },
  { value: 'KZ', label: 'Kazakhstan', labelTr: 'Kazakistan', flag: '🇰🇿' },
  { value: 'KE', label: 'Kenya', labelTr: 'Kenya', flag: '🇰🇪' },
  { value: 'KW', label: 'Kuwait', labelTr: 'Kuveyt', flag: '🇰🇼' },
  { value: 'KG', label: 'Kyrgyzstan', labelTr: 'Kırgızistan', flag: '🇰🇬' },
  { value: 'LA', label: 'Laos', labelTr: 'Laos', flag: '🇱🇦' },
  { value: 'LV', label: 'Latvia', labelTr: 'Letonya', flag: '🇱🇻' },
  { value: 'LB', label: 'Lebanon', labelTr: 'Lübnan', flag: '🇱🇧' },
  { value: 'LR', label: 'Liberia', labelTr: 'Liberya', flag: '🇱🇷' },
  { value: 'LY', label: 'Libya', labelTr: 'Libya', flag: '🇱🇾' },
  { value: 'LT', label: 'Lithuania', labelTr: 'Litvanya', flag: '🇱🇹' },
  { value: 'LU', label: 'Luxembourg', labelTr: 'Lüksemburg', flag: '🇱🇺' },
  { value: 'MG', label: 'Madagascar', labelTr: 'Madagaskar', flag: '🇲🇬' },
  { value: 'MY', label: 'Malaysia', labelTr: 'Malezya', flag: '🇲🇾' },
  { value: 'ML', label: 'Mali', labelTr: 'Mali', flag: '🇲🇱' },
  { value: 'MR', label: 'Mauritania', labelTr: 'Moritanya', flag: '🇲🇷' },
  { value: 'MX', label: 'Mexico', labelTr: 'Meksika', flag: '🇲🇽' },
  { value: 'MD', label: 'Moldova', labelTr: 'Moldova', flag: '🇲🇩' },
  { value: 'MN', label: 'Mongolia', labelTr: 'Moğolistan', flag: '🇲🇳' },
  { value: 'ME', label: 'Montenegro', labelTr: 'Karadağ', flag: '🇲🇪' },
  { value: 'MA', label: 'Morocco', labelTr: 'Fas', flag: '🇲🇦' },
  { value: 'MZ', label: 'Mozambique', labelTr: 'Mozambik', flag: '🇲🇿' },
  { value: 'MM', label: 'Myanmar', labelTr: 'Myanmar', flag: '🇲🇲' },
  { value: 'NA', label: 'Namibia', labelTr: 'Namibya', flag: '🇳🇦' },
  { value: 'NP', label: 'Nepal', labelTr: 'Nepal', flag: '🇳🇵' },
  { value: 'NL', label: 'Netherlands', labelTr: 'Hollanda', flag: '🇳🇱' },
  { value: 'NZ', label: 'New Zealand', labelTr: 'Yeni Zelanda', flag: '🇳🇿' },
  { value: 'NI', label: 'Nicaragua', labelTr: 'Nikaragua', flag: '🇳🇮' },
  { value: 'NE', label: 'Niger', labelTr: 'Nijer', flag: '🇳🇪' },
  { value: 'NG', label: 'Nigeria', labelTr: 'Nijerya', flag: '🇳🇬' },
  { value: 'MK', label: 'North Macedonia', labelTr: 'Kuzey Makedonya', flag: '🇲🇰' },
  { value: 'NO', label: 'Norway', labelTr: 'Norveç', flag: '🇳🇴' },
  { value: 'OM', label: 'Oman', labelTr: 'Umman', flag: '🇴🇲' },
  { value: 'PK', label: 'Pakistan', labelTr: 'Pakistan', flag: '🇵🇰' },
  { value: 'PS', label: 'Palestine', labelTr: 'Filistin', flag: '🇵🇸' },
  { value: 'PA', label: 'Panama', labelTr: 'Panama', flag: '🇵🇦' },
  { value: 'PY', label: 'Paraguay', labelTr: 'Paraguay', flag: '🇵🇾' },
  { value: 'PE', label: 'Peru', labelTr: 'Peru', flag: '🇵🇪' },
  { value: 'PH', label: 'Philippines', labelTr: 'Filipinler', flag: '🇵🇭' },
  { value: 'PL', label: 'Poland', labelTr: 'Polonya', flag: '🇵🇱' },
  { value: 'PT', label: 'Portugal', labelTr: 'Portekiz', flag: '🇵🇹' },
  { value: 'QA', label: 'Qatar', labelTr: 'Katar', flag: '🇶🇦' },
  { value: 'RO', label: 'Romania', labelTr: 'Romanya', flag: '🇷🇴' },
  { value: 'RU', label: 'Russia', labelTr: 'Rusya', flag: '🇷🇺' },
  { value: 'RW', label: 'Rwanda', labelTr: 'Ruanda', flag: '🇷🇼' },
  { value: 'SA', label: 'Saudi Arabia', labelTr: 'Suudi Arabistan', flag: '🇸🇦' },
  { value: 'SN', label: 'Senegal', labelTr: 'Senegal', flag: '🇸🇳' },
  { value: 'RS', label: 'Serbia', labelTr: 'Sırbistan', flag: '🇷🇸' },
  { value: 'SL', label: 'Sierra Leone', labelTr: 'Sierra Leone', flag: '🇸🇱' },
  { value: 'SG', label: 'Singapore', labelTr: 'Singapur', flag: '🇸🇬' },
  { value: 'SK', label: 'Slovakia', labelTr: 'Slovakya', flag: '🇸🇰' },
  { value: 'SI', label: 'Slovenia', labelTr: 'Slovenya', flag: '🇸🇮' },
  { value: 'SO', label: 'Somalia', labelTr: 'Somali', flag: '🇸🇴' },
  { value: 'ZA', label: 'South Africa', labelTr: 'Güney Afrika', flag: '🇿🇦' },
  { value: 'KR', label: 'South Korea', labelTr: 'Güney Kore', flag: '🇰🇷' },
  { value: 'ES', label: 'Spain', labelTr: 'İspanya', flag: '🇪🇸' },
  { value: 'LK', label: 'Sri Lanka', labelTr: 'Sri Lanka', flag: '🇱🇰' },
  { value: 'SD', label: 'Sudan', labelTr: 'Sudan', flag: '🇸🇩' },
  { value: 'SE', label: 'Sweden', labelTr: 'İsveç', flag: '🇸🇪' },
  { value: 'CH', label: 'Switzerland', labelTr: 'İsviçre', flag: '🇨🇭' },
  { value: 'SY', label: 'Syria', labelTr: 'Suriye', flag: '🇸🇾' },
  { value: 'TW', label: 'Taiwan', labelTr: 'Tayvan', flag: '🇹🇼' },
  { value: 'TJ', label: 'Tajikistan', labelTr: 'Tacikistan', flag: '🇹🇯' },
  { value: 'TZ', label: 'Tanzania', labelTr: 'Tanzanya', flag: '🇹🇿' },
  { value: 'TH', label: 'Thailand', labelTr: 'Tayland', flag: '🇹🇭' },
  { value: 'TG', label: 'Togo', labelTr: 'Togo', flag: '🇹🇬' },
  { value: 'TN', label: 'Tunisia', labelTr: 'Tunus', flag: '🇹🇳' },
  { value: 'TM', label: 'Turkmenistan', labelTr: 'Türkmenistan', flag: '🇹🇲' },
  { value: 'UG', label: 'Uganda', labelTr: 'Uganda', flag: '🇺🇬' },
  { value: 'UA', label: 'Ukraine', labelTr: 'Ukrayna', flag: '🇺🇦' },
  { value: 'AE', label: 'United Arab Emirates', labelTr: 'Birleşik Arap Emirlikleri', flag: '🇦🇪' },
  { value: 'GB', label: 'United Kingdom', labelTr: 'Birleşik Krallık', flag: '🇬🇧' },
  { value: 'US', label: 'United States', labelTr: 'Amerika Birleşik Devletleri', flag: '🇺🇸' },
  { value: 'UY', label: 'Uruguay', labelTr: 'Uruguay', flag: '🇺🇾' },
  { value: 'UZ', label: 'Uzbekistan', labelTr: 'Özbekistan', flag: '🇺🇿' },
  { value: 'VE', label: 'Venezuela', labelTr: 'Venezuela', flag: '🇻🇪' },
  { value: 'VN', label: 'Vietnam', labelTr: 'Vietnam', flag: '🇻🇳' },
  { value: 'YE', label: 'Yemen', labelTr: 'Yemen', flag: '🇾🇪' },
  { value: 'ZM', label: 'Zambia', labelTr: 'Zambiya', flag: '🇿🇲' },
  { value: 'ZW', label: 'Zimbabwe', labelTr: 'Zimbabve', flag: '🇿🇼' },
] as const;

// ─── Turkey Cities (81 il) ────────────────────────────────────────────────────
export const TURKEY_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya',
  'Ankara', 'Antalya', 'Ardahan', 'Artvin', 'Aydın', 'Balıkesir',
  'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis',
  'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum',
  'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane',
  'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul', 'İzmir',
  'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu',
  'Kayseri', 'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kilis',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin',
  'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu',
  'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Şanlıurfa', 'Siirt',
  'Sinop', 'Şırnak', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon',
  'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
] as const;

// ─── Fields of Study (expanded) ──────────────────────────────────────────────
export const FIELDS_OF_STUDY = [
  'Bilgisayar Bilimleri / Computer Science',
  'Mühendislik / Engineering',
  'Tıp / Medicine',
  'Hukuk / Law',
  'İşletme / Business',
  'Eğitim / Education',
  'Mimarlık / Architecture',
  'Sanat ve Tasarım / Arts & Design',
  'Matematik / Mathematics',
  'Fizik / Physics',
  'Kimya / Chemistry',
  'Biyoloji / Biology',
  'Ekonomi / Economics',
  'Psikoloji / Psychology',
  'Sosyoloji / Sociology',
  'Tarih / History',
  'Edebiyat / Literature',
  'İletişim / Communication',
  'Müzik / Music',
  'Spor Bilimleri / Sports Science',
  'Eczacılık / Pharmacy',
  'Diş Hekimliği / Dentistry',
  'Veterinerlik / Veterinary',
  'Ziraat / Agriculture',
  'Hemşirelik / Nursing',
  'Diğer / Other',
] as const;

// ─── School Project Categories (for school applications) ─────────────────────
export const SCHOOL_PROJECT_CATEGORIES = [
  { value: 'laboratuvar', labelTr: 'Laboratuvar', label: 'Laboratory' },
  { value: 'kutuphane', labelTr: 'Kütüphane', label: 'Library' },
  { value: 'teknoloji', labelTr: 'Teknoloji', label: 'Technology' },
  { value: 'spor', labelTr: 'Spor', label: 'Sports' },
  { value: 'sanat', labelTr: 'Sanat', label: 'Arts' },
  { value: 'altyapi', labelTr: 'Altyapı', label: 'Infrastructure' },
  { value: 'malzeme', labelTr: 'Malzeme', label: 'Materials' },
  { value: 'diger', labelTr: 'Diğer', label: 'Other' },
] as const;

// ─── Type exports ─────────────────────────────────────────────────────────────
export type FundingCategory = typeof FUNDING_CATEGORIES[number]['value'];
export type ApplicantType = typeof APPLICANT_TYPES[number]['value'];
export type EducationLevel = typeof EDUCATION_LEVELS[number]['value'];
export type UrgencyLevel = typeof URGENCY_LEVELS[number]['value'];
export type CountryCode = typeof COUNTRIES[number]['value'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getCountryLabel(code: string): string {
  const country = COUNTRIES.find(c => c.value === code);
  return country ? `${country.flag} ${country.labelTr}` : code;
}

export function getCategoryLabel(value: string): string {
  const cat = FUNDING_CATEGORIES.find(c => c.value === value);
  return cat ? cat.labelTr : value;
}
