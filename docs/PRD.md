# FURABBOOKS — Product Requirements Document (PRD)

## 1. Ringkasan Proyek

| Item              | Detail                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| **Nama Aplikasi** | FURABBOOKS                                                                                          |
| **Jenis**         | Aplikasi Bookstore (Toko Buku Online)                                                               |
| **Tujuan**        | Tugas USK — membangun aplikasi toko buku dengan fitur manajemen admin dan pembelian user            |
| **Tech Stack**    | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Supabase (Auth + Database + Storage) |
| **Gaya**          | Sederhana, fokus pada fungsionalitas & pengalaman pengguna                                          |

---

## 2. Aktor & Peran

### 2.1 Admin

Seseorang yang melakukan kontrol dan memonitor keseluruhan data buku.

### 2.2 User

Seseorang yang ingin melakukan pembelian buku.

---

## 3. Daftar Fitur per Aktor

### 3.1 Admin Features

| ID  | Fitur                | Deskripsi                                                                    |
| --- | -------------------- | ---------------------------------------------------------------------------- |
| A1  | Kategori Buku — CRUD | Add, Update, Delete kategori buku                                            |
| A2  | Data Buku — CRUD     | Add, Update, Delete data buku (judul, penulis, harga, stok, cover, kategori) |
| A3  | List User            | Melihat daftar user yang sudah terdaftar                                     |
| A4  | List Pesanan         | Melihat list pesanan buku dari berbagai user                                 |
| A5  | Pesan Masuk          | Melihat & membalas pesan yang dikirim user (Contact)                         |

### 3.2 User Features

| ID  | Fitur               | Deskripsi                                                                                                    |
| --- | ------------------- | ------------------------------------------------------------------------------------------------------------ |
| U1  | Registrasi          | Pendaftaran akun baru (default role: `user`)                                                                 |
| U2  | Login               | Autentikasi → baca role dari `profiles` → redirect otomatis: **admin** ke `/dashboard`, **user** ke `/books` |
| U3  | About Us            | Halaman informasi tentang FURABBOOKS                                                                         |
| U4  | Contact Admin       | Mengirim pesan ke admin                                                                                      |
| U5  | Pencarian Buku      | Cari buku berdasarkan judul/kategori/penulis                                                                 |
| U6  | Add to Cart         | Memasukkan buku ke keranjang belanja                                                                         |
| U7  | Payment at Delivery | Konfirmasi pembayaran sebelum buku dikirim (COD-style)                                                       |
| U8  | Riwayat Pesanan     | Melihat status & riwayat pesanan                                                                             |

### 3.3 Shared / Public

| ID  | Fitur            | Deskripsi                                                 |
| --- | ---------------- | --------------------------------------------------------- |
| S1  | Landing Page     | Halaman utama menampilkan buku populer, kategori, dan CTA |
| S2  | Logout           | Keluar dari akun, redirect ke Landing Page                |
| S3  | Protected Routes | Middleware untuk membatasi akses berdasarkan role         |

### 3.4 Alur Login & Role-Based Redirect

Sistem menggunakan **satu halaman login** untuk semua aktor. Setelah login berhasil, aplikasi membaca kolom `role` dari tabel `profiles` dan melakukan redirect otomatis:

```
User Login
  │
  ▼
Supabase Auth (email + password)
  │
  ▼
Auth Callback (/api/auth/callback)
  │
  ▼
Query profiles.role WHERE id = auth.user.id
  │
  ├── role = 'admin'  ──→  Redirect ke /dashboard  (Admin Panel)
  │
  └── role = 'user'   ──→  Redirect ke /books      (Katalog Buku)
```

**Aturan proteksi route:**

| Kondisi                                                 | Aksi                               |
| ------------------------------------------------------- | ---------------------------------- |
| Belum login → akses `(user)/*` atau `(admin)/*`         | Redirect ke `/auth/login`          |
| Role `user` → akses `(admin)/*`                         | Redirect ke `/books`               |
| Role `admin` → akses `(user)/*`                         | Diizinkan (admin bisa akses semua) |
| Sudah login → akses `/auth/login` atau `/auth/register` | Redirect sesuai role               |

**Implementasi teknis:**

