import * as React from "react"

export type Language = "id" | "en"

const STORAGE_KEY = "iamkomik-language"

const translations: Record<string, string> = {
  // Navigation
  Beranda: "Home",
  Jelajah: "Explore",
  Anime: "Anime",
  Koleksi: "Library",
  Statistik: "Stats",
  "Koleksi gue": "My library",
  "Statistik bacaan": "Reading stats",
  "Navigasi utama": "Main navigation",
  Komik: "Comic",
  Trending: "Trending",
  Chapter: "Chapter",

  // Header / account
  "Cari komik…": "Search comics…",
  "Cari komik": "Search comics",
  "Aktifkan mode terang": "Switch to light mode",
  "Aktifkan mode gelap": "Switch to dark mode",
  "Menu profil": "Profile menu",
  Tutup: "Close",
  "Pembaca IamKomik": "IamKomik Reader",
  "Mode anonim · tersimpan lokal": "Guest mode · saved on this device",
  "Mode tamu": "Guest mode",
  "Salin ID perangkat": "Copy device ID",
  "ID perangkat disalin": "Device ID copied",
  "Bisa dipakai buat backup data koleksi lo.": "Use it to back up your library data.",
  "Gagal menyalin ID perangkat": "Failed to copy device ID",
  "Mode terang": "Light mode",
  "Mode gelap": "Dark mode",
  Masuk: "Log in",
  Daftar: "Sign up",
  Keluar: "Log out",
  Bahasa: "Language",
  Indonesia: "Indonesian",
  English: "English",
  Akun: "Account",
  "Masuk atau daftar": "Log in or sign up",

  // Footer
  "Komik trending": "Trending comics",
  "Update terbaru": "Latest updates",
  "Anime ongoing": "Ongoing anime",
  "Dokumentasi API": "API docs",
  "Repo sumber API": "API source repo",
  "Ruang baca komik & anime dengan tampilan yang gak bikin pusing. Simpan favorit, lanjutin bacaan, dan lihat kebiasaan baca lo dalam satu tempat.":
    "A comic & anime reading space with a clean, easy-on-the-eyes layout. Save favorites, continue reading, and track your reading habits in one place.",
  "Dibuat untuk tugas & portofolio": "Built for a school project & portfolio",
  Jelajahi: "Explore",
  "Sumber & info": "Sources & info",
  "Data komik & anime dari Sanka API.": "Comic & anime data from Sanka API.",

  // Search dialog
  "Telusuri judul komik dari berbagai sumber.": "Browse comic titles from multiple sources.",
  "Cari judul komik…": "Search comic titles…",
  Cari: "Search",
  "Coba cari": "Try searching",
  "Belum ketemu hasilnya": "No results found",
  "Coba kata kunci lain atau buka halaman jelajah.": "Try another keyword or open the explore page.",
  "Lihat semua hasil": "View all results",
  "Lihat detail": "View details",

  // Offline / PWA
  "Mode offline — halaman yang udah kebuka tetap bisa dibaca, data baru nyusul pas online.":
    "Offline mode — pages you've opened are still readable; new data will load when you're back online.",
  "Pasang IamKomik": "Install IamKomik",
  "Buka lebih cepat, layar penuh, dan tetap bisa lanjut baca saat koneksi putus.":
    "Open faster, go full screen, and keep reading when the connection drops.",
  "Menyiapkan…": "Preparing…",
  "Pasang sekarang": "Install now",
  Nanti: "Later",
  "Tutup ajakan pasang aplikasi": "Close install prompt",

  // Save button
  "Hapus dari koleksi": "Remove from library",
  "Simpan ke koleksi": "Save to library",
  Tersimpan: "Saved",
  Simpan: "Save",

  // Home
  "6.000+ komik · update tiap hari": "6,000+ comics · updated daily",
  "Baca komik favorit,": "Read your favorite comics,",
  "tanpa drama.": "without the drama.",
  "Ribuan judul dari berbagai sumber, dikumpulin jadi satu tampilan yang rapi. Simpan yang lo suka, lanjutin bacaan kapan aja.":
    "Thousands of titles from multiple sources, gathered into one clean view. Save what you love and continue reading anytime.",
  "Mau baca apa hari ini?": "What do you want to read today?",
  Populer: "Popular",
  "Coba lagi": "Try again",
  "Lagi naik daun": "Trending now",
  "Yang ramai dibaca minggu ini": "Most read this week",
  "Pilihan dari daftar trending — biasanya yang paling sering update.":
    "Picks from the trending list — usually the ones that update most often.",
  "Lihat semua": "View all",
  Genre: "Genre",
  "Semua genre": "All genres",
  "Baru update": "Just updated",
  "Chapter baru, jangan sampai kelewatan": "New chapters, don't miss them",
  "Diurutkan dari yang paling baru di-update oleh sumbernya.":
    "Sorted by the most recent update from the source.",
  "Jelajah semua": "Explore all",
  "Reading insights": "Reading insights",
  "Lo udah baca berapa chapter minggu ini?": "How many chapters have you read this week?",
  "Semua aktivitas baca lo tercatat otomatis. Cek statistik, streak, dan genre favorit lo di dashboard.":
    "All your reading activity is tracked automatically. Check your stats, streak, and favorite genres on the dashboard.",
  "Buka dashboard": "Open dashboard",
  "Update hari ini": "Updated today",
  "40+ chapter baru": "40+ new chapters",
  Lanjutin: "Continue",
  "Masih penasaran sama ceritanya?": "Still curious about the story?",
  "Semua riwayat": "All history",
  "Lanjut baca": "Continue reading",
  "Pilihan editor": "Editor's pick",
  "{chapter} baru aja rilis. ": "{chapter} just dropped. ",
  "Buka detailnya buat lihat sinopsis, daftar chapter, dan rekomendasi serupa.":
    "Open the details to see the synopsis, chapter list, and similar recommendations.",
  "Simpan dulu": "Save for later",
  "Slide sebelumnya": "Previous slide",
  "Slide berikutnya": "Next slide",

  // Explore
  "Temukan bacaan baru.": "Find something new to read.",
  "Cari berdasarkan judul atau pilih genre. Semua hasil diambil langsung dari sumbernya, jadi update-nya cepat.":
    "Search by title or pick a genre. All results come straight from the source, so updates are fast.",
  "Memuat…": "Loading…",
  "{count} judul": "{count} titles",
  Acak: "Shuffle",
  "Cari judul komik, manga, manhwa…": "Search comic, manga, manhwa titles…",
  "Hapus pencarian": "Clear search",
  "Hasil untuk “{query}”": "Results for “{query}”",
  "Genre {genre}": "{genre} genre",
  "Lagi trending hari ini": "Trending today",
  "Reset filter": "Reset filters",
  "Paling banyak dibuka pembaca IamKomik.": "Most opened by IamKomik readers.",
  "Filter aktif": "Active filter",
  "Gagal ambil data": "Failed to load data",
  "Muat ulang": "Reload",
  "Gak ada hasil": "No results",
  "Coba kata kunci yang lebih pendek, atau pilih genre lain di atas.":
    "Try a shorter keyword or pick another genre above.",
  "Kembali ke trending": "Back to trending",
  "Mau lihat yang lagi update?": "Want to see what's updating?",
  "Halaman beranda nampilin chapter terbaru dari semua sumber.":
    "The home page shows the latest chapters from every source.",
  "Balik ke beranda": "Back to home",

  // Library
  "Koleksi pribadi": "Personal library",
  "Bacaan lo, rapi di sini.": "Your reading, all tidy here.",
  "Semua komik yang lo simpan dan riwayat baca tersimpan otomatis di perangkat ini. Gak perlu bikin akun.":
    "Every comic you save and your reading history are stored automatically on this device. No account needed.",
  "{count} favorit": "{count} favorites",
  "{count} riwayat": "{count} history",
  "Salin ID": "Copy ID",
  Favorit: "Favorites",
  "Riwayat baca": "Reading history",
  "Cari komik lagi": "Find more comics",
  "Belum ada komik yang disimpan": "No saved comics yet",
  "Tekan tombol Simpan di card komik mana pun, nanti muncul di sini.":
    "Tap Save on any comic card and it will show up here.",
  "Mulai jelajah": "Start exploring",
  "Belum ada riwayat baca": "No reading history yet",
  "Buka chapter pertama dari komik favorit lo, riwayatnya bakal otomatis muncul di sini.":
    "Open the first chapter of a favorite comic and its history will appear here automatically.",
  Lanjut: "Continue",
  "Dibaca {time}": "Read {time}",
  "Hapus riwayat": "Remove history",
  "Data lo aman di perangkat ini": "Your data is safe on this device",
  "Simpan ID perangkat buat mindahin koleksi ke browser lain.":
    "Save your device ID to move your library to another browser.",
  "Lihat statistik": "View stats",

  // Dashboard
  "Ini ringkasan kebiasaan baca lo. Semua dihitung dari aktivitas nyata di perangkat ini — bukan data karangan.":
    "Here's a summary of your reading habits. Everything is calculated from real activity on this device — no made-up data.",
  "Statistik belum bisa dimuat": "Stats couldn't be loaded",
  "Belum ada jejak bacaan": "No reading activity yet",
  "Buka satu chapter komik dulu, statistik, streak, dan genre favorit lo bakal otomatis muncul di sini.":
    "Open a comic chapter first, and your stats, streak, and favorite genres will appear here automatically.",
  "Chapter dibaca": "Chapters read",
  "{count} chapter minggu ini": "{count} chapters this week",
  "Komik dijelajahi": "Comics explored",
  "judul punya riwayat baca": "titles with reading history",
  "Komik favorit": "Favorite comics",
  "disimpan di koleksi": "saved in your library",
  "Streak baca": "Reading streak",
  "hari beruntun": "days in a row",
  hari: "days",
  "Aktivitas 14 hari": "14-day activity",
  "Chapter yang dibaca vs komik yang dibuka.": "Chapters read vs comics opened.",
  Dibaca: "Read",
  Dilihat: "Viewed",
  "Rata-rata {value} chapter/hari": "Average {value} chapters/day",
  "Estimasi {time} membaca": "Estimated {time} of reading",
  "Tipe komik": "Comic types",
  "Dari favorit + riwayat baca.": "From favorites + reading history.",
  "{count} komik": "{count} comics",
  "Tipe komik belum terdeteksi.": "No comic types detected yet.",
  "Genre teratas": "Top genres",
  "Genre yang paling sering lo buka.": "Genres you open the most.",
  "Genre belum tersedia.": "No genres available yet.",
  "Paling sering dibaca": "Most read",
  "Top 5 judul.": "Top 5 titles.",
  "Belum ada chapter yang dibaca.": "No chapters read yet.",
  "Target mingguan": "Weekly goal",
  "{done}/{goal} chapter": "{done}/{goal} chapters",
  "Target tercapai. Gila, konsisten banget.": "Goal reached. That's seriously consistent.",
  "Kurang {count} chapter lagi buat capai target.": "{count} more chapters to reach your goal.",
  "Aktivitas terakhir": "Recent activity",
  "10 kejadian terbaru.": "Latest 10 events.",
  "Koleksi lo tersimpan otomatis": "Your library is saved automatically",
  "Riwayat baca dan komik favorit tetap rapi di satu tempat.":
    "Reading history and favorite comics stay organized in one place.",
  "Buka koleksi": "Open library",

  // Comic detail
  "Komik gak ketemu": "Comic not found",
  "Data komik ini belum tersedia di sumbernya. Coba judul lain aja.":
    "This comic isn't available from the source yet. Try another title.",
  "Balik ke jelajah": "Back to explore",
  "{count} chapter tersedia": "{count} chapters available",
  "{count} chapter": "{count} chapters",
  "Update {date}": "Updated {date}",
  "Jelajah komik": "Explore comics",
  "Belum ada sinopsis untuk komik ini.": "No synopsis for this comic yet.",
  "Belum ada sinopsis untuk anime ini.": "No synopsis for this anime yet.",
  Sembunyikan: "Show less",
  "Baca selengkapnya": "Read more",
  "Lanjut {chapter}": "Continue {chapter}",
  "Mulai baca": "Start reading",
  "Daftar chapter": "Chapter list",
  "{count} chapter · Klik buat mulai baca": "{count} chapters · Click to start reading",
  "Cari chapter…": "Search chapters…",
  "Urutkan chapter": "Sort chapters",
  "Terbaru dulu": "Newest first",
  "Terlama dulu": "Oldest first",
  "Chapter gak ketemu": "Chapter not found",
  "Coba kata kunci lain.": "Try another keyword.",
  "Tampilkan lebih sedikit": "Show less",
  "Tampilkan semua ({count})": "Show all ({count})",
  "Info komik": "Comic info",
  Tipe: "Type",
  "Total chapter": "Total chapters",
  "Update terakhir": "Last update",
  Author: "Author",
  Status: "Status",
  "Terakhir dibaca": "Last read",
  "Lanjutin dari tempat lo berhenti.": "Pick up where you left off.",
  "Tips baca": "Reading tips",
  "Semua chapter yang lo buka otomatis tersimpan ke riwayat. Gak perlu takut kehilangan posisi baca.":
    "Every chapter you open is saved to your history automatically. Don't worry about losing your place.",
  "Mirip gini": "Similar picks",
  "Kalau suka yang ini, coba juga": "If you like this, try these too",
  "Rekomendasi dari sumber yang sama.": "Recommendations from the same source.",

  // Anime
  "Anime ongoing, tamat, sampai yang lagi hype.": "Ongoing, completed, and hyped anime.",
  "Cari judul, lihat episode, dan tonton langsung dari sumbernya. Semua dalam satu tempat.":
    "Search titles, browse episodes, and watch straight from the source. All in one place.",
  "Cari anime…": "Search anime…",
  Pencarian: "Search",
  Reset: "Reset",
  "Anime gak ketemu": "Anime not found",
  "Coba kata kunci lain, atau kembali ke daftar ongoing.":
    "Try another keyword, or go back to the ongoing list.",
  "Balik ke anime": "Back to anime",
  "Sedang tayang": "Now airing",
  "Update episode terbaru dari sumber yang tersedia.": "Latest episodes from available sources.",
  "Cari anime": "Search anime",
  "Gagal ambil data anime": "Failed to load anime data",
  "Belum ada anime ongoing": "No ongoing anime yet",
  "Sumbernya lagi kosong. Coba cek lagi nanti.": "The source is empty right now. Check again later.",
  "Binge watch": "Binge watch",
  "Yang sudah tamat": "Completed series",
  "Cocok buat maraton akhir pekan.": "Perfect for a weekend marathon.",
  "Anime di sini pakai sumber Otakudesu": "Anime here uses the Otakudesu source",
  "Streaming dan download link disediakan langsung oleh API.":
    "Streaming and download links are provided directly by the API.",

  // Anime detail
  "Data anime ini belum tersedia di sumber.": "This anime isn't available from the source yet.",
  "Tonton episode {episode}": "Watch episode {episode}",
  terbaru: "latest",
  "Daftar anime": "Anime list",
  "Daftar episode": "Episode list",
  "{count} episode tersedia": "{count} episodes available",
  "Belum ada episode": "No episodes yet",
  "Coba cek lagi nanti.": "Check again later.",
  Informasi: "Information",
  "Judul Jepang": "Japanese title",
  Studio: "Studio",
  Produser: "Producer",
  Tayang: "Aired",
  Catatan: "Note",
  "Video di-embed dari server sumber. Kalau player gak muncul, buka server alternatif di halaman episode.":
    "Videos are embedded from the source server. If the player doesn't show up, open an alternative server on the episode page.",
  "Episode {episode}": "Episode {episode}",

  // Anime episode
  "Episode gak bisa dibuka": "Episode can't be opened",
  "Episode ini belum tersedia.": "This episode isn't available yet.",
  "Detail anime": "Anime details",
  Nonton: "Watch",
  Episode: "Episode",
  "Embed player": "Embed player",
  "Player belum tersedia.": "Player isn't available yet.",
  Sebelumnya: "Previous",
  Selanjutnya: "Next",
  "Buka player di tab baru": "Open player in a new tab",
  "Pilih server": "Choose a server",
  "Kalau player utama gak jalan, coba server lain di bawah.":
    "If the main player isn't working, try another server below.",
  "Server streaming gak tersedia.": "No streaming servers available.",
  "Kalau iframe diblokir server sumber, pakai tombol “Buka player di tab baru”.":
    "If the source blocks the iframe, use the “Open player in a new tab” button.",
  Download: "Download",
  "Link download dari sumber. Ukuran bisa berubah.": "Download links from the source. Sizes may vary.",
  "Link download gak tersedia.": "No download links available.",
  "Server {name} aktif": "Server {name} is active",
  "Server gak bisa dibuka": "Server can't be opened",

  // Reader
  "Kembali ke detail komik": "Back to comic details",
  "{count} gambar": "{count} images",
  "Pilih chapter": "Choose a chapter",
  "Ganti tema": "Toggle theme",
  "Menyiapkan halaman…": "Preparing pages…",
  "Chapter gak bisa dibuka": "Chapter can't be opened",
  "Balik ke detail komik": "Back to comic details",
  "Chapter selesai": "Chapter finished",
  "Progres lo otomatis kesimpan. {percent}% halaman kebaca.":
    "Your progress is saved automatically. {percent}% of pages read.",
  "Lompat ke chapter": "Jump to chapter",
  "Gunakan ← → buat pindah chapter": "Use ← → to change chapters",
  "Gambar halaman {page} gagal dimuat.": "Page {page} failed to load.",
  "Halaman {page}": "Page {page}",

  // 404
  "Halaman ini hilang entah ke mana.": "This page has gone missing.",
  "Mungkin link-nya salah, atau chapter yang lo cari udah dipindahin. Balik dulu aja, masih banyak komik lain.":
    "Maybe the link is wrong, or the chapter you're looking for was moved. Head back — there are plenty of other comics.",

  // Auth
  "Selamat datang kembali": "Welcome back",
  "Masuk ke akun IamKomik buat sinkronin koleksi dan riwayat baca lo.":
    "Log in to your IamKomik account to sync your library and reading history.",
  "Buat akun baru": "Create an account",
  "Daftar gratis, koleksi lo langsung tersimpan di akun.":
    "Sign up for free and keep your library in your account.",
  Nama: "Name",
  Email: "Email",
  Password: "Password",
  "Konfirmasi password": "Confirm password",
  "Belum punya akun?": "Don't have an account?",
  "Sudah punya akun?": "Already have an account?",
  "Buat akun": "Create account",
  "Masuk sekarang": "Log in now",
  "Daftar sekarang": "Sign up now",
  "Mencoba masuk…": "Logging in…",
  "Membuat akun…": "Creating account…",
  "Nama minimal 2 karakter.": "Name must be at least 2 characters.",
  "Email wajib diisi.": "Email is required.",
  "Password wajib diisi.": "Password is required.",
  "Format email tidak valid.": "Invalid email format.",
  "Password minimal 8 karakter.": "Password must be at least 8 characters.",
  "Konfirmasi password belum cocok.": "Passwords don't match yet.",
  "Berhasil masuk. Selamat baca!": "Logged in. Happy reading!",
  "Akun berhasil dibuat. Selamat baca!": "Account created. Happy reading!",
  "Udah keluar dari akun.": "You've been logged out.",
  "Koleksi dan riwayat tersinkron ke akun.": "Library and history sync to your account.",
  "Bisa lanjut baca di perangkat lain.": "Continue reading on other devices.",
  "Data perangkat lama otomatis digabung.": "Your existing device data is merged automatically.",

  // Toasts / errors
  "Gagal menghapus": "Failed to remove",
  "Gagal menghapus riwayat": "Failed to remove history",
  "Gagal update koleksi": "Failed to update library",
  "Disimpan ke koleksi": "Saved to library",
  "Dihapus dari koleksi": "Removed from library",
  "Riwayat dihapus": "History removed",
  "Gagal menyalin ID": "Failed to copy ID",
  "Request timeout. Coba lagi ya.": "Request timed out. Try again.",
  "Gak bisa nyambung ke server. Cek backend lo masih jalan.":
    "Can't reach the server. Check that the backend is running.",
  "Ada yang error. Coba lagi sebentar.": "Something went wrong. Try again in a moment.",

  // Activity labels
  "Baca chapter": "Read chapter",
  "Lihat komik": "Viewed comic",
  "Simpan komik": "Saved comic",
  "Buka beranda": "Opened home",
  "Lihat anime": "Viewed anime",

  // Greetings / units
  "Selamat pagi": "Good morning",
  "Selamat siang": "Good afternoon",
  "Selamat sore": "Good evening",
  "Selamat malam": "Good night",
  menit: "minutes",
  jam: "hours",
  mnt: "min",
}

export function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "en" || stored === "id") return stored
  } catch {
    // ignore
  }
  return "id"
}

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match,
  )
}

export function translate(
  language: Language,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const template = language === "en" ? translations[key] ?? key : key
  return interpolate(template, vars)
}

interface I18nContextValue {
  language: Language
  locale: string
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = React.createContext<I18nContextValue | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>(() => getStoredLanguage())

  const setLanguage = React.useCallback((next: Language) => {
    setLanguageState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // localStorage may be blocked in private mode
    }
  }, [])

  const toggleLanguage = React.useCallback(() => {
    setLanguage(language === "id" ? "en" : "id")
  }, [language, setLanguage])

  React.useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const t = React.useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(language, key, vars),
    [language],
  )

  const value = React.useMemo<I18nContextValue>(
    () => ({
      language,
      locale: language === "en" ? "en-US" : "id-ID",
      setLanguage,
      toggleLanguage,
      t,
    }),
    [language, setLanguage, toggleLanguage, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = React.useContext(I18nContext)
  if (!context) throw new Error("useI18n harus dipakai di dalam I18nProvider")
  return context
}
