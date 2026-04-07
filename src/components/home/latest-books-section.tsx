import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getBooksLatest } from "@/lib/actions/books";
import BookCard from "./book-card";

export default async function LatestBooksSection() {
  let books;
  try {
    books = await getBooksLatest(4);
  } catch {
    return null;
  }

  if (books.length === 0) return null;

  return (
    <section className="bg-white px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              <span className="text-sm font-bold uppercase tracking-widest text-violet-600">Baru Masuk</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-violet-900 sm:text-4xl">Katalog Buku Terbaru</h2>
            <p className="mt-2 text-violet-600">Koleksi buku terbaru yang baru saja hadir di FURABBOOKS.</p>
          </div>
          <Link
            href="/catalog"
            className="hidden shrink-0 text-sm font-bold text-violet-600 hover:text-violet-800 hover:underline sm:block"
          >
            Lihat Semua →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              author={book.author}
              price={Number(book.price)}
              cover_url={book.cover_url ?? null}
              stock={book.stock}
              category={(book.categories as unknown as { name: string } | null)?.name}
              detailHref={`/catalog/${book.id}`}
            />
          ))}
        </div>

        <div className="mt-12 flex justify-center sm:hidden">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 rounded-full border-2 border-violet-600 px-6 py-2.5 text-sm font-bold text-violet-600 transition-colors hover:bg-violet-600 hover:text-white"
          >
            Lihat Semua Buku
          </Link>
        </div>
      </div>
    </section>
  );
}
