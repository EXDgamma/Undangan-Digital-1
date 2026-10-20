// =========================================================
// script.js — Undangan Pernikahan Fajri & Fiqa
// Setiap fitur mengecek dulu apakah elemennya sudah ada di halaman,
// jadi tidak error meskipun isi index.html belum lengkap.
// =========================================================

// =========================================================
// JS 1. NAMA TAMU DARI LINK
// Contoh link: index.html?to=Budi+Santoso  →  tampil "Budi Santoso"
// =========================================================
const parameter = new URLSearchParams(window.location.search);
const namaTamu = parameter.get("to");
const teksNamaTamu = document.getElementById("nama-tamu");
const inputNama = document.getElementById("input-nama");

if (namaTamu) {
  // Pakai textContent (bukan innerHTML) supaya teks dari link
  // tidak bisa disisipi kode berbahaya.
  if (teksNamaTamu) teksNamaTamu.textContent = namaTamu;
  if (inputNama) inputNama.value = namaTamu;
}

// =========================================================
// JS 2. TOMBOL "BUKA UNDANGAN" & MUSIK
// =========================================================
const sampul = document.getElementById("sampul");
const tombolBuka = document.getElementById("tombol-buka");
const musik = document.getElementById("musik");
const tombolMusik = document.getElementById("tombol-musik");

if (tombolBuka) {
  tombolBuka.addEventListener("click", () => {
    // Kembali ke paling atas secara instan, mengabaikan scroll-behavior: smooth di CSS
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.classList.remove("terkunci"); // halaman bisa digulir lagi
    document.documentElement.classList.add("terbuka"); // memicu animasi di CSS
    if (sampul) sampul.inert = true; // sampul tidak bisa diklik lagi

    // Browser hanya mengizinkan musik diputar setelah pengunjung mengklik sesuatu,
    // karena itu musik dimulai di sini, bukan saat halaman dimuat.
    if (musik && tombolMusik) {
      musik
        .play()
        .then(() => {
          tombolMusik.hidden = false;
          tombolMusik.classList.add("berputar");
        })
        .catch(() => {
          tombolMusik.hidden = true; // file musik belum ada atau diblokir
        });
    }
  });
}

if (musik && tombolMusik) {
  tombolMusik.addEventListener("click", () => {
    if (musik.paused) {
      musik.play().catch(() => {});
      tombolMusik.classList.add("berputar");
      tombolMusik.setAttribute("aria-label", "Jeda musik");
    } else {
      musik.pause();
      tombolMusik.classList.remove("berputar");
      tombolMusik.setAttribute("aria-label", "Putar musik");
    }
  });
}

// =========================================================
// JS 3. HITUNG MUNDUR KE HARI-H
// =========================================================
const hariH = new Date("2026-12-25T14:00:00+07:00"); // GANTI dengan tanggal & jam akadmu (WIB = +07:00)
const kotakHitung = document.getElementById("hitung-mundur");
let pengatur;

function duaDigit(angka) {
  return String(angka).padStart(2, "0"); // 7 → "07"
}

function perbaruiHitungMundur() {
  const sisa = hariH - new Date(); // selisih dalam milidetik

  if (sisa <= 0) {
    kotakHitung.textContent =
      "Hari bahagia telah tiba. Terima kasih atas doa restunya.";
    kotakHitung.classList.add("selesai");
    clearInterval(pengatur);
    return;
  }

  document.getElementById("hm-hari").textContent = Math.floor(sisa / 86400000); // 1 hari = 86.400.000 ms
  document.getElementById("hm-jam").textContent = duaDigit(
    Math.floor(sisa / 3600000) % 24,
  );
  document.getElementById("hm-menit").textContent = duaDigit(
    Math.floor(sisa / 60000) % 60,
  );
  document.getElementById("hm-detik").textContent = duaDigit(
    Math.floor(sisa / 1000) % 60,
  );
}

if (kotakHitung) {
  pengatur = setInterval(perbaruiHitungMundur, 1000); // jalankan tiap 1 detik
  perbaruiHitungMundur(); // dan sekali di awal
}

// =========================================================
// JS 4. SALIN NOMOR REKENING
// =========================================================
document.querySelectorAll(".tombol-salin").forEach((tombol) => {
  tombol.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(tombol.dataset.nomor);
      tombol.textContent = "Nomor tersalin";
    } catch {
      tombol.textContent = "Gagal menyalin, salin manual";
    }
    setTimeout(() => {
      tombol.textContent = "Salin Nomor";
    }, 2500);
  });
});

// =========================================================
// JS 5. KONFIRMASI KEHADIRAN & UCAPAN
// Catatan: localStorage hanya menyimpan data di browser pengunjung itu sendiri.
// Agar semua tamu bisa saling melihat ucapan, data harus dikirim ke tempat
// penyimpanan bersama, misalnya Google Sheets lewat Google Apps Script.
// =========================================================
const KUNCI_SIMPAN = "ucapan-fajri-fiqa";
const wadahUcapan = document.getElementById("daftar-ucapan");
const tombolKirim = document.getElementById("tombol-kirim");

function ambilUcapan() {
  try {
    return JSON.parse(localStorage.getItem(KUNCI_SIMPAN)) || [];
  } catch {
    return [];
  }
}

function simpanUcapan(daftar) {
  try {
    localStorage.setItem(KUNCI_SIMPAN, JSON.stringify(daftar));
  } catch {
    // penyimpanan tidak tersedia; ucapan tetap tampil sampai halaman ditutup
  }
}

function tampilkanUcapan(daftar) {
  wadahUcapan.replaceChildren(); // kosongkan dulu

  if (daftar.length === 0) {
    const kosong = document.createElement("p");
    kosong.className = "kosong";
    kosong.textContent = "Belum ada ucapan. Tulis yang pertama di atas.";
    wadahUcapan.append(kosong);
    return;
  }

  for (const item of daftar) {
    const kartu = document.createElement("article");
    kartu.className = "ucapan";

    const kepala = document.createElement("p");
    kepala.className = "kepala-ucapan";
    const nama = document.createElement("strong");
    nama.textContent = item.nama;
    const status = document.createElement("span");
    status.className = "status";
    status.textContent = item.kehadiran;
    kepala.append(nama, status);

    const isi = document.createElement("p");
    isi.className = "isi-ucapan";
    isi.textContent = item.pesan;

    const waktu = document.createElement("time");
    waktu.textContent = new Date(item.waktu).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    kartu.append(kepala, isi, waktu);
    wadahUcapan.append(kartu);
  }
}

if (wadahUcapan && tombolKirim) {
  let semuaUcapan = ambilUcapan();
  tampilkanUcapan(semuaUcapan);

  tombolKirim.addEventListener("click", () => {
    const nama = document.getElementById("input-nama").value.trim();
    const kehadiran = document.getElementById("input-hadir").value;
    const pesan = document.getElementById("input-pesan").value.trim();
    const info = document.getElementById("info-form");

    if (!nama || !pesan) {
      info.textContent = "Isi nama dan ucapan terlebih dahulu.";
      return;
    }

    semuaUcapan.unshift({ nama, kehadiran, pesan, waktu: Date.now() }); // terbaru di atas
    simpanUcapan(semuaUcapan);
    tampilkanUcapan(semuaUcapan);

    document.getElementById("input-pesan").value = "";
    info.textContent = "Ucapan terkirim. Terima kasih!";
  });
}
