"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  BookOpen,
  CheckCircle,
  Loader2,
  Package,
  Star,
} from "lucide-react";
import { confirmOrder } from "@/lib/actions/orders";
import { createReview } from "@/lib/actions/reviews";

const STATUS_LABELS: Record<string, { label: string; style: string }> = {
  pending: { label: "Menunggu Konfirmasi", style: "bg-yellow-50 text-yellow-700" },
  confirmed: { label: "Dikonfirmasi", style: "bg-blue-50 text-blue-700" },
  shipped: { label: "Dikirim", style: "bg-violet-50 text-violet-700" },
  delivered: { label: "Selesai", style: "bg-green-50 text-green-700" },
  cancelled: { label: "Dibatalkan", style: "bg-red-50 text-red-700" },
};

interface OrderItem {
  id: string;
  book_id: string;
  quantity: number;
  price_at_order: number;
  books?: { id?: string; title?: string; cover_url?: string | null } | null;
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address: string;
  payment_method: string;
  created_at: string;
  order_items?: OrderItem[];
}

interface Props {
  orders: Order[];
  reviewedMap: Record<string, boolean>; // key = `${bookId}_${orderId}`
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function OrdersUserClient({ orders, reviewedMap }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Rating modal state
  const [ratingModal, setRatingModal] = useState<{
    bookId: string;
    orderId: string;
    bookTitle: string;
  } | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [localReviewed, setLocalReviewed] = useState<Record<string, boolean>>({});

  function handleConfirm(orderId: string) {
    setConfirmingId(orderId);
    setError(null);
    startTransition(async () => {
      const result = await confirmOrder(orderId);
      if ("error" in result && result.error) {
        setError(result.error);
      } else {
        setSuccessMsg("Pesanan berhasil dikonfirmasi! Sekarang kamu bisa memberikan review.");
      }
      setConfirmingId(null);
      router.refresh();
    });
  }

  function openReview(bookId: string, orderId: string, bookTitle: string) {
    setRatingModal({ bookId, orderId, bookTitle });
    setRating(5);
    setHoverRating(0);
    setComment("");
    setReviewError(null);
    setReviewSuccess(null);
  }

  function handleSubmitReview() {
    if (!ratingModal) return;
    setReviewError(null);
    startTransition(async () => {
      const result = await createReview(
        ratingModal.bookId,
        ratingModal.orderId,
        rating,
        comment,
      );
      if ("error" in result && result.error) {
        setReviewError(result.error);
      } else {
        setReviewSuccess("Review berhasil dikirim!");
        setLocalReviewed((prev) => ({
          ...prev,
          [`${ratingModal.bookId}_${ratingModal.orderId}`]: true,
        }));
        setTimeout(() => {
          setRatingModal(null);
          setReviewSuccess(null);
          router.refresh();
        }, 1500);
      }
    });
  }

  function isReviewed(bookId: string, orderId: string) {
    const key = `${bookId}_${orderId}`;
    return localReviewed[key] || reviewedMap[key] || false;
  }

  return (
    <>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
          <p className="text-sm font-medium text-green-800">{successMsg}</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-violet-200 bg-white py-24">
          <Package className="h-12 w-12 text-violet-300" />
          <p className="mt-4 text-sm font-medium text-violet-600">Belum ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_LABELS[order.status] ?? {
              label: order.status,
              style: "bg-violet-100 text-violet-600",
            };

            return (
              <div key={order.id} className="rounded-xl border border-violet-200 bg-white">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-violet-100 px-5 py-3">
                  <div>
                    <p className="text-xs text-violet-600">
                      #{order.id.slice(0, 8).toUpperCase()} &middot;{" "}
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-violet-900">
                      {formatRupiah(order.total_amount)}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.style}`}>
                    {status.label}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2 px-5 py-3">
                  {order.order_items?.map((item) => {
                    const bookId = item.book_id || item.books?.id || "";
                    const reviewed = isReviewed(bookId, order.id);

                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative h-10 w-7 shrink-0 overflow-hidden rounded bg-violet-100">
                          {item.books?.cover_url ? (
                            <Image
                              src={item.books.cover_url}
                              alt={item.books.title ?? ""}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <BookOpen className="h-3 w-3 text-violet-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="line-clamp-1 text-sm text-violet-900">{item.books?.title}</p>
                          <p className="text-xs text-violet-600">
                            {item.quantity} &times; {formatRupiah(item.price_at_order)}
                          </p>
                        </div>

                        {/* Review button for delivered orders */}
                        {order.status === "delivered" && bookId && (
                          reviewed ? (
                            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Sudah direview
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                openReview(bookId, order.id, item.books?.title ?? "Buku")
                              }
                              className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 hover:bg-violet-200 transition-colors"
                            >
                              <Star className="inline h-3 w-3 mr-1" />
                              Beri Review
                            </button>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="border-t border-violet-100 px-5 py-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-violet-600 flex-1">
                    <span className="font-medium text-violet-800">Alamat:</span> {order.shipping_address}
                  </p>

                  {/* Confirm button for shipped orders */}
                  {order.status === "shipped" && (
                    <button
                      onClick={() => handleConfirm(order.id)}
                      disabled={isPending && confirmingId === order.id}
                      className="flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isPending && confirmingId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5" />
                      )}
                      Pesanan Diterima
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-violet-950/40">
          <div className="w-full max-w-md rounded-xl border border-violet-200 bg-white p-6 shadow-xl mx-4">
            <h3 className="text-lg font-semibold text-violet-900">Review Buku</h3>
            <p className="mt-1 text-sm text-violet-600">
              {ratingModal.bookTitle}
            </p>

            {reviewSuccess ? (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />
                {reviewSuccess}
              </div>
            ) : (
              <>
                {reviewError && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {reviewError}
                  </div>
                )}

                {/* Star Rating */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-violet-700 mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="transition-colors"
                      >
                        <Star
                          className={`h-7 w-7 ${
                            star <= (hoverRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-violet-100 text-violet-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm font-medium text-violet-700 self-center">
                      {rating}/5
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-violet-700 mb-2">
                    Komentar <span className="text-violet-400">(opsional)</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-violet-900 placeholder:text-violet-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    placeholder="Tulis pendapatmu tentang buku ini..."
                  />
                </div>

                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={() => setRatingModal(null)}
                    className="rounded-lg border border-violet-200 px-4 py-2 text-sm text-violet-700 hover:bg-violet-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors disabled:opacity-50"
                  >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Kirim Review
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
