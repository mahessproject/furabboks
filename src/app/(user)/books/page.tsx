import Image from "next/image";
import Link from "next/link";
import { BookOpen, ShoppingCart, Star, XCircle, Eye, Sparkles, Brain, TrendingUp, PenTool, Heart } from "lucide-react";
import { getBooksPublic } from "@/lib/actions/books";
import { getCategoriesPublic } from "@/lib/actions/categories";
import { createClient } from "@/lib/supabase/server";
import SearchHero from "./_components/search-hero";
import DashboardHighlights from "./_components/dashboard-highlights";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const { search, category } = await searchParams;
  const [allBooks, categories] = await Promise.all([getBooksPublic(), getCategoriesPublic()]);
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  let activeOrder = null;

  if (user) {
    const [{ data: userProfile }, { data: orders }] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user.id).single(),
      supabase.from("orders")
        .select("*, order_items(books(title, cover_url))")
        .eq("user_id", user.id)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false })
        .limit(1)
    ]);
    profile = userProfile;
    activeOrder = orders?.[0];
  }

  // Filter by category
  let books = category
    ? allBooks.filter((b) => b.category_id === category)
    : allBooks;

  // Filter by search query
  if (search) {
    const q = search.toLowerCase();
    books = books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q),
    );
  }

  const activeCategoryName = category
    ? categories.find((c) => c.id === category)?.name ?? "Kategori"
    : null;

  const isDashboardView = !search && !category;

  const predefinedIcons = [Brain, TrendingUp, PenTool, Heart, Sparkles, BookOpen];

  return (
    <div className="space-y-4">
      {isDashboardView && <SearchHero userName={profile?.full_name?.split(" ")[0] || "User"} />}
      {isDashboardView && <DashboardHighlights activeOrder={activeOrder} />}

      {/* Genre Selector Horizontal - Only visible entirely in Dashboard view */}
      {isDashboardView && (
        <section className="py-6 px-4 sm:px-0">
          <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-violet-950">Kategori Pilihanmu</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <Link href="/books" className="flex items-center gap-3 px-6 py-4 bg-white border border-violet-100 rounded-[20px] shadow-sm hover:border-violet-400 transition min-w-max">
                <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <p className="text-sm font-bold text-violet-950">Semua</p>
                    <p className="text-[10px] text-violet-400">{allBooks.length}+ Judul</p>
                </div>
            </Link>
            {categories.map((cat, idx) => {
              const Icon = predefinedIcons[idx % predefinedIcons.length];
              const count = allBooks.filter(b => b.category_id === cat.id).length;
              return (
                <Link key={cat.id} href={`/books?category=${cat.id}`} className="flex items-center gap-3 px-6 py-4 bg-white border border-violet-100 rounded-[20px] shadow-sm hover:border-violet-400 transition min-w-max group">
                    <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center group-hover:bg-violet-100 transition">
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-violet-950">{cat.name}</p>
                        <p className="text-[10px] text-violet-400">{count}+ Judul</p>
                    </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Catalog Listing */}
      <section className="py-6 px-4 sm:px-0">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-violet-950">
            {isDashboardView ? (
              <><Sparkles className="text-amber-500 w-6 h-6" /> Rekomendasi Untukmu</>
            ) : (
              "Katalog Buku"
            )}
          </h2>

          {/* Active Filters */}
          {(search || category) && (
            <div className="flex flex-wrap items-center gap-2">
              {search && (
                <Link
                  href={category ? `/books?category=${category}` : "/books"}
                  className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-200 transition-colors"
                >
                  Cari: &quot;{search}&quot;
                  <XCircle className="h-4 w-4" />
                </Link>
              )}
              {activeCategoryName && (
                <Link
                  href={search ? `/books?search=${encodeURIComponent(search)}` : "/books"}
                  className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-200 transition-colors"
                >
                  Kategori: {activeCategoryName}
                  <XCircle className="h-4 w-4" />
                </Link>
              )}
              <Link
                href="/books"
                className="text-xs font-bold text-rose-500 hover:text-rose-700 px-2 py-1 transition"
              >
                Hapus semua
              </Link>
            </div>
          )}
        </div>

        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-violet-200 bg-violet-50/50 py-24 shadow-inner">
            <BookOpen className="h-16 w-16 text-violet-200 mb-4" />
            <h3 className="text-xl font-bold text-violet-950">
              {search || category ? "Tidak ada judul yang sesuai." : "Katalog sedang kosong."}
            </h3>
            <p className="mt-2 text-sm font-medium text-violet-500 max-w-sm text-center">
              {search || category
                ? "Coba ubah kata kunci pencarian atau pilih kategori yang berbeda."
                : "Belum ada buku yang ditambahkan ke sistem."}
            </p>
            {(search || category) && (
              <Link
                href="/books"
                className="mt-6 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-violet-700 shadow-md transition hover:-translate-y-0.5"
              >
                Lihat Semua Koleksi
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {books.map((book) => {
              const mockupRating = book.title.length % 3 === 0 ? "4.9" : "4.8";

              return (
                <div key={book.id} className="group relative flex flex-col">
                  {/* Book Card referencing lumina */}
                  <div className="aspect-[3/4] rounded-2xl bg-violet-50 mb-3 overflow-hidden relative shadow-sm hover:shadow-md transition-all duration-500 border border-violet-100 group-hover:border-violet-300">
                    {book.cover_url ? (
                      <Image
                        src={book.cover_url}
                        alt={book.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-300 to-violet-500 flex items-center justify-center text-white p-4 text-center">
                          <span className="font-bold text-sm drop-shadow-md italic">{book.title}</span>
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-violet-950/70 backdrop-blur-sm opacity-0 transform translate-y-4 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center items-center gap-3">
                        <Link href={`/books/${book.id}`} className="bg-white text-violet-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-violet-50 transition hover:scale-105 shadow-lg">
                            <Eye className="w-4 h-4" /> Detail
                        </Link>
                        <Link href={`/cart`} className="bg-violet-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-violet-500 transition hover:scale-105 shadow-lg">
                            <ShoppingCart className="w-4 h-4" /> Keranjang
                        </Link>
                    </div>

                    {/* Out of stock overlay */}
                    {book.stock === 0 && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-violet-950/60 backdrop-blur-[2px]">
                        <span className="rounded-full bg-rose-500 px-3 py-1 text-[10px] font-bold tracking-widest text-white shadow-md uppercase">
                          Habis
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Link href={`/books/${book.id}`} className="font-bold text-violet-950 line-clamp-1 hover:text-violet-600 transition">{book.title}</Link>
                  <p className="text-[11px] text-violet-500 mt-0.5 font-medium uppercase tracking-wider">{book.author}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-black tracking-tight text-violet-900">
                      {formatRupiah(Number(book.price))}
                    </p>
                    <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded text-amber-600">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span className="text-[10px] font-bold">{mockupRating}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}
