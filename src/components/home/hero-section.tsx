"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const IMAGES = [
  "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop",
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white px-6 py-20 sm:px-12 md:px-20 lg:px-32">
      {/* Background decorative blobs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-130 w-130 rounded-full bg-violet-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-90 w-90 rounded-full bg-violet-50 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-50 w-50 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-50/80 blur-2xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid min-h-[calc(100vh-5rem)] grid-cols-1 items-center gap-12 md:grid-cols-2 lg:gap-20">
          {/* Left: Text Block */}
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-block text-xs font-black uppercase tracking-[0.2em] text-violet-600">
              Koleksi Terpilih
            </span>

            <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-violet-900 sm:text-6xl lg:text-7xl">
              Membaca <br />
              <span className="italic text-violet-700">Jiwa.</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-violet-600">
              Temukan buku-buku yang tidak hanya mengisi rak, tetapi juga memperkaya pemikiran dan menenangkan hati.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center rounded-full bg-violet-700 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-violet-800 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-200"
              >
                Jelajahi Koleksi
              </Link>
              <Link
                href="?auth=register"
                className="inline-flex items-center justify-center rounded-full border border-violet-300 px-8 py-3.5 text-sm font-semibold text-violet-700 transition-all hover:border-violet-400 hover:text-violet-700 hover:-translate-y-0.5"
              >
                Daftar Gratis
              </Link>
            </div>

            {/* Mini stats */}
            <div className="mt-14 flex items-center gap-8">
              <div>
                <p className="text-2xl font-bold text-violet-900">50k+</p>
                <p className="mt-0.5 text-xs font-medium text-violet-400">Koleksi Buku</p>
              </div>
              <div className="h-10 w-px bg-violet-200" />
              <div>
                <p className="text-2xl font-bold text-violet-900">100k+</p>
                <p className="mt-0.5 text-xs font-medium text-violet-400">Pembaca Puas</p>
              </div>
              <div className="h-10 w-px bg-violet-200" />
              <div>
                <p className="text-2xl font-bold text-violet-900">4.9★</p>
                <p className="mt-0.5 text-xs font-medium text-violet-400">Rating</p>
              </div>
            </div>
          </div>

          {/* Right: Rotating Image */}
          <div className="flex justify-center md:justify-end">
            <div className="relative h-105 w-75 sm:h-130 sm:w-95">
              {IMAGES.map((src, index) => (
                <div
                  key={src}
                  className={cn(
                    "absolute inset-0 overflow-hidden rounded-3xl shadow-2xl shadow-violet-200/60 transition-opacity duration-1000",
                    index === currentIndex ? "opacity-100" : "opacity-0",
                  )}
                >
                  <img src={src} alt="Koleksi buku" className="h-full w-full object-cover" />
                  {/* Subtle violet overlay */}
                  <div className="absolute inset-0 bg-transparent" />
                </div>
              ))}

              {/* Floating info card */}
              <div className="absolute -left-8 -bottom-6 rounded-2xl bg-white px-5 py-4 shadow-xl ring-1 ring-violet-100/80">
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-600">Pilihan Bulan Ini</p>
                <p className="mt-1 text-sm font-bold text-violet-800">500+ Judul Baru Tersedia</p>
              </div>

              {/* Dot slide indicators */}
              <div className="absolute -bottom-10 left-1/2 flex -translate-x-1/2 gap-2">
                {IMAGES.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      index === currentIndex ? "w-6 bg-violet-600" : "w-1.5 bg-violet-300",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
