-- =====================
-- 1. DUMMY ADMIN
-- =====================
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@furabbooks.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin FURABBOOKS"}',
  now(),
  now(),
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'admin@furabbooks.com',
  'email',
  jsonb_build_object(
    'sub', 'a0000000-0000-0000-0000-000000000001',
    'email', 'admin@furabbooks.com',
    'email_verified', true,
    'phone_verified', false
  ),
  now(),
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- Profile admin (trigger)
INSERT INTO public.profiles (id, full_name, phone, address, role)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Admin FURABBOOKS',
  '08123456789',
  'Kantor FURABBOOKS, Jakarta',
  'admin'
) ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Admin FURABBOOKS';


-- =====================
-- 2. DUMMY USER
-- =====================
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  'b0000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'user@furabbooks.com',
  crypt('user123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Budi Santoso"}',
  now(),
  now(),
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000002',
  'user@furabbooks.com',
  'email',
  jsonb_build_object(
    'sub', 'b0000000-0000-0000-0000-000000000002',
    'email', 'user@furabbooks.com',
    'email_verified', true,
    'phone_verified', false
  ),
  now(),
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- Profile user
INSERT INTO public.profiles (id, full_name, phone, address, role)
VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'Budi Santoso',
  '08198765432',
  'Jl. Merdeka No. 10, Bandung',
  'user'
) ON CONFLICT (id) DO UPDATE SET role = 'user', full_name = 'Budi Santoso';


-- =====================
-- 3. SAMPLE CATEGORIES
-- =====================
INSERT INTO public.categories (id, name, description) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Fiksi', 'Novel, cerpen, dan karya fiksi lainnya'),
  ('c0000000-0000-0000-0000-000000000002', 'Non-Fiksi', 'Buku pengetahuan, biografi, dan referensi'),
  ('c0000000-0000-0000-0000-000000000003', 'Teknologi', 'Pemrograman, AI, dan ilmu komputer'),
  ('c0000000-0000-0000-0000-000000000004', 'Bisnis', 'Manajemen, keuangan, dan kewirausahaan'),
  ('c0000000-0000-0000-0000-000000000005', 'Pendidikan', 'Buku pelajaran dan akademik')
ON CONFLICT DO NOTHING;


-- =====================
-- 4. SAMPLE BOOKS
-- =====================
INSERT INTO public.books (id, title, author, description, price, stock, cover_url, category_id) VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'Laskar Pelangi',
    'Andrea Hirata',
    'Kisah inspiratif tentang perjuangan anak-anak Belitung dalam mengejar pendidikan.',
    85000,
    25,
    'https://picsum.photos/seed/book1/400/600',
    'c0000000-0000-0000-0000-000000000001'
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'Bumi Manusia',
    'Pramoedya Ananta Toer',
    'Novel sejarah tentang perjuangan seorang pribumi di era kolonial Belanda.',
    95000,
    15,
    'https://picsum.photos/seed/book2/400/600',
    'c0000000-0000-0000-0000-000000000001'
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    'Sapiens: A Brief History of Humankind',
    'Yuval Noah Harari',
    'Perjalanan sejarah umat manusia dari zaman purba hingga modern.',
    120000,
    20,
    'https://picsum.photos/seed/book3/400/600',
    'c0000000-0000-0000-0000-000000000002'
  ),
  (
    'd0000000-0000-0000-0000-000000000004',
    'Clean Code',
    'Robert C. Martin',
    'Panduan menulis kode yang bersih, mudah dibaca, dan mudah dipelihara.',
    150000,
    10,
    'https://picsum.photos/seed/book4/400/600',
    'c0000000-0000-0000-0000-000000000003'
  ),
  (
    'd0000000-0000-0000-0000-000000000005',
    'The Lean Startup',
    'Eric Ries',
    'Metodologi membangun startup yang efisien dan berkelanjutan.',
    110000,
    18,
    'https://picsum.photos/seed/book5/400/600',
    'c0000000-0000-0000-0000-000000000004'
  ),
  (
    'd0000000-0000-0000-0000-000000000006',
    'Filosofi Teras',
    'Henry Manampiring',
    'Pengantar filsafat Stoa untuk kehidupan sehari-hari yang lebih tenang.',
    75000,
    30,
    'https://picsum.photos/seed/book6/400/600',
    'c0000000-0000-0000-0000-000000000002'
  )
ON CONFLICT DO NOTHING;
