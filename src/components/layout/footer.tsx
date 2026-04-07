import { BookOpen } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-violet-50 text-violet-800  ">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Column 1: Brand and Social */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-700">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Furabbooks</span>
            </Link>
            <p className="mt-4 text-sm text-violet-600 ">
              Wadah literasi untuk semua orang. Temukan buku impianmu dan mulai petualangan barumu hari ini.
            </p>
            <div className="mt-6 flex space-x-4">
              <Link href="#" className="text-violet-500 hover:text-violet-700  ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </Link>
              <Link href="#" className="text-violet-500 hover:text-violet-700  ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </Link>
              <Link href="#" className="text-violet-500 hover:text-violet-700  ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Column 2: Tautan Cepat */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-violet-900 ">Tautan Cepat</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/" className="text-violet-600 hover:text-violet-700  ">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-violet-600 hover:text-violet-700  ">
                  Koleksi Buku
                </Link>
              </li>
              <li>
                <Link href="/#best-sellers" className="text-violet-600 hover:text-violet-700  ">
                  Terlaris
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-violet-600 hover:text-violet-700  ">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/#promo" className="text-violet-600 hover:text-violet-700  ">
                  Promo
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Kategori */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-violet-900 ">Kategori</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/catalog?category=fiksi" className="text-violet-600 hover:text-violet-700  ">
                  Fiksi
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=non-fiksi" className="text-violet-600 hover:text-violet-700  ">
                  Non-Fiksi
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=pengembangan-diri" className="text-violet-600 hover:text-violet-700  ">
                  Pengembangan Diri
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=anak-anak" className="text-violet-600 hover:text-violet-700  ">
                  Anak-anak
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=sains-teknologi" className="text-violet-600 hover:text-violet-700  ">
                  Sains & Teknologi
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Hubungi Kami */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-violet-900 ">Hubungi Kami</h3>
            <ul className="mt-4 space-y-3 text-sm text-violet-600 ">
              <li>
                <span className="font-semibold text-violet-800 ">Alamat:</span> Jl. Literasi No. 45, Jakarta Selatan.
              </li>
              <li>
                <span className="font-semibold text-violet-800 ">Email:</span> halo@furabbooks.com
              </li>
              <li>
                <span className="font-semibold text-violet-800 ">WA:</span> +62 812 3456 7890
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-violet-200 pt-8 ">
          <div className="flex flex-col items-center justify-between text-sm text-violet-500  sm:flex-row">
            <p>© 2024 Furabbooks. All Rights Reserved.</p>
            <div className="mt-4 flex space-x-6 sm:mt-0">
              <Link href="/privacy" className="hover:text-violet-700 ">
                Kebijakan Privasi
              </Link>
              <Link href="/terms" className="hover:text-violet-700 ">
                Syarat & Ketentuan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
