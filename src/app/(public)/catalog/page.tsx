import Image from "next/image";
import Link from "next/link";
import { BookOpen, Search, ShoppingCart, Star, ChevronDown } from "lucide-react";
import { getBooksPublic } from "@/lib/actions/books";
import { getCategoriesPublic } from "@/lib/actions/categories";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const [allBooks, categories] = await Promise.all([getBooksPublic(), getCategoriesPublic()]);

  let books = allBooks ?? [];

  if (category) {
    books = books.filter((b) => b.category_id === category);
  }

  if (q) {
    const lower = q.toLowerCase();
    books = books.filter((b) => b.title.toLowerCase().includes(lower) || b.author.toLowerCase().includes(lower));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-1.5">
        <h1 className="text-3xl font-black tracking-tight text-violet-900 sm:text-4xl">Katalog Buku</h1>
        <p className="text-sm font-medium text-violet-600">
          Jelajahi koleksi kami. Login untuk melihat detail &amp; membeli.
        </p>
      </div>

      {/* Advanced Search Bar (Mobile First & Desktop Optimized) */}
      <form
        method="GET"
        action="/catalog"
        className="relative z-20 mb-10 flex w-full max-w-3xl flex-col sm:flex-row items-center rounded-2xl sm:rounded-full bg-white p-1.5 shadow-sm border border-violet-200 focus-within:border-violet-500 transition-colors"
      >
        {/* Input */}
        <div className="flex w-full flex-1 items-center px-4 py-3 sm:py-1.5">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Cari judul atau penulis..."
            className="w-full bg-transparent pl-2 text-[14px] font-medium text-violet-900 placeholder-violet-500 outline-none"
          />
        </div>

        <div className="hidden h-5 w-px bg-violet-200 sm:block" />

        {/* Dropdown Kategori */}
        <div className="relative w-full border-t border-violet-100 px-4 py-3 sm:w-auto sm:min-w-45 sm:border-0 sm:py-1.5">
          <div className="flex items-center justify-between sm:justify-start">
            <select
              name="category"
              defaultValue={category ?? ""}
              className="w-full appearance-none bg-transparent px-2 py-1 pr-8 text-[14px] font-semibold text-violet-700 outline-none cursor-pointer"
            >
              <option value="">Semua Kategori</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 h-4 w-4 text-violet-600 sm:right-3" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full items-center gap-2 p-2 pt-0 sm:w-auto sm:p-0 sm:pr-1">
          {q && (
            <Link
              href="/catalog"
              className="flex flex-1 sm:flex-none items-center justify-center rounded-xl sm:rounded-full px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-100 transition-colors"
            >
              Reset
            </Link>
          )}
          <button
            type="submit"
            className="flex flex-1 sm:flex-none items-center justify-center rounded-xl sm:rounded-full bg-violet-700 text-white transition-all hover:bg-violet-800 p-3 sm:p-0 sm:h-10 sm:w-10 shadow-md"
            title="Cari Buku"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="ml-2 font-bold sm:hidden">Cari</span>
          </button>
        </div>
      </form>

      {/* Results count */}
      <p className="mb-6 text-sm font-bold text-violet-600">
        <span className="text-violet-900">{books.length}</span> buku ditemukan
      </p>

      {/* Grid */}
      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-violet-300 bg-violet-50 py-24">
          <BookOpen className="mb-4 h-12 w-12 text-violet-300" />
          <h3 className="text-lg font-bold text-violet-900">Buku tidak ditemukan</h3>
          <p className="mt-1 text-sm text-violet-600">Coba ubah kata kunci atau kategori pencarian.</p>
          <Link
            href="/catalog"
            className="mt-6 rounded-full bg-violet-600 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-violet-700 shadow-md"
          >
            Kembali ke Semua Buku
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
          {books.map((book) => {
            const mockupRating = book.title.length % 3 === 0 ? "4.9" : "4.8";

            return (
              <Link
                key={book.id}
                href={`/catalog/${book.id}`}
                className="group relative flex w-full flex-col overflow-hidden rounded-3xl border border-violet-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-violet-500/10 hover:border-violet-300"
              >
                {/* Cover Container */}
                <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl bg-violet-50">
                  {book.cover_url ? (
                    <Image
                      src={book.cover_url}
                      alt={book.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-10 w-10 text-violet-300" />
                    </div>
                  )}

                  {/* Rating Badge */}
                  <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-xs font-black text-violet-900 shadow-md backdrop-blur-sm">
                    <Star className="h-3 w-3 fill-violet-400 text-violet-400" />
                    {mockupRating}
                  </div>

                  {/* Out of stock overlay */}
                  {book.stock === 0 && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-violet-950/60 backdrop-blur-[2px]">
                      <span className="rounded-full bg-violet-600 px-4 py-1.5 text-xs font-bold tracking-wide text-white shadow-lg">
                        Stok Habis
                      </span>
                    </div>
                  )}
                </div>

                {/* Detail Content */}
                <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
                  {(book.categories as unknown as { name: string } | null)?.name ? (
                    <span className="mb-2 line-clamp-1 text-xs font-black uppercase tracking-widest text-violet-600">
                      {(book.categories as unknown as { name: string }).name}
                    </span>
                  ) : (
                    <span className="mb-2 text-xs font-black uppercase tracking-widest text-violet-600">UMUM</span>
                  )}

                  <div className="flex-1 mt-1">
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug text-violet-900 transition-colors group-hover:text-violet-600">
                      {book.title}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs font-medium text-violet-600">{book.author}</p>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <p className="text-lg font-black tracking-tight text-violet-900">
                      {formatRupiah(Number(book.price))}
                    </p>

                    {/* Cart Interaction Button mimicking new design */}
                    <div className="group/cart relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-200 bg-white text-violet-700 transition-all duration-300 hover:border-violet-600 hover:bg-violet-600 hover:text-white">
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
