



Proje supabase ile hızlı protipleme ile ayağa kaldırıldı ve kontrol edildi
test eilen kısımlar:
register (doğrulama için maile doğrulama linki)
login
<img width="1807" height="756" alt="image" src="https://github.com/user-attachments/assets/3a547d27-1446-494f-956d-71badf94a5ea" />

kelime ekleme kısmı 
dashboard/admin/seed
<img width="1752" height="737" alt="image" src="https://github.com/user-attachments/assets/6254aa77-2e76-4a60-aaa2-a74dca0deebf" />

....
başlangıçta claude api kullanıldı ve kredi bitince manuel sqle çevrildi

<img width="967" height="601" alt="image" src="https://github.com/user-attachments/assets/158fc450-ec6b-48ce-84dc-9487ec859745" />

<img width="1047" height="785" alt="image" src="https://github.com/user-attachments/assets/c688f585-295d-4ef5-a390-c0edbc42e83a" />

# ⚡ WordQuest

> İngilizce kelime hazineni bilimsel yöntemlerle geliştir.  
> SM-2 Spaced Repetition · 7× Tekrar Sistemi · Claude AI Açıklamaları · CEFR Seviyeleri

---

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Kurulum](#-kurulum)
  - [1. Repoyu Klonla](#1-repoyu-klonla)
  - [2. Bağımlılıkları Yükle](#2-bağımlılıkları-yükle)
  - [3. Supabase Kurulumu](#3-supabase-kurulumu)
  - [4. Anthropic API Key](#4-anthropic-api-key)
  - [5. Ortam Değişkenleri](#5-ortam-değişkenleri)
  - [6. Veritabanını Kur](#6-veritabanını-kur)
  - [7. Kelimeleri Yükle](#7-kelimeleri-yükle)
  - [8. Çalıştır](#8-çalıştır)
- [Proje Yapısı](#-proje-yapısı)
- [Sayfalar ve Özellikler](#-sayfalar-ve-özellikler)
- [Sıkça Sorulan Sorular](#-sıkça-sorulan-sorular)

---

## ✨ Özellikler

| Özellik | Açıklama |
|---------|----------|
| 📚 1000+ Kelime | A1'den C1'e CEFR seviyelerine göre gruplandırılmış |
| 🧠 SM-2 Algoritması | Bilimsel aralıklı tekrar — doğru bildiğin kelimeler uzayan aralıklarla gösterilir |
| 🔁 7× Tekrar Sistemi | Her kelimeyi 7 kez doğru bil, sonra "öğrenildi" sayılır |
| 🎯 5 Pratik Modu | Flashcard, Quiz, Boşluk Doldurma, Telaffuz, Yazım |
| 🤖 Claude AI | Yanlış bilinen kelimeler için Türkçe açıklama, hafıza ipuçları, diyalog örnekleri |
| 🏆 Seviye Sınavları | Her seviye bitince sınav — 70 puan altında kalan tekrar çalışır |
| 🔥 Streak Sistemi | Günlük çalışma serisi takibi |
| ⚡ XP ve Rozetler | Her doğru cevap ve tamamlanan seviye için ödül |
| 📊 İlerleme Analitikleri | Haftalık aktivite grafikleri, seviye bazında ilerleme |

---

## 🛠 Teknoloji Yığını

- **Framework:** Next.js 15 (App Router)
- **Dil:** TypeScript
- **Stil:** Tailwind CSS v4
- **Veritabanı & Auth:** Supabase (PostgreSQL + Row Level Security)
- **AI:** Anthropic Claude API
- **Deployment:** Vercel (önerilir)

---

## 🚀 Kurulum

### Gereksinimler

Başlamadan önce bilgisayarında şunların kurulu olduğundan emin ol:

- [Node.js](https://nodejs.org) v18 veya üzeri
- [Git](https://git-scm.com)
- Bir kod editörü ([VS Code](https://code.visualstudio.com) önerilir)

---

### 1. Repoyu Klonla

```bash
git clone https://github.com/kullanici-adin/wordquest.git
cd wordquest
```

---

### 2. Bağımlılıkları Yükle

```bash
npm install
```

> Birkaç dakika sürebilir. Tamamlandığında `node_modules` klasörü oluşur.

---

### 3. Supabase Kurulumu

Supabase, projenin veritabanı ve kimlik doğrulama altyapısını sağlıyor. **Ücretsizdir.**

#### 3.1 Hesap Oluştur

1. [supabase.com](https://supabase.com) adresine git
2. **Start your project** butonuna tıkla
3. GitHub hesabınla giriş yap

#### 3.2 Yeni Proje Oluştur

1. **New project** butonuna tıkla
2. Şu bilgileri doldur:
   - **Name:** `wordquest`
   - **Database Password:** Güçlü bir şifre belirle ve kaydet
   - **Region:** `West EU (Ireland)` — Türkiye'ye en yakın
3. **Create new project** → 1-2 dakika bekle

#### 3.3 API Bilgilerini Al

Proje oluştuktan sonra sol menüden **Project Settings → API** sekmesine git:

| `.env.local` Değişkeni | Supabase'deki Adı |
|------------------------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (gizli tut!) |

---

### 4. Anthropic API Key

Claude AI özellikleri için gerekli. **$5 ücretsiz kredi ile başlarsın.**

> ⚠️ API key olmadan da uygulama çalışır — sadece AI açıklama özelliği ve otomatik kelime üretme devre dışı kalır. Manuel SQL ile kelime ekleyebilirsin (bkz. Adım 7).

1. [console.anthropic.com](https://console.anthropic.com) adresine git
2. Hesap oluştur
3. Sol menüden **API Keys → Create Key**
4. Bir isim ver → **Create Key**
5. Çıkan anahtarı **hemen kopyala** — bir daha göremezsin!

---

### 5. Ortam Değişkenleri

Proje kök dizininde `.env.local` dosyası oluştur:

```bash
cp .env.example .env.local
```

Sonra `.env.local` dosyasını aç ve doldur:

```env
# Supabase — Project Settings → API'den al
NEXT_PUBLIC_SUPABASE_URL=https://xyzxyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Anthropic — console.anthropic.com'dan al (opsiyonel)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Uygulama URL (geliştirme için değiştirme)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ `.env.local` dosyasını asla GitHub'a yükleme! `.gitignore` zaten engelliyor.

---

### 6. Veritabanını Kur

Supabase SQL Editor'de migration dosyalarını sırayla çalıştır.

**SQL Editor'ü Aç:** Supabase dashboard → sol menü → **SQL Editor**

#### Migration 1 — Tablo Yapısı

1. `supabase/migrations/001_initial_schema.sql` dosyasını aç
2. Tüm içeriği kopyala (Ctrl+A → Ctrl+C)
3. SQL Editor'e yapıştır
4. **Run** butonuna bas
5. `Success. No rows returned` görmelisin

#### Migration 2 — Fonksiyonlar

1. SQL Editor'ü temizle (Ctrl+A → Delete)
2. `supabase/migrations/002_functions.sql` içeriğini yapıştır
3. **Run** bas → `Success` görmelisin

**Kontrol:** Sol menü → **Table Editor** → `users`, `words`, `word_progress` tablolarını görmelisin.

---

### 7. Kelimeleri Yükle

İki yöntem var:

#### Yöntem A — Hazır SQL (Önerilir, API key gerekmez)

1. SQL Editor'ü aç
2. `supabase/migrations/003_seed_a1_words.sql` içeriğini kopyala
3. SQL Editor'e yapıştır → **Run** bas
4. 50 adet A1 kelimesi anında yüklenir ✅

#### Yöntem B — Claude AI ile Otomatik (Anthropic API key gerekir)

1. Uygulamayı çalıştır (bkz. Adım 8)
2. Hesap oluşturup giriş yap
3. `http://localhost:3000/dashboard/admin/seed` adresine git
4. Seviye seç → **Ekle** butonuna bas
5. Claude API her kelime için otomatik içerik üretir (~20-30 saniye)

---

### 8. Çalıştır

```bash
npm run dev
```

Tarayıcıda aç: **[http://localhost:3000](http://localhost:3000)**

**Ücretsiz Başla** → hesap oluştur → çalışmaya başla! 🎉

---

## 📁 Proje Yapısı

```
wordquest/
├── src/
│   ├── app/
│   │   ├── page.tsx                      → Landing page
│   │   ├── globals.css                   → Global stiller
│   │   ├── auth/
│   │   │   ├── login/page.tsx            → Giriş
│   │   │   ├── signup/page.tsx           → Kayıt
│   │   │   └── callback/route.ts         → OAuth callback
│   │   ├── dashboard/
│   │   │   ├── page.tsx                  → Ana dashboard
│   │   │   ├── study/page.tsx            → Kelime çalışma
│   │   │   ├── review/page.tsx           → Tekrar modu
│   │   │   ├── words/page.tsx            → Kelime listesi
│   │   │   ├── progress/page.tsx         → İlerleme grafikleri
│   │   │   ├── exam/page.tsx             → Seviye sınavı
│   │   │   ├── settings/page.tsx         → Ayarlar
│   │   │   └── admin/seed/page.tsx       → Kelime seed paneli
│   │   └── api/
│   │       ├── generate-word/route.ts    → Claude ile kelime üret
│   │       ├── word-explanation/route.ts → Claude ile açıklama
│   │       └── seed-words/route.ts       → Toplu seed API
│   ├── components/
│   │   ├── dashboard/DashboardNav.tsx    → Sidebar
│   │   └── study/
│   │       ├── StudySession.tsx           → Öğrenme akışı
│   │       ├── FlashCard.tsx              → Kelime kartı
│   │       ├── WordDetailPanel.tsx        → Detay paneli
│   │       ├── PracticeRound.tsx          → Quiz ve boşluk doldurma
│   │       └── SessionComplete.tsx        → Tamamlama ekranı
│   ├── lib/
│   │   ├── supabase/client.ts            → Tarayıcı client
│   │   ├── supabase/server.ts            → Sunucu client
│   │   └── utils.ts                      → SM-2, XP, quiz yardımcıları
│   ├── types/index.ts                    → TypeScript tipleri
│   └── middleware.ts                     → Route koruması
├── supabase/migrations/
│   ├── 001_initial_schema.sql            → Tablolar ve RLS
│   ├── 002_functions.sql                 → XP ve streak fonksiyonları
│   └── 003_seed_a1_words.sql             → 50 adet A1 kelimesi
├── .env.example                          → Ortam değişkeni şablonu
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## 📱 Sayfalar ve Özellikler

| Sayfa | URL | Açıklama |
|-------|-----|----------|
| Landing | `/` | Anasayfa, kayıt/giriş yönlendirmesi |
| Dashboard | `/dashboard` | İstatistikler, streak, hızlı erişim |
| Çalış | `/dashboard/study` | Flashcard + her 10 kelimede pratik turu |
| Tekrar | `/dashboard/review` | SM-2'ye göre tekrar zamanı gelen kelimeler |
| Kelimelerim | `/dashboard/words` | Öğrenilen, öğreniliyor, zor kelimeler |
| İlerleme | `/dashboard/progress` | Grafikler, sınav geçmişi, rozetler |
| Sınav | `/dashboard/exam` | Seviye geçiş sınavı (70 puan geçme notu) |
| Ayarlar | `/dashboard/settings` | Profil, günlük hedef, seviye seçimi |
| Seed Paneli | `/dashboard/admin/seed` | Claude API ile kelime üretme |

---

## ❓ Sıkça Sorulan Sorular

**Çalışmaya başla diyorum kelime gelmiyor**  
`003_seed_a1_words.sql` dosyasını Supabase SQL Editor'de çalıştırmadın. Adım 7'yi uygula.

**"Your credit balance is too low" hatası**  
Anthropic API kredin bitti. [console.anthropic.com](https://console.anthropic.com) → Billing → kredi ekle.  
Ya da AI özelliğini atlayıp `003_seed_a1_words.sql` ile devam et.

**CSS bozuk görünüyor / stiller gelmiyor**  
```bash
npm install @tailwindcss/postcss
npm run dev
```
`postcss.config.mjs` dosyasının içeriği şöyle olmalı:
```js
const config = { plugins: { '@tailwindcss/postcss': {} } }
export default config
```

**Supabase "URL and Key required" hatası**  
`.env.local` dosyası ya yok ya da boş. Adım 5'i uygula ve sunucuyu yeniden başlat.

**Ortam değişkenlerini değiştirdim ama hata devam ediyor**  
Terminalde `Ctrl+C` ile sunucuyu durdur, `npm run dev` ile yeniden başlat.  
Next.js `.env.local` değişikliklerini otomatik algılamaz.

**Google ile giriş çalışmıyor**  
Supabase → Authentication → Providers → Google'ı aktif et.  
Google Cloud Console'dan OAuth 2.0 credentials oluşturman gerekiyor.

---

## 📄 Lisans

MIT License — dilediğin gibi kullanabilirsin.