- `middleware.ts` di root `src/` — intercept semua request, cek session Supabase + role
- Auth callback route (`/api/auth/callback`) — handle Supabase auth code exchange + redirect berdasarkan role
- Setiap layout `(admin)` dan `(user)` melakukan server-side role check sebagai lapisan kedua

---

## 4. Supabase Database Schema

### 4.1 Tabel: `profiles`

Extends Supabase Auth dengan data tambahan user.

| Column       | Type        | Constraint                            |
| ------------ | ----------- | ------------------------------------- |
| `id`         | uuid        | PK, FK → auth.users.id                |
| `full_name`  | text        | NOT NULL                              |
| `phone`      | text        | nullable                              |
| `address`    | text        | nullable                              |
| `role`       | text        | DEFAULT 'user', CHECK('user','admin') |
| `created_at` | timestamptz | DEFAULT now()                         |

### 4.2 Tabel: `categories`

| Column        | Type        | Constraint                    |
| ------------- | ----------- | ----------------------------- |
| `id`          | uuid        | PK, DEFAULT gen_random_uuid() |
| `name`        | text        | NOT NULL, UNIQUE              |
| `description` | text        | nullable                      |
| `created_at`  | timestamptz | DEFAULT now()                 |

### 4.3 Tabel: `books`

| Column        | Type          | Constraint                            |
| ------------- | ------------- | ------------------------------------- |
| `id`          | uuid          | PK, DEFAULT gen_random_uuid()         |
| `title`       | text          | NOT NULL                              |
| `author`      | text          | NOT NULL                              |
| `description` | text          | nullable                              |
| `price`       | numeric(10,2) | NOT NULL, CHECK(>0)                   |
| `stock`       | integer       | NOT NULL, DEFAULT 0                   |
| `cover_url`   | text          | nullable (URL gambar bebas hak cipta) |
| `category_id` | uuid          | FK → categories.id                    |
| `created_at`  | timestamptz   | DEFAULT now()                         |
| `updated_at`  | timestamptz   | DEFAULT now()                         |

### 4.4 Tabel: `orders`

| Column             | Type          | Constraint                                                                        |
| ------------------ | ------------- | --------------------------------------------------------------------------------- |
| `id`               | uuid          | PK, DEFAULT gen_random_uuid()                                                     |
| `user_id`          | uuid          | FK → profiles.id                                                                  |
| `status`           | text          | DEFAULT 'pending', CHECK('pending','confirmed','shipped','delivered','cancelled') |
| `total_amount`     | numeric(10,2) | NOT NULL                                                                          |
| `shipping_address` | text          | NOT NULL                                                                          |
| `payment_method`   | text          | DEFAULT 'cod'                                                                     |
| `created_at`       | timestamptz   | DEFAULT now()                                                                     |
| `updated_at`       | timestamptz   | DEFAULT now()                                                                     |

### 4.5 Tabel: `order_items`

| Column           | Type          | Constraint                        |
| ---------------- | ------------- | --------------------------------- |
| `id`             | uuid          | PK, DEFAULT gen_random_uuid()     |
| `order_id`       | uuid          | FK → orders.id, ON DELETE CASCADE |
| `book_id`        | uuid          | FK → books.id                     |
| `quantity`       | integer       | NOT NULL, CHECK(>0)               |
| `price_at_order` | numeric(10,2) | NOT NULL                          |

### 4.6 Tabel: `cart_items`

| Column       | Type               | Constraint                              |
| ------------ | ------------------ | --------------------------------------- |
| `id`         | uuid               | PK, DEFAULT gen_random_uuid()           |
| `user_id`    | uuid               | FK → profiles.id                        |
| `book_id`    | uuid               | FK → books.id                           |
| `quantity`   | integer            | NOT NULL, DEFAULT 1, CHECK(>0)          |
| `created_at` | timestamptz        | DEFAULT now()                           |
| **UNIQUE**   | (user_id, book_id) | Satu buku per entry, quantity di-update |

### 4.7 Tabel: `messages`

| Column       | Type        | Constraint                    |
| ------------ | ----------- | ----------------------------- |
| `id`         | uuid        | PK, DEFAULT gen_random_uuid() |
| `sender_id`  | uuid        | FK → profiles.id              |
| `subject`    | text        | NOT NULL                      |
| `body`       | text        | NOT NULL                      |
| `is_read`    | boolean     | DEFAULT false                 |
| `created_at` | timestamptz | DEFAULT now()                 |

