# Panduan Menambah Produk - Lokal-Lapak

## ✅ Sistem yang Sudah Dibuat
- **1 file HTML template**: `detail.html` (berfungsi sebagai halaman detail untuk SEMUA produk)
- **1 file JSON**: `products.json` (berisi semua data produk)
- **Sistem dinamis**: Ketika user klik produk di index.html, detail.html otomatis menampilkan produk yang sesuai

## 📋 Cara Kerja

```
index.html (user klik produk Basreng)
    ↓
Link: detail.html?id=1
    ↓
detail.html (membaca parameter id=1)
    ↓
Ambil data dari products.json
    ↓
Tampilkan produk dengan id=1 (Basreng)
```

---

## 🚀 Cara Menambah Produk

### Step 1: Buka `products.json`

### Step 2: Tambahkan object produk baru di dalam array `"products"`

```json
{
  "id": 10,
  "name": "Nama Produk Anda",
  "price": 25000,
  "weight": "300gr",
  "category": "pedes|manis|sehat|kiloan",
  "badge": "Teks badge",
  "badgeColor": "error|secondary|tertiary|outline",
  "rating": "4.8/5",
  "sold": 1500,
  "image": "URL_GAMBAR_PRODUK",
  "description": "Deskripsi produk yang panjang...",
  "shipping": "Kilat",
  "special": "Tanpa MSG|Alami|Premium Quality|Dsb",
  "reviews": [
    {
      "name": "Nama Reviewer",
      "rating": 5,
      "text": "Komentar review yang positif..."
    },
    {
      "name": "Nama Reviewer 2",
      "rating": 4,
      "text": "Komentar review kedua..."
    }
  ]
}
```

### Step 3: Pastikan format JSON benar
- Setiap produk dibatasi dengan koma (`,`) kecuali yang terakhir
- ID harus unik dan berurut
- Category harus: `pedes`, `manis`, `sehat`, atau `kiloan`

### Step 4: Simpan file

**Automaticly**, produk akan muncul di index.html dan bisa diklik untuk melihat detail di detail.html!

---

## 📝 Daftar Field Produk

| Field | Tipe | Contoh | Keterangan |
|-------|------|--------|-----------|
| id | Number | 1 | ID unik, harus berbeda untuk setiap produk |
| name | String | "Basreng Pedas Daun Jeruk" | Nama lengkap produk |
| price | Number | 15000 | Harga dalam Rupiah (tanpa Rp) |
| weight | String | "250gr" | Berat atau jumlah pcs |
| category | String | "pedes" | Kategori produk |
| badge | String | "Pedas Level MAX" | Teks badge di gambar |
| badgeColor | String | "error" | Warna badge |
| rating | String | "4.9/5" | Rating produk |
| sold | Number | 2400 | Jumlah terjual |
| image | String | "https://..." | URL gambar produk |
| description | String | "Cemilan pas..." | Deskripsi panjang produk |
| shipping | String | "Kilat" | Jenis pengiriman |
| special | String | "Tanpa MSG" | Keunikan produk |
| reviews | Array | [...] | Daftar review dari customer |

---

## 🎨 Pilihan Color Badge
- `error` = Merah (untuk Pedas)
- `secondary` = Pink/Merah muda (untuk Manis)
- `tertiary` = Kuning (untuk Kiloan)
- `outline` = Abu-abu (untuk Info umum)

---

## 📸 Tips URL Gambar
- Gunakan gambar dari Google Images atau Unsplash (copy image URL)
- Atau upload gambar di hosting gratis seperti Imgur, Imgbb
- Pastikan URL berakhir dengan format gambar (.jpg, .png, .webp, etc)

---

## ✏️ Contoh Menambah Produk Baru

Tambahkan sebelum `]` penutup array di products.json:

```json
    {
      "id": 10,
      "name": "Brownies Coklat Dark",
      "price": 22000,
      "weight": "200gr (8 pcs)",
      "category": "manis",
      "badge": "Coklat Belgia",
      "badgeColor": "secondary",
      "rating": "4.9/5",
      "sold": 890,
      "image": "https://images.unsplash.com/photo-1607623614075-e51df1bdc82f?w=500&h=500&fit=crop",
      "description": "Brownies lezat dengan coklat Belgia premium yang legit. Teksturnya moist dan coklat-nya melumer di mulut. Cocok untuk oleh-oleh atau hadiah spesial.",
      "shipping": "Kilat",
      "special": "Coklat Premium",
      "reviews": [
        {
          "name": "Citra Dewi",
          "rating": 5,
          "text": "Brownies terlegit yang pernah aku coba! Coklat-nya premium banget"
        }
      ]
    }
```

---

## 🔧 Konfigurasi WhatsApp (PENTING!)

Di file `detail.html`, cari bagian ini di script:

```javascript
const whatsappNumber = '62123456789'; // Ganti dengan nomor WhatsApp Anda
```

Ubah `62123456789` dengan nomor WhatsApp Anda dalam format:
- **Format**: `62XXXXXXXXX` (62 + nomormu tanpa 0 di awal)
- **Contoh**: `628123456789` untuk `+62 812-345-6789`

---

## ✨ Yang Sudah Otomatis

Ketika Anda menambah produk baru di `products.json`:
- ✅ Muncul otomatis di halaman index.html
- ✅ Bisa diklik dan menampilkan detail di detail.html
- ✅ Review muncul otomatis
- ✅ Rating, harga, deskripsi semuanya terbaca otomatis

**Tidak perlu edit HTML sama sekali!** 

---

## 🎯 Target: 30+ Produk

Dengan sistem ini, Anda bisa dengan mudah menambah hingga 30+ produk hanya dengan:
1. Copy-paste blok JSON produk
2. Ubah data sesuai produk baru
3. Simpan file

Selesai! Produk langsung muncul di website. 🎉
