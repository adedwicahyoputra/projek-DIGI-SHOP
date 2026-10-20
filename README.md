# ✨ TITIK DIGI SHOP

Satu tempat, beragam kebutuhan digital.

Projek ini berisi:
- **Landing Page Katalog Web** (`index.html`): Katalog produk aplikasi premium berbasis Tailwind CSS.
- **Bot WhatsApp Otomatis** (`bot-wa.js`): Bot admin otomatis untuk menjawab pricelist produk dan mengirim kode QRIS menggunakan `@whiskeysockets/baileys`.

---

## 🚀 Cara Menjalankan Projek

### 1. Install Dependensi
Buka terminal di folder projek ini, lalu jalankan:
```bash
npm install
```

### 2. Jalankan Bot WhatsApp
```bash
npm start
```
Atau jalankan file `start-bot.bat`.

### 3. Scan QR-Code WhatsApp Admin
Saat bot pertama kali dijalankan, scan QR-Code yang muncul di terminal menggunakan WhatsApp Admin melalui menu **Perangkat Tertaut** (*Linked Devices*).

---

## 📌 Catatan Keamanan
Folder `sesi_wa_admin/` **tidak boleh diunggah ke publik** karena berisi kredensial login WhatsApp. File tersebut sudah otomatis diabaikan oleh `.gitignore`.
