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
  "Mode tamu · tersimpan di perangkat": "Guest mode · saved on this device",
  "Mode tamu": "Guest mode",
  "Salin ID perangkat": "Copy device ID",
  "ID perangkat disalin": "Device ID copied",
  "Dapat digunakan untuk mencadangkan data koleksi Anda.": "Use it to back up your library data.",
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
  "Pembaruan terbaru": "Latest updates",
  "Anime sedang tayang": "Ongoing anime",
  "Dokumentasi API": "API docs",
  "Repo sumber API": "API source repo",
  "Ruang baca komik dan anime dengan tampilan yang nyaman. Simpan favorit, lanjutkan bacaan, dan pantau kebiasaan membaca Anda dalam satu tempat.":
    "A comic & anime reading space with a clean, easy-on-the-eyes layout. Save favorites, continue reading, and track your reading habits in one place.",
  "Dibuat untuk tugas dan portofolio": "Built for a school project & portfolio",
  Jelajahi: "Explore",
  "Sumber & info": "Sources & info",
  "Data komik dan anime dari Sanka API.": "Comic & anime data from Sanka API.",

  // Search dialog
  "Telusuri judul komik dari berbagai sumber.": "Browse comic titles from multiple sources.",
  "Cari judul komik…": "Search comic titles…",
  Cari: "Search",
  "Coba pencarian": "Try searching",
  "Hasil tidak ditemukan": "No results found",
  "Coba kata kunci lain atau buka halaman jelajah.": "Try another keyword or open the explore page.",
  "Lihat semua hasil": "View all results",
  "Lihat detail": "View details",

  // Offline / PWA
  "Mode offline: halaman yang sudah dibuka tetap dapat dibaca; data baru akan dimuat saat kembali online.":
    "Offline mode: pages you have opened are still readable; new data will load when you are back online.",
  "Pasang IamKomik": "Install IamKomik",
  "Buka lebih cepat, layar penuh, dan tetap dapat melanjutkan bacaan saat koneksi terputus.":
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
  "Katalog komik, diperbarui setiap hari": "Comic catalog, updated daily",
  "Baca komik favorit,": "Read your favorite comics,",
  "dengan nyaman.": "comfortably.",
  "Ribuan judul dari berbagai sumber dalam satu tampilan yang rapi. Simpan judul favorit dan lanjutkan bacaan kapan saja.":
    "Thousands of titles from multiple sources, gathered into one clean view. Save what you love and continue reading anytime.",
  "Ingin membaca apa hari ini?": "What do you want to read today?",
  Populer: "Popular",
  "Coba lagi": "Try again",
  "Sedang populer": "Trending now",
  "Yang banyak dibaca minggu ini": "Most read this week",
  "Pilihan dari daftar trending, biasanya yang paling sering diperbarui.":
    "Picks from the trending list, usually the ones that update most often.",
  "Lihat semua": "View all",
  Genre: "Genre",
  "Semua genre": "All genres",
  "Baru diperbarui": "Just updated",
  "Chapter baru, jangan sampai terlewat": "New chapters, don't miss them",
  "Diurutkan dari yang paling baru diperbarui oleh sumber.":
    "Sorted by the most recent update from the source.",
  "Jelajah semua": "Explore all",
  "Ringkasan membaca": "Reading summary",
  "Sudah berapa chapter yang Anda baca minggu ini?": "How many chapters have you read this week?",
  "Semua aktivitas membaca Anda tercatat otomatis. Periksa statistik, rentetan, dan genre favorit Anda di dashboard.":
    "All your reading activity is tracked automatically. Check your stats, streak, and favorite genres on the dashboard.",
  "Buka statistik": "Open dashboard",
  "Pembaruan hari ini": "Updated today",
  "Chapter baru": "New chapters",
  Lanjutkan: "Continue",
  "Masih penasaran dengan ceritanya?": "Still curious about the story?",
  "Semua riwayat": "All history",
  "Lanjutkan membaca": "Continue reading",
  "Pilihan editor": "Editor's pick",
  "{chapter} baru saja rilis. ": "{chapter} just dropped. ",
  "Buka detailnya untuk melihat sinopsis, daftar chapter, dan rekomendasi serupa.":
    "Open the details to see the synopsis, chapter list, and similar recommendations.",
  "Simpan untuk nanti": "Save for later",
  "Slide sebelumnya": "Previous slide",
  "Slide berikutnya": "Next slide",

  // Explore
  "Temukan bacaan baru.": "Find something new to read.",
  "Cari berdasarkan judul atau pilih genre. Semua hasil diambil langsung dari sumber, sehingga pembaruannya cepat.":
    "Search by title or pick a genre. All results come straight from the source, so updates are fast.",
  "Memuat…": "Loading…",
  "{count} judul": "{count} titles",
  Acak: "Shuffle",
  "Cari judul komik, manga, manhwa…": "Search comic, manga, manhwa titles…",
  "Hapus pencarian": "Clear search",
  "Hasil untuk “{query}”": "Results for “{query}”",
  "Genre {genre}": "{genre} genre",
  "Trending hari ini": "Trending today",
  "Atur ulang filter": "Reset filters",
  "Paling banyak dibuka pembaca IamKomik.": "Most opened by IamKomik readers.",
  "Filter aktif": "Active filter",
  "Gagal mengambil data": "Failed to load data",
  "Muat ulang": "Reload",
  "Tidak ada hasil": "No results",
  "Coba kata kunci yang lebih pendek, atau pilih genre lain di atas.":
    "Try a shorter keyword or pick another genre above.",
  "Kembali ke trending": "Back to trending",
  "Ingin melihat yang baru diperbarui?": "Want to see what's updating?",
  "Halaman beranda menampilkan chapter terbaru dari semua sumber.":
    "The home page shows the latest chapters from every source.",
  "Kembali ke beranda": "Back to home",

  // Library
  "Koleksi pribadi": "Personal library",
  "Bacaan Anda, rapi di sini.": "Your reading, all tidy here.",
  "Semua komik yang Anda simpan dan riwayat baca tersimpan otomatis di akun Anda.":
    "Every comic you save and your reading history are stored automatically in your account.",
  "{count} favorit": "{count} favorites",
  "{count} riwayat": "{count} history",
  "Salin ID": "Copy ID",
  Favorit: "Favorites",
  "Riwayat baca": "Reading history",
  "Cari komik lagi": "Find more comics",
  "Belum ada komik yang disimpan": "No saved comics yet",
  "Tekan tombol Simpan pada kartu komik mana pun, maka komik akan muncul di sini.":
    "Tap Save on any comic card and it will show up here.",
  "Mulai jelajah": "Start exploring",
  "Belum ada riwayat baca": "No reading history yet",
  "Buka chapter pertama dari komik favorit Anda; riwayatnya akan muncul di sini secara otomatis.":
    "Open the first chapter of a favorite comic and its history will appear here automatically.",
  Lanjut: "Continue",
  "Dibaca {time}": "Read {time}",
  "Hapus riwayat": "Remove history",
  "Data Anda aman di perangkat ini": "Your data is safe on this device",
  "Simpan ID perangkat untuk memindahkan koleksi ke browser lain.":
    "Save your device ID to move your library to another browser.",
  "Lihat statistik": "View stats",

  // Dashboard
  "Ini ringkasan kebiasaan membaca Anda. Semua dihitung dari aktivitas nyata di perangkat ini, bukan data karangan.":
    "Here is a summary of your reading habits. Everything is calculated from real activity on this device, not made-up data.",
  "Statistik belum dapat dimuat": "Stats couldn't be loaded",
  "Belum ada jejak bacaan": "No reading activity yet",
  "Buka satu chapter komik terlebih dahulu; statistik, streak, dan genre favorit Anda akan muncul di sini secara otomatis.":
    "Open a comic chapter first, and your stats, streak, and favorite genres will appear here automatically.",
  "Chapter dibaca": "Chapters read",
  "{count} chapter minggu ini": "{count} chapters this week",
  "Komik dijelajahi": "Comics explored",
  "judul punya riwayat baca": "titles with reading history",
  "Komik favorit": "Favorite comics",
  "disimpan di koleksi": "saved in your library",
  "Rentetan membaca": "Reading streak",
  "hari beruntun": "days in a row",
  hari: "days",
  "Aktivitas 14 hari": "14-day activity",
  "Chapter yang dibaca dibandingkan komik yang dibuka.": "Chapters read vs comics opened.",
  Dibaca: "Read",
  Dilihat: "Viewed",
  "Rata-rata {value} chapter/hari": "Average {value} chapters/day",
  "Estimasi waktu membaca {time}": "Estimated {time} of reading",
  "Tipe komik": "Comic types",
  "Dari favorit dan riwayat baca.": "From favorites + reading history.",
  "{count} komik": "{count} comics",
  "Tipe komik belum terdeteksi.": "No comic types detected yet.",
  "Genre teratas": "Top genres",
  "Genre yang paling sering Anda buka.": "Genres you open the most.",
  "Genre belum tersedia.": "No genres available yet.",
  "Paling sering dibaca": "Most read",
  "5 judul teratas.": "Top 5 titles.",
  "Belum ada chapter yang dibaca.": "No chapters read yet.",
  "Target mingguan": "Weekly goal",
  "{done}/{goal} chapter": "{done}/{goal} chapters",
  "Target tercapai. Konsistensi Anda luar biasa.": "Goal reached. Your consistency is excellent.",
  "Kurang {count} chapter lagi untuk mencapai target.": "{count} more chapters to reach your goal.",
  "Aktivitas terakhir": "Recent activity",
  "10 kejadian terbaru.": "Latest 10 events.",
  "Koleksi Anda tersimpan otomatis": "Your library is saved automatically",
  "Riwayat baca dan komik favorit tetap rapi di satu tempat.":
    "Reading history and favorite comics stay organized in one place.",
  "Buka koleksi": "Open library",

  // Comic detail
  "Komik tidak ditemukan": "Comic not found",
  "Data komik ini belum tersedia di sumber. Silakan coba judul lain.":
    "This comic isn't available from the source yet. Try another title.",
  "Kembali ke jelajah": "Back to explore",
  "{count} chapter tersedia": "{count} chapters available",
  "{count} chapter": "{count} chapters",
  "Update {date}": "Updated {date}",
  "Jelajah komik": "Explore comics",
  "Belum ada sinopsis untuk komik ini.": "No synopsis for this comic yet.",
  "Belum ada sinopsis untuk anime ini.": "No synopsis for this anime yet.",
  Sembunyikan: "Show less",
  "Baca selengkapnya": "Read more",
  "Lanjutkan {chapter}": "Continue {chapter}",
  "Mulai membaca": "Start reading",
  "Daftar chapter": "Chapter list",
  "{count} chapter · Klik untuk mulai membaca": "{count} chapters · Click to start reading",
  "Cari chapter…": "Search chapters…",
  "Urutkan chapter": "Sort chapters",
  "Terbaru dulu": "Newest first",
  "Terlama dulu": "Oldest first",
  "Chapter tidak ditemukan": "Chapter not found",
  "Coba kata kunci lain.": "Try another keyword.",
  "Tampilkan lebih sedikit": "Show less",
  "Tampilkan semua ({count})": "Show all ({count})",
  "Info komik": "Comic info",
  Tipe: "Type",
  "Total chapter": "Total chapters",
  "Pembaruan terakhir": "Last update",
  Penulis: "Author",
  Status: "Status",
  "Terakhir dibaca": "Last read",
  "Lanjutkan dari bagian terakhir yang Anda baca.": "Pick up where you left off.",
  "Tips membaca": "Reading tips",
  "Semua chapter yang Anda buka tersimpan otomatis ke riwayat. Posisi baca tidak akan hilang.":
    "Every chapter you open is saved to your history automatically. Don't worry about losing your place.",
  "Rekomendasi serupa": "Similar picks",
  "Jika menyukai judul ini, coba juga": "If you like this, try these too",
  "Rekomendasi dari sumber yang sama.": "Recommendations from the same source.",

  // Anime
  "Anime sedang tayang, tamat, hingga yang sedang populer.": "Ongoing, completed, and popular anime.",
  "Cari judul, lihat episode, dan tonton langsung dari sumbernya. Semua dalam satu tempat.":
    "Search titles, browse episodes, and watch straight from the source. All in one place.",
  "Cari anime…": "Search anime…",
  Pencarian: "Search",
  "Atur ulang": "Reset",
  "Anime tidak ditemukan": "Anime not found",
  "Coba kata kunci lain, atau kembali ke daftar anime yang sedang tayang.":
    "Try another keyword, or go back to the ongoing anime list.",
  "Kembali ke anime": "Back to anime",
  "Sedang tayang": "Now airing",
  "Episode terbaru dari sumber yang tersedia.": "Latest episodes from available sources.",
  "Cari anime": "Search anime",
  "Gagal mengambil data anime": "Failed to load anime data",
  "Belum ada anime yang sedang tayang": "No ongoing anime yet",
  "Sumber sedang kosong. Silakan periksa kembali nanti.": "The source is empty right now. Check again later.",
  "Maraton": "Maraton",
  "Yang sudah tamat": "Completed series",
  "Cocok untuk maraton akhir pekan.": "Perfect for a weekend marathon.",
  "Anime di sini menggunakan sumber Otakudesu.": "Anime here uses the Otakudesu source",
  "Tautan streaming dan unduhan disediakan langsung oleh API.":
    "Streaming and download links are provided directly by the API.",

  // Anime detail
  "Data anime ini belum tersedia di sumber.": "This anime isn't available from the source yet.",
  "Tonton episode {episode}": "Watch episode {episode}",
  terbaru: "latest",
  "Daftar anime": "Anime list",
  "Daftar episode": "Episode list",
  "Tentang anime": "About the anime",
  "Durasi": "Duration",
  "Skor": "Score",
  "{count} episode": "{count} episodes",
  "{count} episode tersedia": "{count} episodes available",
  "Belum ada episode": "No episodes yet",
  "Silakan periksa kembali nanti.": "Check again later.",
  Informasi: "Information",
  "Judul Jepang": "Japanese title",
  Studio: "Studio",
  Produser: "Producer",
  Tayang: "Aired",
  Catatan: "Note",
  "Video disematkan dari server sumber. Jika pemutar tidak muncul, buka server alternatif di halaman episode.":
    "Videos are embedded from the source server. If the player doesn't show up, open an alternative server on the episode page.",
  "Episode {episode}": "Episode {episode}",

  // Anime episode
  "Episode tidak dapat dibuka": "Episode can't be opened",
  "Episode ini belum tersedia.": "This episode isn't available yet.",
  "Detail anime": "Anime details",
  Tonton: "Watch",
  Episode: "Episode",
  "Pemutar tersemat": "Embedded player",
  "Pemutar belum tersedia.": "Player isn't available yet.",
  Sebelumnya: "Previous",
  Selanjutnya: "Next",
  "Buka pemutar di tab baru": "Open player in a new tab",
  "Pilih server": "Choose a server",
  "Jika pemutar utama tidak berjalan, coba server lain di bawah.":
    "If the main player isn't working, try another server below.",
  "Server streaming tidak tersedia.": "No streaming servers available.",
  "Jika iframe diblokir oleh server sumber, gunakan tombol “Buka pemutar di tab baru”.":
    "If the source blocks the iframe, use the “Open player in a new tab” button.",
  Unduhan: "Download",
  "Tautan unduhan dari sumber. Ukuran dapat berubah.": "Download links from the source. Sizes may vary.",
  "Tautan unduhan tidak tersedia.": "No download links available.",
  "Server {name} aktif": "Server {name} is active",
  "Server tidak dapat dibuka": "Server can't be opened",

  // Reader
  "Kembali ke detail komik": "Back to comic details",
  "{count} gambar": "{count} images",
  "Pilih chapter": "Choose a chapter",
  "Ganti tema": "Toggle theme",
  "Menyiapkan halaman…": "Preparing pages…",
  "Chapter tidak dapat dibuka": "Chapter can't be opened",
  "Chapter selesai": "Chapter finished",
  "Progres Anda tersimpan otomatis. {percent}% halaman telah dibaca.":
    "Your progress is saved automatically. {percent}% of pages read.",
  "Pindah ke chapter": "Jump to chapter",
  "Gunakan tombol ← → untuk berpindah chapter": "Use ← → to change chapters",
  "Gambar halaman {page} gagal dimuat.": "Page {page} failed to load.",
  "Halaman {page}": "Page {page}",

  // 404
  "Halaman ini tidak ditemukan.": "This page has gone missing.",
  "Tautan mungkin salah, atau chapter yang Anda cari telah dipindahkan. Kembali ke beranda; masih banyak komik lain.":
    "The link may be wrong, or the chapter you are looking for has been moved. Go back home; there are plenty of other comics.",

  // Auth
  "Selamat datang kembali": "Welcome back",
  "Masuk ke akun IamKomik untuk menyinkronkan koleksi dan riwayat baca Anda.":
    "Log in to your IamKomik account to sync your library and reading history.",
  "Buat akun baru": "Create an account",
  "Daftar gratis; koleksi Anda langsung tersimpan di akun.":
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
  "Sedang masuk…": "Logging in…",
  "Membuat akun…": "Creating account…",
  "Nama minimal 2 karakter.": "Name must be at least 2 characters.",
  "Email wajib diisi.": "Email is required.",
  "Password wajib diisi.": "Password is required.",
  "Format email tidak valid.": "Invalid email format.",
  "Password minimal 8 karakter.": "Password must be at least 8 characters.",
  "Konfirmasi password tidak cocok.": "Passwords do not match.",
  "Berhasil masuk. Selamat membaca!": "Logged in. Happy reading!",
  "Akun berhasil dibuat. Selamat membaca!": "Account created. Happy reading!",
  "Anda telah keluar dari akun.": "You've been logged out.",
  "Koleksi dan riwayat tersinkronisasi ke akun.": "Library and history sync to your account.",
  "Dapat melanjutkan bacaan di perangkat lain.": "Continue reading on other devices.",
  "Data perangkat lama digabungkan secara otomatis.": "Your existing device data is merged automatically.",
  "Profil": "Profile",
  "Profil Anda": "Your profile",
  "Atur nama dan foto profil yang tampil di akun IamKomik.":
    "Manage the name and profile photo shown on your IamKomik account.",
  "Pilih foto": "Choose photo",
  "Hapus foto": "Remove photo",
  "JPG, PNG, atau WebP. Foto akan diperkecil menjadi 256 px.":
    "JPG, PNG, or WebP. The photo will be resized to 256 px.",
  "Simpan profil": "Save profile",
  "Menyimpan…": "Saving…",
  "Profil diperbarui": "Profile updated",
  "Email digunakan untuk masuk dan tidak dapat diubah dari halaman ini.":
    "Email is used to sign in and cannot be changed from this page.",
  "Avatar profil": "Profile avatar",
  "Memuat akun…": "Loading account…",
  "Silakan masuk untuk menyimpan komik.": "Please sign in to save comics.",
  "Belum masuk": "Not signed in",
  "Pembaca": "Reader",
  "Koleksi tersimpan di akun Anda": "Your library is stored in your account",
  "Masuk dari perangkat lain untuk membuka koleksi dan riwayat yang sama.":
    "Sign in from another device to open the same library and history.",
  "atau": "or",

  // Site prompts
  "Masuk untuk menyimpan koleksi, melanjutkan bacaan, dan membuka statistik Anda.":
    "Sign in to save your library, continue reading, and open your stats.",
  "Tutup ajakan masuk": "Close sign-in prompt",
  "Kami memakai cookie": "We use cookies",
  "Cookie dan penyimpanan lokal menjaga sesi masuk, tema, dan preferensi Anda. Cookie penting tetap aktif.":
    "Cookies and local storage keep your session, theme, and preferences. Essential cookies stay active.",
  "Terima": "Accept",
  "Tolak": "Reject",
  "Tutup pemberitahuan cookie": "Close cookie notice",

  // Toasts / errors
  "Gagal menghapus": "Failed to remove",
  "Gagal menghapus riwayat": "Failed to remove history",
  "Gagal memperbarui koleksi": "Failed to update library",
  "Disimpan ke koleksi": "Saved to library",
  "Dihapus dari koleksi": "Removed from library",
  "Riwayat dihapus": "History removed",
  "Gagal menyalin ID": "Failed to copy ID",
  "Waktu permintaan habis. Silakan coba lagi.": "Request timed out. Please try again.",
  "Tidak dapat terhubung ke server. Periksa apakah backend masih berjalan.":
    "Cannot reach the server. Check that the backend is running.",
  "Terjadi kesalahan. Silakan coba lagi.": "Something went wrong. Please try again.",

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
