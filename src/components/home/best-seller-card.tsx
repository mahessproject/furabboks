import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

interface BestSellerCardProps {
  id: string;
  title: string;
  cover_url: string | null;
  quote: string;
}

const MOCK_QUOTES: Record<string, string> = {
  "The Psychology of Money": "“Buku ini telah mengubah cara pandang ribuan pembaca Furabbooks bulan ini!”",
  "Sapiens: A Brief History of Humankind": "“Wawasan yang luar biasa tentang sejarah manusia.”",
  "Cantik Itu Luka": "“Karya sastra Indonesia yang mendunia.”",
  "Atomic Habits": "“Panduan praktis untuk membangun kebiasaan baik.”",
};

export default function BestSellerCard({ id, title, cover_url }: BestSellerCardProps) {
  const quote = MOCK_QUOTES[title] ?? "Salah satu buku paling diminati di Furabbooks.";

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-full max-w-70">
        <Link
          href={`/catalog/${id}`}
          className="group block w-full overflow-hidden rounded-3xl shadow-2xl shadow-violet-950/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-violet-500/30"
        >
          <div className="relative aspect-3/4 w-full">
            <Image src={cover_url || "/placeholder.jpg"} alt={title} fill className="object-cover" unoptimized />
          </div>
        </Link>
        <div className="absolute -top-3 left-4 z-10 rounded-full bg-violet-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
          Best Seller
        </div>
      </div>

      <div className="mt-6 flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-violet-400 text-violet-400" />
        ))}
      </div>

      <h3 className="mt-4 text-2xl font-bold text-white">{title}</h3>

      <p className="mt-2 max-w-xs text-sm italic text-violet-400">{quote}</p>

      <Link
        href={`/catalog/${id}`}
        className="mt-6 rounded-full bg-violet-500 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-violet-400"
      >
        Beli Sekarang
      </Link>
    </div>
  );
}
