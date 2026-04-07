import Link from "next/link";
import { BookOpen, Search, ShoppingCart, Truck } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import LatestBooksSection from "@/components/home/latest-books-section";
import BestSellersSection from "@/components/home/best-sellers-section";

const FEATURES = [
  {
    icon: Search,
    title: "Cari & Temukan",
    description: "Telusuri koleksi buku dari berbagai kategori dengan mudah.",
  },
  {
    icon: ShoppingCart,
    title: "Pesan dengan Mudah",
    description: "Tambahkan buku ke keranjang dan checkout dalam hitungan menit.",
  },
  {
    icon: Truck,
    title: "Bayar Saat Diterima",
    description: "Sistem COD — bayar saat buku sampai di tangan Anda.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <HeroSection />

      <LatestBooksSection />

      <BestSellersSection />

      <section className="bg-white px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-violet-900 sm:text-4xl">Kenapa Harus FURABBOOKS?</h2>
            <p className="mt-4 text-lg text-violet-500">
              Kami hadir untuk memberikan pengalaman berbelanja buku terbaik, dari mulai pencarian hingga buku sampai di
              tanganmu dengan aman.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="relative group overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-violet-100 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100"
              >
                <div className="absolute inset-0 bg-violet-100/20 opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="relative">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 ring-1 ring-violet-100/50 transition-transform group-hover:scale-110">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-violet-900">{title}</h3>
                  <p className="text-violet-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 lg:gap-20">
            <div className="relative order-last md:order-first">
              <div className="grid grid-cols-2 gap-4">
                <div className="overflow-hidden rounded-3xl shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=2071&auto=format&fit=crop"
                    alt="Library shelf"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-8 overflow-hidden rounded-3xl shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1887&auto=format&fit=crop"
                    alt="Curved library wall"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-700 shadow-2xl ring-8 ring-white">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="text-violet-900">
              <h2 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">Mengenal Furabbooks</h2>
              <p className="mt-6 text-base leading-relaxed text-violet-600">
                Furabbooks lahir dari kecintaan sederhana terhadap aroma kertas dan imajinasi yang tak terbatas. Nama
                Furabbooks diambil dari semangat kami untuk menjadi "wadah" (box) yang menyediakan literatur bagi siapa
                saja (for everyone).
              </p>
              <p className="mt-4 text-base leading-relaxed text-violet-600">
                Kami percaya bahwa setiap orang memiliki satu buku yang bisa mengubah hidup mereka, dan tugas kami
                adalah membantu Anda menemukannya. Sejak 2023, kami berkomitmen untuk mendukung ekosistem literasi di
                Indonesia dengan menyediakan akses mudah ke buku-buku berkualitas.
              </p>

              <div className="mt-10 flex gap-8">
                <div>
                  <p className="text-4xl font-bold text-violet-700">50k+</p>
                  <p className="mt-1 text-sm font-medium text-violet-600">Koleksi Buku</p>
                </div>
                <div className="h-16 w-px bg-violet-200"></div>
                <div>
                  <p className="text-4xl font-bold text-violet-700">100k+</p>
                  <p className="mt-1 text-sm font-medium text-violet-600">Pelanggan Puas</p>
                </div>
                <div className="h-16 w-px bg-violet-200"></div>
                <div>
                  <p className="text-4xl font-bold text-violet-700">2023</p>
                  <p className="mt-1 text-sm font-medium text-violet-600">Tahun Berdiri</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
