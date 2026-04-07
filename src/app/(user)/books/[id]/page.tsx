import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Star, User } from "lucide-react";
import { getBook } from "@/lib/actions/books";
import { getBookReviews, getBookAverageRating } from "@/lib/actions/reviews";
import AddToCartButton from "./_components/add-to-cart-button";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [book, reviews, ratingInfo] = await Promise.all([
    getBook(id),
    getBookReviews(id),
    getBookAverageRating(id),
  ]);

  if (!book) notFound();

  return (
    <div className="space-y-8">
      <Link
        href="/books"
        className="inline-flex items-center gap-1.5 text-sm text-violet-600 transition-colors hover:text-violet-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke katalog
      </Link>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[240px_1fr]">
        {/* Cover */}
        <div className="relative aspect-2/3 w-full max-w-60 overflow-hidden rounded-xl border border-violet-200 bg-violet-50">
          {book.cover_url ? (
            <Image src={book.cover_url} alt={book.title} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-12 w-12 text-violet-300" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          {book.categories && (
            <span className="inline-block rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
              {book.categories.name}
            </span>
          )}

          <h1 className="text-2xl font-bold leading-snug text-violet-900">{book.title}</h1>

          <p className="text-sm text-violet-600">
            oleh <span className="font-medium text-violet-800">{book.author}</span>
          </p>

          {/* Rating summary */}
          {ratingInfo.count > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(ratingInfo.average)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-violet-100 text-violet-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-violet-900">{ratingInfo.average}</span>
              <span className="text-sm text-violet-500">({ratingInfo.count} review)</span>
            </div>
          )}

          {book.description && (
            <p className="text-sm leading-relaxed text-violet-700">{book.description}</p>
          )}

          <div className="border-t border-violet-200 pt-4">
            <p className="text-2xl font-bold text-violet-900">{formatRupiah(book.price)}</p>
            <p className="mt-1 text-sm text-violet-600">
              {book.stock > 0 ? (
                <span className="text-green-600">Stok tersedia ({book.stock})</span>
              ) : (
                <span className="text-red-500 font-bold">Stok habis</span>
              )}
            </p>
          </div>

          <AddToCartButton bookId={book.id} disabled={book.stock === 0} />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="space-y-4">
        <div className="border-t border-violet-200 pt-6">
          <h2 className="text-lg font-bold text-violet-900">
            Review Pembeli
            {ratingInfo.count > 0 && (
              <span className="ml-2 text-sm font-normal text-violet-500">({ratingInfo.count})</span>
            )}
          </h2>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-xl border border-violet-200 bg-white py-10 text-center">
            <Star className="mx-auto h-8 w-8 text-violet-200" />
            <p className="mt-2 text-sm text-violet-500">Belum ada review untuk buku ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => {
              const profileData = review.profiles;
              const reviewerName = Array.isArray(profileData)
                ? (profileData[0]?.full_name ?? "User")
                : ((profileData as { full_name: string } | null)?.full_name ?? "User");

              return (
                <div
                  key={review.id}
                  className="rounded-xl border border-violet-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
                        <User className="h-4 w-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-violet-900">{reviewerName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-violet-100 text-violet-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-violet-400 shrink-0">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-sm text-violet-700 leading-relaxed">{review.comment}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