---

## 5. Struktur Folder Proyek

```
src/
├── app/
│   ├── layout.tsx                  ← Root Layout (font, metadata, providers)
│   ├── page.tsx                    ← Landing Page publik
│   ├── globals.css                 ← Tailwind + CSS variables
│   │
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx            ← Halaman Login
│   │   └── register/
│   │       └── page.tsx            ← Halaman Registrasi
│   │
│   ├── about/
│   │   └── page.tsx                ← Halaman About Us
│   │
│   ├── (user)/                     ← Route group — halaman user (protected)
│   │   ├── layout.tsx              ← User layout (navbar, sidebar)
│   │   ├── books/
│   │   │   ├── page.tsx            ← Katalog & Pencarian Buku
│   │   │   └── [id]/
│   │   │       └── page.tsx        ← Detail Buku
│   │   ├── cart/
│   │   │   └── page.tsx            ← Keranjang Belanja
│   │   ├── checkout/
│   │   │   └── page.tsx            ← Halaman Checkout (Payment at Delivery)
│   │   ├── orders/
│   │   │   └── page.tsx            ← Riwayat Pesanan User
│   │   └── contact/
│   │       └── page.tsx            ← Contact Admin (kirim pesan)
│   │
│   ├── (admin)/                    ← Route group — halaman admin (protected)
│   │   ├── layout.tsx              ← Admin layout (sidebar, header)
│   │   ├── dashboard/
│   │   │   └── page.tsx            ← Admin Dashboard (overview)
│   │   ├── categories/
│   │   │   └── page.tsx            ← CRUD Kategori Buku
│   │   ├── books/
│   │   │   └── page.tsx            ← CRUD Data Buku
│   │   ├── users/
│   │   │   └── page.tsx            ← List User Terdaftar
│   │   ├── orders/
│   │   │   └── page.tsx            ← List Pesanan dari User
│   │   └── messages/
│   │       └── page.tsx            ← Pesan Masuk dari User
│   │
│   └── api/                        ← Route Handlers (REST-like)
│       ├── auth/
│       │   └── callback/
│       │       └── route.ts        ← Supabase Auth callback
│       └── ...                     ← API endpoints jika diperlukan
│
├── components/                     ← Reusable UI components
│   ├── ui/                         ← Primitif (Button, Input, Modal, dll.)
│   ├── layout/                     ← Navbar, Sidebar, Footer
│   └── books/                      ← BookCard, BookList, BookForm
│
├── lib/                            ← Server-side utilities & services
│   ├── supabase/
│   │   ├── client.ts               ← Supabase browser client
│   │   ├── server.ts               ← Supabase server client
│   │   └── middleware.ts            ← Supabase auth middleware helper
│   └── utils.ts                    ← Helper functions umum
│
├── hooks/                          ← Custom React hooks
│   └── use-auth.ts                 ← Hook untuk auth state
│
└── types/                          ← TypeScript type definitions
    ├── database.ts                 ← Supabase generated types
    └── index.ts                    ← Shared app types
```

---

## 6. Rencana Fase Pengembangan

### Phase 1 — Foundation & Auth

> Setup project, Supabase integration, Authentication (Register, Login, Logout), Protected routes, Role-based redirect middleware.

**Deliverables:**

- Supabase client/server setup (`lib/supabase/`)
- Tabel `profiles` + trigger auto-create on signup (default role: `user`)
- Halaman Register & Login (single login page untuk semua role)
- Auth callback route — exchange code + query role + redirect otomatis (`admin` → `/dashboard`, `user` → `/books`)
- `middleware.ts` — proteksi route berdasarkan session + role (lihat aturan di Section 3.4)
- Layout `(admin)` dan `(user)` dengan server-side role verification
- Root layout dengan conditional navbar sesuai role

### Phase 2 — Admin: Kategori & Buku Management

> CRUD Kategori Buku, CRUD Data Buku, Admin layout & dashboard.

**Deliverables:**

- Admin layout (sidebar navigation)
- Admin Dashboard (statistik sederhana)
- CRUD Kategori (tabel `categories`)
- CRUD Buku (tabel `books`) — form dengan upload cover URL
- Validasi input & error handling

