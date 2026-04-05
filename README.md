# Warta Jemaat Pro (WartaFlow)

WartaFlow adalah aplikasi berbasis web modern yang dibangun untuk menyederhanakan dan mengotomatiskan pembuatan warta jemaat dan liturgi ibadah gereja. Dengan engine auto-pagination khusus, aplikasi ini memastikan lirik lagu dan teks liturgi terformat secara proporsional secara otomatis dan dapat dicetak ke dalam format kertas A4 landscape (Dua Kolom/Tiga Kolom).

## 🚀 Fitur Utama

- **Live Form & Preview**: Interface responsif untuk menginput data warta dan preview cetak real-time.
- **Auto-Pagination Print Engine**: Memisahkan teks lirik secara cerdas dengan batas maksimal baris agar pas dicetak di kertas A4 tanpa terpotong (menghindari orphan/widow lines).
- **Manajemen Lagu (Database)**: Sistem repository lengkap dengan Bulk Import data menggunakan Excel (.xlsx), CSV, atau TXT.
- **Supabase Integration**: Penyimpanan cloud backend yang terpercaya untuk menyimpan draf warta (tanggal, tema pelayanan, ayat referensi) dan bank lagu jemaat.
- **Banner Placement Dinamis**: Terdapat posisi banner terpisah untuk desain Header Kiri dan Kanan.
- **Aman Beragam Perangkat**: UI fully-responsive (Mobile/Desktop Friendly) yang dibuat menggunakan utility classes Tailwind CSS.

## 🛠️ Stack Teknologi

- **Frontend**: [Next.js](https://nextjs.org/) (App Directory) & React 18+
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL & GoTrue)
- **Icons**: Lucide React
- **Pustaka Eksternal**: XLSX (melalui CDN)

---

## 💻 Cara Instalasi (Pengembangan Lokal)

Ikuti langkah-langkah di bawah ini untuk menjalankan WartaFlow di komputer lokal Anda:

### 1. Clone Repository & Install Dependency
```bash
git clone https://github.com/ergonrizky26/warta-gen.git
cd warta-gen
npm install
```

### 2. Konfigurasi Environment Variables
Buat sebuah file `.env.local` di *root* direktori proyek. Isi variabel berikut ini sesuai dengan kredensial project Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eYJ_XXXX_XXXX_XXXX
```
*(Catatan: sangat disarankan untuk memiliki 2 kredensial terpisah, satu disetel khusus untuk mode UAT / Lokal, dan satu lagi khusus untuk environment PROD / Live).*

### 3. Run Development Server
```bash
npm run dev
```
Bukalah [http://localhost:3000](http://localhost:3000) pada browser Anda. Sistem akan mulai otomatis me-load file `app/page.tsx`. 

---

## 📤 Instruksi Deployment (Vercel)

Aplikasi ini dipersiapkan untuk dideploy ke [Vercel](https://vercel.com/) dengan menggunakan skema pemisahan environment:

### Branch Management
| Environment | Branch | Deskripsi |
| --- | --- | --- |
| **UAT / Preview** | `develop` | Branch eksperimental, draf fitur, tersambung ke `Supabase DB UAT`. (Wajib tes bebas bug di sini) |
| **Production** | `main` | Branch stabil (Live environment), tersambung secara live ke `Supabase DB PROD`. |

### Setup Variabel Vercel
Pada *dashboard* Vercel project, jangan lupa untuk mendefinisikan Variabel Supabase (`NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`) **dua kali** dengan konfigurasi pemisahan *Deployment Environment*, sehingga branch `develop` (Preview) dan `main` (Production) berpisah jalur database secara mulus.

---

## 📝 Catatan Khusus
- **Fitur Print**: Disarankan melakukan operasi print menggunakan peramban (browser) moderen basis Chromium (seperti Google Chrome atau Microsoft Edge) meminimalisir deviasi *padding margin print*.
- **Bulk Import**: Pastikan file yang akan Anda import menggunakan kolom pertama sebagai `Judul Lagu` dan kolom kedua berisi blok `Lirik`.

---
*Dibuat untuk mempermudah pelayanan dan pemberitaan digital jemaat.* Tuhan Memberkati!
