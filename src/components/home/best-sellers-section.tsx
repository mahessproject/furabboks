import { getBooksBestSellers } from "@/lib/actions/books";
import BestSellerCard from "./best-seller-card";

export default async function BestSellersSection() {
  let books;
  try {
    books = await getBooksBestSellers(3);
  } catch {
    return null;
  }

  if (books.length === 0) return null;

  return (
    <section className="bg-violet-950 px-4 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">Paling Banyak Dicari</h2>
          <p className="mt-4 max-w-2xl mx-auto text-base text-violet-400">
            Buku-buku yang sedang hangat diperbincangkan dan menjadi favorit para pembaca setia kami.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <BestSellerCard key={book.id} id={book.id} title={book.title} cover_url={book.cover_url ?? null} quote="" />
          ))}
        </div>
      </div>
    </section>
  );
}
