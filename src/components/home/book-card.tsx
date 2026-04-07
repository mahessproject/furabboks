import Image from "next/image";
import Link from "next/link";
import { BookOpen, ShoppingCart, Star } from "lucide-react";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  price: number;
  cover_url: string | null;
  stock: number;
  category?: string | null;
  badge?: string;
  badgeStyle?: string;
  detailHref?: string;
}

export default function BookCard({
  id,
  title,
  author,
  price,
  cover_url,
  stock,
  category,
  badge,
  badgeStyle,
  detailHref,
}: BookCardProps) {
  const href = detailHref ?? `/books/${id}`;

  // Fake rating to match design intent, default to 4.8 or 4.9
  const mockupRating = title.length % 3 === 0 ? "4.9" : "4.8";

  return (
    <Link
      href={href}
      className="group relative flex w-full flex-col overflow-hidden rounded-3xl border border-violet-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-violet-500/10 hover:border-violet-300"
    >
      {/* Cover Container */}
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl bg-violet-100">
        {cover_url ? (
          <Image
            src={cover_url}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-10 w-10 text-violet-300" />
          </div>
        )}

        {/* Badge (Top-Right like screenshot) */}
        {badge ? (
          <div
            className={`absolute right-3 top-3 z-10 flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-black tracking-wide shadow-md backdrop-blur-md ${badgeStyle ?? "bg-white/90 text-violet-900"}`}
          >
            {badge}
          </div>
        ) : (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-xs font-black text-violet-900 shadow-md backdrop-blur-sm">
            <Star className="h-3 w-3 fill-violet-400 text-violet-400" />
            {mockupRating}
          </div>
        )}

        {/* Out of stock overlay */}
        {stock === 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-violet-950/60 backdrop-blur-[2px]">
            <span className="rounded-full bg-violet-600 px-4 py-1.5 text-xs font-bold tracking-wide text-white shadow-lg">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Detail Content */}
      <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
        {category ? (
          <span className="mb-2 line-clamp-1 text-xs font-black uppercase tracking-widest text-violet-600">
            {category}
          </span>
        ) : (
          <span className="mb-2 text-xs font-black uppercase tracking-widest text-violet-600">UMUM</span>
        )}

        <div className="mt-1 flex-1">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-violet-900 transition-colors group-hover:text-violet-600">
            {title}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs font-medium text-violet-600">{author}</p>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <p className="text-lg font-black tracking-tight text-violet-900">{formatRupiah(price)}</p>

          {/* Cart Interaction Button mimicking new design */}
          <div className="group/cart relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-200 bg-white text-violet-700 transition-all duration-300 hover:border-violet-600 hover:bg-violet-600 hover:text-white">
            <ShoppingCart className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
