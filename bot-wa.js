/**
 * ============================================================================
 * BOT WHATSAPP OTOMATIS — ✨ TITIK DIGI SHOP ✨ (Admin: +62 858-5951-7510)
 * ============================================================================
 * Fitur:
 * 1. Saat dijalankan pertama kali, otomatis memunculkan QR-Code di layar
 *    untuk di-scan lewat WhatsApp Admin (Menu "Perangkat Tertaut").
 * 2. Saat buyer mengetik nama aplikasi (misal: "netflix", "canva", "chatgpt"),
 *    Bot otomatis membalas Pricelist & Fitur + arahan ketik "bayar".
 * 3. Saat buyer mengetik "bayar" atau "payment", Bot otomatis mengirimkan
 *    Gambar QR-Code QRIS (file qris.png / qris.jpg) + Panduan Cara Scan QRIS!
 * ============================================================================
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");

// ============================================================================
// 1. TEKS ARAHAN OTOMATIS DI BAWAH SETIAP PRICELIST
// ============================================================================
const FOOTER_BAYAR = `
━━━━━━━━━━━━━━━━━━━━━━
✅ *SUDAH COCOK DENGAN HARGA & FITURNYA?*
Silakan balas chat ini dengan ketik:
👉 *bayar*  *(atau ketik: payment)*
Maka Admin otomatis mengirimkan *QR-Code QRIS* beserta panduan pembayarannya!

🔍 *INGIN CEK PRICELIST PRODUK YANG LAIN?*
• *Ketik Manual:* Langsung ketik nama aplikasi lain di chat ini (contoh: *netflix*, *youtube*, *chatgpt*, *canva*, atau ketik *menu* untuk daftar lengkap).
• *Via Website:* Atau silakan kembali memilih produk melalui *Landing Page* katalog kami.

📌 *Jangan lupa Save Kontak Admin (+62 858-5951-7510)* untuk Syarat Klaim Garansi & Info Promo di Story WA ya! ✨`;

// ============================================================================
// 2. PANDUAN & PESAN OTOMATIS SAAT BUYER KETIK "BAYAR" / "PAYMENT"
// ============================================================================
const PANDUAN_SCAN_QRIS = `✨ *PEMBAYARAN QRIS — TITIK DIGI SHOP* ✨

Silakan lakukan pembayaran sesuai nominal harga paket yang kakak pilih melalui *QR-Code QRIS* di atas (Mendukung *DANA, GoPay, OVO, ShopeePay, LinkAja, BCA, BRI, Mandiri, BNI, SeaBank*, dll).

📱 *PANDUAN CARA SCAN QRIS (CUKUP PAKAI 1 HP):*
1️⃣ *Simpan / Screenshot* gambar QR-Code QRIS di atas ke Galeri HP kakak.
2️⃣ Buka aplikasi *E-Wallet atau Mobile Banking* kakak, lalu pilih menu *"Bayar / Scan QRIS"*.
3️⃣ Klik *Ikon Galeri / Gambar* di pojok layar kamera scan, lalu pilih gambar QRIS yang sudah disimpan tadi.
4️⃣ Masukkan *Nominal Pembayaran* sesuai harga paket, lalu selesaikan transaksi.

📩 *KONFIRMASI PESANAN:*
Setelah berhasil membayar, wajib kirimkan ke chat ini:
• *Screenshot Bukti Pembayaran*
• *Nama Aplikasi & Durasi yang dibeli* (Contoh: _Netflix Sharing 1 Bulan_)

Pesanan kakak akan langsung Admin proses! 🚀`;

// ============================================================================
// 3. DATABASE PRICELIST 43 PRODUK (SILAKAN SESUAIKAN HARGA DI SINI)
// ============================================================================
const pricelists = {
  "netflix": `🍿 *PRICELIST NETFLIX PREMIUM UHD 4K* 🍿

✨ *Fitur Unggulan:*
• Kualitas Ultra HD 4K + Subtitle Indonesia
• Bisa di HP, Laptop, Tablet & Smart TV
• Full Garansi selama masa aktif (Wajib Save Nomor Admin)

💰 *Pilihan Paket Harga:*
• Sharing 1P1U (1 Bulan): Rp 25.000
• Sharing 1P2U (1 Bulan): Rp 18.000
• Semi Private (1 Bulan): Rp 35.000
• Private Akun (1 Bulan): Rp 120.000`,

  "youtube": `▶️ *PRICELIST YOUTUBE PREMIUM + MUSIC* ▶️

✨ *Fitur Unggulan:*
• 100% Bebas Iklan di YouTube & YouTube Music
• Putar video di latar belakang / layar mati
• Bisa menggunakan email kakak sendiri (Invite/Indplan)

💰 *Pilihan Paket Harga:*
• Invite Family 1 Bulan: Rp 10.000
• Individual Plan 1 Bulan: Rp 15.000
• Individual Plan 3 Bulan: Rp 35.000`,

  "disney": `🏰 *PRICELIST DISNEY+ HOTSTAR* 🏰

✨ *Fitur Unggulan:*
• Akses semua film Marvel, Disney, Pixar, Star Wars & Indonesia
• Resolusi HD / 4K UHD

💰 *Pilihan Paket Harga:*
• Sharing 1 Bulan (Plan Basic/Premium): Rp 25.000
• Private 1 Bulan: Rp 65.000`,

  "canva": `🎨 *PRICELIST CANVA PRO* 🎨

✨ *Fitur Unggulan:*
• Buka semua template, elemen & font mahkota (Pro)
• Fitur Hapus Background 1-klik & Magic AI Studio
• Invite langsung ke email kakak sendiri (Desain aman)

💰 *Pilihan Paket Harga:*
• Canva Pro 1 Bulan: Rp 8.000
• Canva Pro 6 Bulan: Rp 20.000
• Canva Pro 1 Tahun: Rp 30.000`,

  "capcut": `✂️ *PRICELIST CAPCUT PRO* ✂️

✨ *Fitur Unggulan:*
• Buka seluruh efek Pro, transisi viral & auto-caption
• Ekspor video jernih hingga 4K 60fps tanpa watermark

💰 *Pilihan Paket Harga:*
• CapCut Pro Sharing 1 Bulan: Rp 15.000
• CapCut Pro Private 1 Bulan: Rp 30.000`,

  "chatgpt": `🤖 *PRICELIST CHATGPT PLUS (GPT-4o)* 🤖

✨ *Fitur Unggulan:*
• Akses model terbaru GPT-4o super cepat
• Bisa upload dokumen PDF/Excel, coding & buat gambar DALL-E

💰 *Pilihan Paket Harga:*
• Sharing 1 Bulan (Garansi): Rp 35.000
• Private 1 Bulan: Rp 185.000`,

  "gemini": `♊ *PRICELIST GOOGLE GEMINI ADVANCED* ♊

✨ *Fitur Unggulan:*
• Model AI tercanggih dari Google + integrasi Google Workspace
• Cocok untuk riset kuliah, skripsi, coding & penulisan

💰 *Pilihan Paket Harga:*
• Gemini Advanced 1 Bulan: Rp 25.000`,

  "claude": `🧠 *PRICELIST CLAUDE AI PRO* 🧠

✨ *Fitur Unggulan:*
• AI terbaik untuk penulisan artikel natural, riset panjang & coding

💰 *Pilihan Paket Harga:*
• Claude Pro Sharing 1 Bulan: Rp 40.000`,

  "grok": `🚀 *PRICELIST GROK AI PREMIUM* 🚀

✨ *Fitur Unggulan:*
• AI Real-Time untuk riset tren terbaru & buat gambar AI

💰 *Pilihan Paket Harga:*
• Grok AI 1 Bulan: Rp 35.000`,

  "leonardo": `🎭 *PRICELIST LEONARDO AI PRO* 🎭

✨ *Fitur Unggulan:*
• Generator gambar & ilustrasi AI kualitas studio

💰 *Pilihan Paket Harga:*
• Leonardo AI 1 Bulan: Rp 35.000`,

  "ai": `⚡ *PRICELIST PAKET AI / ADOBE ILLUSTRATOR* ⚡

✨ *Fitur Unggulan:*
• Kebutuhan tools AI & software desain profesional

💰 *Info Harga:*
• Mulai dari Rp 25.000 (Silakan sebutkan tipe yang diinginkan)`,

  "am": `🌀 *PRICELIST ALIGHT MOTION (AM) PRO* 🌀

✨ *Fitur Unggulan:*
• Edit video jedag-jedug & animasi bebas watermark
• Support import preset XML & tautan

💰 *Pilihan Paket Harga:*
• AM Pro 1 Tahun (Sharing): Rp 12.000
• AM Pro 1 Tahun (Private): Rp 20.000`,

  "bstation": `👾 *PRICELIST BSTATION (BILIBILI) VIP* 👾
• Sharing 1 Bulan: Rp 12.000
• Private 1 Bulan: Rp 25.000`,

  "crunchyroll": `🍥 *PRICELIST CRUNCHYROLL MEGA FAN* 🍥
• Sharing 1 Bulan: Rp 15.000
• Private 1 Bulan: Rp 30.000`,

  "dramabox": `📱 *PRICELIST DRAMABOX VIP* 📱
• Buka semua episode drama pendek viral tanpa koin!
• Sharing 1 Bulan: Rp 20.000`,

  "melolo": `💞 *PRICELIST MELOLO VIP* 💞
• Nonton short drama romantis full episode tanpa iklan!
• Sharing 1 Bulan: Rp 20.000`,

  "duolingo": `🦉 *PRICELIST SUPER DUOLINGO* 🦉
• Unlimited Hearts (Nyawa tak terbatas) & bebas iklan!
• Invite 1 Bulan: Rp 15.000`,

  "gdrive": `☁️ *PRICELIST GOOGLE DRIVE STORAGE* ☁️
• Tambahan penyimpanan cloud aman untuk backup foto/video.
• Paket Mulai: Rp 15.000`,

  "google one": `🌐 *PRICELIST GOOGLE ONE RESMI* 🌐
• Kapasitas ekstra untuk Google Drive, Gmail & Google Photos.
• Paket 100GB / 200GB / 2TB Mulai: Rp 15.000`,

  "gmail": `✉️ *PRICELIST AKUN GMAIL FRESH* ✉️
• Akun Gmail siap pakai & bergaransi login.
• Harga per akun: Rp 5.000`,

  "getcontact": `📞 *PRICELIST GETCONTACT PREMIUM* 📞
• Cek siapa yang melihat tag nomor kamu & bebas iklan.
• 1 Bulan: Rp 15.000`,

  "hbo": `🎭 *PRICELIST HBO GO / MAX* 🎭
• Sharing 1 Bulan: Rp 20.000
• Private 1 Bulan: Rp 45.000`,

  "instagram": `📸 *PRICELIST SUNTIK INSTAGRAM* 📸
• Tambah Followers, Likes & Views Reels proses cepat (Tanpa Password).
• Harga mulai: Rp 5.000 (Sebutkan jumlah yang diinginkan)`,

  "tiktok": `🎵 *PRICELIST SUNTIK TIKTOK* 🎵
• Tambah Followers, Likes & Views TikTok aman (Tanpa Password).
• Harga mulai: Rp 5.000 (Sebutkan jumlah yang diinginkan)`,

  "iqiyi": `🐉 *PRICELIST iQIYI VIP* 🐉
• Sharing 1 Bulan: Rp 12.000
• Private 1 Bulan: Rp 28.000`,

  "lightroom": `📸 *PRICELIST ADOBE LIGHTROOM PREMIUM* 📸
• Edit foto & preset premium lengkap di HP.
• 1 Tahun: Rp 20.000`,

  "loklok": `🎞️ *PRICELIST LOKLOK VIP* 🎞️
• Nonton film, drakor & anime bebas iklan.
• Sharing 1 Bulan: Rp 15.000`,

  "meitu": `✨ *PRICELIST MEITU VIP* ✨
• Filter kecantikan, retouch HD & AI Art.
• Sharing 1 Bulan: Rp 18.000`,

  "picsart": `🖼️ *PRICELIST PICSART GOLD* 🖼️
• Edit foto & hapus background tanpa batas.
• Sharing 1 Bulan: Rp 10.000
• Private 1 Bulan: Rp 20.000`,

  "prime vidio": `🎬 *PRICELIST AMAZON PRIME VIDEO* 🎬
• Sharing 1 Bulan: Rp 12.000
• Private 1 Bulan: Rp 25.000`,

  "spotify": `🎧 *PRICELIST SPOTIFY PREMIUM* 🎧
• Musik bebas iklan, bebas skip & download offline.
• Famplan 1 Bulan: Rp 15.000
• Indplan 1 Bulan: Rp 22.000`,

  "strava": `🏃 *PRICELIST STRAVA SUBSCRIPTION* 🏃
• Analisis lari & sepeda lengkap.
• 1 Bulan: Rp 20.000`,

  "turnitin": `📄 *PRICELIST TURNITIN NO-REPOSITORY* 📄
• Cek plagiasi skripsi/jurnal aman tanpa tersimpan di database!
• 1x Cek / Langganan 1 Bulan Mulai: Rp 10.000`,

  "vidio": `⚽ *PRICELIST VIDIO PREMIER (PLATINUM / DIAMOND)* ⚽
• Nonton BRI Liga 1, Premier League, Liga Champions & Original Series.
• Platinum 1 Bulan (Mobile): Rp 18.000
• Platinum 1 Bulan (All Device): Rp 28.000
• Diamond (Liga Inggris) Mobile: Rp 55.000`,

  "viu": `🇰🇷 *PRICELIST VIU PREMIUM* 🇰🇷
• Maraton Drakor & Variety Show Korea tanpa iklan.
• Private 1 Bulan: Rp 10.000
• Private 6 Bulan: Rp 20.000`,

  "vpn": `🔒 *PRICELIST VPN PREMIUM* 🔒
• ExpressVPN / NordVPN / Surfshark / HMA.
• Sharing 1 Bulan Mulai: Rp 15.000`,

  "wetv": `📺 *PRICELIST WETV VIP* 📺
• Sharing 1 Bulan: Rp 12.000
• Private 1 Bulan: Rp 28.000`,

  "wink": `💎 *PRICELIST WINK VIP* 💎
• Perjelas kualitas video buram jadi HD jernih!
• Sharing 1 Bulan: Rp 20.000`,

  "zoom": `📹 *PRICELIST ZOOM PRO MEETING* 📹
• Bebas batas waktu 40 menit + Co-Host & Record.
• Sewa Harian: Rp 10.000
• Akun 1 Bulan (100 Peserta): Rp 35.000`,

  "pinjam qris": `📲 *LAYANAN PINJAM QRIS — TITIK DIGI SHOP* 📲
• Butuh kode QRIS cepat untuk menerima pembayaran atau pencairan saldo?
• Silakan sebutkan nominal yang ingin ditransaksikan, Admin akan segera memproses!`,

  "payment": `💳 *JASA PAYMENT & CONVERT SALDO* 💳
• Melayani bantuan pembayaran aplikasi/web & transfer antar E-Wallet/Bank.
• Ketik *bayar* untuk melihat QRIS toko kami, atau sebutkan transaksi yang kakak butuhkan.`,

  "toko digital": `🏪 *KEMITRAAN TOKO DIGITAL / RESELLER* 🏪
• Mau jualan 40+ Aplikasi Premium seperti Titik Digi Shop dengan harga modal super murah?
• Balas chat ini dengan ketik *minat reseller* untuk info pendaftaran mitra!`,

  "bonus": `🎁 *INFO PROGRAM BONUS — TITIK DIGI SHOP* 🎁
• Pastikan kakak sudah *Save Nomor Admin (+62 858-5951-7510)* dan pantau terus Story WA Admin untuk klaim bonus pelanggan setia & Flash Sale harian!`
};

// ============================================================================
// 4. TEKS MENU UTAMA (JIKA BUYER KETIK "MENU" / "LIST" / "KATALOG")
// ============================================================================
const MENU_KATALOG = `✨ *TITIK DIGI SHOP* ✨
_Satu tempat, beragam kebutuhan digital._

Ketik salah satu nama aplikasi di bawah ini untuk melihat *Pricelist Otomatis*:

★ ai
★ am
★ bstation
★ canva
★ capcut
★ chatgpt
★ claude
★ crunchyroll
★ disney
★ dramabox
★ duolingo
★ gdrive
★ gemini
★ getcontact
★ gmail
★ google one
★ grok
★ hbo
★ instagram
★ iqiyi
★ leonardo
★ lightroom
★ loklok
★ meitu
★ melolo
★ netflix
★ picsart
★ prime vidio
★ spotify
★ strava
★ tiktok
★ turnitin
★ vidio
★ viu
★ vpn
★ wetv
★ wink
★ youtube
★ zoom

💳 *Ingin langsung membayar via QRIS?*
Ketik: *bayar* (atau *payment*)`;

// ============================================================================
// 5. FUNGSI UTAMA MENJALANKAN BOT WHATSAPP
// ============================================================================
async function startTitikDigiBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./sesi_wa_admin");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  // Tampilkan QR-Code untuk di-scan oleh WA Admin (+62 858-5951-7510)
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.clear();
      console.log("=========================================================");
      console.log("📲 SCAN QR-CODE INI DARI WHATSAPP ADMIN (+62 858-5951-7510)");
      console.log("Cara Scan: Buka WA -> Titik Tiga -> Perangkat Tertaut -> Tautkan Perangkat");
      console.log("=========================================================\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Koneksi terputus. Mencoba menyambungkan ulang...", shouldReconnect);
      if (shouldReconnect) {
        startTitikDigiBot();
      } else {
        console.log("Sesi telah keluar (Logged Out). Hapus folder 'sesi_wa_admin' lalu jalankan ulang.");
      }
    } else if (connection === "open") {
      console.log("\n✅ BOT WHATSAPP TITIK DIGI SHOP BERHASIL AKTIF & SIAP MELAYANI BUYER 24 JAM!");
    }
  });

  // Mendengarkan Pesan Masuk dari Buyer
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    // Abaikan status story WA
    if (sender === "status@broadcast") return;

    // Ambil isi teks pesan dari buyer
    const textMessage =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      "";

    const cleanText = textMessage.trim().toLowerCase();
    if (!cleanText) return;

    // ------------------------------------------------------------------------
    // A. JIKA BUYER KETIK "BAYAR" / "PAYMENT" / "QRIS" -> KIRIM GAMBAR QRIS + PANDUAN
    // ------------------------------------------------------------------------
    if (cleanText === "bayar" || cleanText === "payment" || cleanText === "qris") {
      const qrisPng = path.join(__dirname, "qris.png");
      const qrisJpg = path.join(__dirname, "qris.jpg");
      const qrisJpeg = path.join(__dirname, "qris.jpeg");
      const kiurisJpeg = path.join(__dirname, "Kiuris.jpeg");

      let qrisPath = null;
      if (fs.existsSync(qrisPng)) qrisPath = qrisPng;
      else if (fs.existsSync(qrisJpg)) qrisPath = qrisJpg;
      else if (fs.existsSync(qrisJpeg)) qrisPath = qrisJpeg;
      else if (fs.existsSync(kiurisJpeg)) qrisPath = kiurisJpeg;

      if (qrisPath) {
        // Kirim Gambar QRIS + Caption Panduan Scan QRIS
        await sock.sendMessage(sender, {
          image: fs.readFileSync(qrisPath),
          caption: PANDUAN_SCAN_QRIS
        });
      } else {
        // Jika pemilik toko belum menaruh file qris.png / qris.jpg di folder
        await sock.sendMessage(sender, {
          text:
            PANDUAN_SCAN_QRIS +
            "\n\n_(Catatan: Gambar QRIS sedang disiapkan Admin, silakan tunggu sebentar ya kak)_"
        });
      }
      return;
    }

    // ------------------------------------------------------------------------
    // B. JIKA BUYER KETIK "MENU" / "LIST" / "KATALOG" -> KIRIM DAFTAR 43 PRODUK
    // ------------------------------------------------------------------------
    if (cleanText === "menu" || cleanText === "list" || cleanText === "katalog" || cleanText === "pricelist") {
      await sock.sendMessage(sender, { text: MENU_KATALOG });
      return;
    }

    // ------------------------------------------------------------------------
    // C. JIKA BUYER KETIK NAMA APLIKASI (MISAL: "netflix", "canva", "chatgpt")
    // ------------------------------------------------------------------------
    if (pricelists[cleanText]) {
      const replyText = `${pricelists[cleanText]}\n${FOOTER_BAYAR}`;
      await sock.sendMessage(sender, { text: replyText });
      return;
    }
  });
}

startTitikDigiBot();