### Phase 3 — User: Katalog, Pencarian & Detail Buku

> Halaman katalog buku, pencarian, filter by kategori, halaman detail buku.

**Deliverables:**

- Halaman katalog buku dengan grid cards
- Search bar + filter by kategori
- Halaman detail buku (`/books/[id]`)
- Gambar buku dari sumber bebas hak cipta (Unsplash/Pexels placeholder)

### Phase 4 — User: Cart & Checkout

> Add to cart, keranjang belanja, checkout dengan Payment at Delivery.

**Deliverables:**

- Tabel `cart_items` — logic add/update/remove
- Halaman Cart dengan quantity adjustment
- Halaman Checkout — form alamat pengiriman
- Pembuatan Order (tabel `orders` + `order_items`)
- Pengurangan stok buku setelah order

### Phase 5 — User: Pesanan & Contact Admin

> Riwayat pesanan, contact admin, halaman About Us.

**Deliverables:**

- Halaman riwayat pesanan user
- Halaman Contact Admin (form kirim pesan)
- Halaman About Us (statis)
- Tabel `messages`

### Phase 6 — Admin: User List, Pesanan & Pesan

> Admin views untuk monitoring user, pesanan, dan pesan masuk.

**Deliverables:**

- List User terdaftar (tabel `profiles`)
- List Pesanan dari semua user + update status pesanan
- Inbox pesan dari user (tabel `messages`)

### Phase 7 — Polish & Final Check

> Responsive design, error boundaries, loading states, final lint & build check.

**Deliverables:**

- Loading skeletons di setiap halaman
- Error boundaries
- Responsive design check
- `eslint` clean
- `next build` sukses tanpa error

---

## 7. Tech Decisions

| Keputusan                                   | Alasan                                                   |
| ------------------------------------------- | -------------------------------------------------------- |
| **Supabase Auth**                           | Built-in auth dengan Row Level Security, mudah integrasi |
| **Server Components (default)**             | Performa optimal, data fetching di server                |
| **Client Components** hanya jika interaktif | Forms, search bar, cart state                            |
| **Tailwind CSS 4**                          | Sudah tersetup di project existing                       |
| **Route Groups `(user)` & `(admin)`**       | Pemisahan layout tanpa mempengaruhi URL                  |
| **Gambar bebas hak cipta**                  | Unsplash/Pexels/Picsum untuk placeholder buku            |
| **COD (Payment at Delivery)**               | Sesuai requirement — tidak perlu payment gateway         |

---

## 8. Supabase Row Level Security (RLS) Overview

| Tabel         | SELECT                  | INSERT         | UPDATE          | DELETE     |
| ------------- | ----------------------- | -------------- | --------------- | ---------- |
| `profiles`    | Own profile / Admin all | Auto (trigger) | Own profile     | —          |
| `categories`  | Public                  | Admin only     | Admin only      | Admin only |
| `books`       | Public                  | Admin only     | Admin only      | Admin only |
| `cart_items`  | Own items               | Authenticated  | Own items       | Own items  |
| `orders`      | Own orders / Admin all  | Authenticated  | Admin only      | —          |
| `order_items` | Via order access        | Authenticated  | —               | —          |
| `messages`    | Admin all / Own sent    | Authenticated  | Admin (is_read) | —          |

---

## 9. Non-Functional Requirements

- **Performa**: Gunakan Server Components untuk data fetching, minimize client-side JS
- **Keamanan**: RLS di Supabase, validasi input di client & server, middleware proteksi route
- **Aksesibilitas**: Semantic HTML, label pada form
- **Responsive**: Mobile-first, minimal breakpoints (sm, md, lg)
- **Kode**: Readable, well-commented (deskripsi fungsi), mengikuti best practices TypeScript/Next.js

---

## 10. Gambar / Aset

Semua gambar menggunakan sumber bebas hak cipta:

- **Book covers**: Placeholder dari `https://picsum.photos` atau gambar dari Unsplash (dengan lisensi free)
- **Icons**: Menggunakan inline SVG atau library seperti `lucide-react`
- **Logo**: Teks-based "FURABBOOKS" (tidak perlu file gambar)

---

_Dokumen ini akan di-update seiring perkembangan proyek._
