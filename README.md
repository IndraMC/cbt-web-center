# CBT Frontend

Frontend untuk sistem Computer Based Test (CBT) dengan style **Neobrutalism**.

## Tech Stack
- React 18 + Vite
- React Router v6
- Lucide React (icons)
- Pure CSS (no Tailwind)

## Setup

```bash
npm install
npm run dev
```

## Build & Deploy ke Vercel

```bash
npm run build
```

Atau deploy langsung dari GitHub ke Vercel (auto-detect Vite).

## Routes

| Path | Keterangan |
|------|-----------|
| `/login` | Login siswa (publik) |
| `/register` | Daftar siswa |
| `/dashboard` | Dashboard siswa |
| `/tasks` | Daftar ujian |
| `/history` | Riwayat ujian |
| `/exam/:id` | Halaman ujian |
| `/admin/login` | Login admin (**tersembunyi**) |
| `/admin/dashboard` | Dashboard admin |
| `/admin/assignments` | Kelola ujian |
| `/admin/students` | Data siswa |
| `/admin/classes` | Kelola kelas |

## Catatan
- URL admin login tidak ada di halaman manapun, harus diakses manual: `/admin/login`
- API Base URL: `https://cbt-tes.vercel.app`
