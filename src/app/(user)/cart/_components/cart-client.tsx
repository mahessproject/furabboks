"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Minus,
  Plus,
  BookOpen,
  ShoppingBag,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  RefreshCw,
  X,
} from "lucide-react";
import { removeFromCart, updateCartQuantity, clearCart } from "@/lib/actions/cart";

interface CartItemRow {
  id: string;
  quantity: number;
  books: {
    id: string;
    title: string;
    author: string;
    price: number;
    stock: number;
    cover_url: string | null;
  };
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function CartClient({ items }: { items: CartItemRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(items.map((i) => i.id)));

  const selectedItems = items.filter((i) => selectedIds.has(i.id));
  const selectedTotal = selectedItems.reduce((sum, item) => sum + item.books.price * item.quantity, 0);

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleRemove(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    startTransition(async () => {
      await removeFromCart(id);
      router.refresh();
    });
  }

  function handleClearCart() {
    startTransition(async () => {
      await clearCart();
      setSelectedIds(new Set());
      router.refresh();
    });
  }

  function handleQtyChange(id: string, qty: number) {
    startTransition(async () => {
      await updateCartQuantity(id, qty);
      router.refresh();
    });
  }

  function handleCheckout() {
    const ids = Array.from(selectedIds).join(",");
    router.push(`/checkout?items=${ids}`);
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[32px] border border-slate-100 bg-white py-24 shadow-sm">
        <ShoppingBag className="h-12 w-12 text-violet-300" />
        <p className="mt-4 text-base font-semibold text-slate-700">Keranjangmu masih kosong</p>
        <p className="mt-1 text-sm text-slate-400">Yuk cari buku favoritmu!</p>
        <Link
          href="/books"
          className="mt-6 rounded-2xl bg-violet-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition-all hover:-translate-y-0.5 hover:bg-violet-800"
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      {/* Items List (Left Side) */}
      <div className="flex-grow space-y-6">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-800">
            Keranjang Kamu{" "}
            <span className="ml-2 text-lg font-normal text-slate-400">({items.length} Item)</span>
          </h1>
          <button
            onClick={handleClearCart}
            disabled={isPending}
            className="flex items-center gap-1 text-sm font-bold text-red-500 transition-colors hover:underline disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            Kosongkan
          </button>
        </div>

        {/* Cart Items */}
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`flex cursor-pointer flex-col gap-6 rounded-[24px] border bg-white p-6 shadow-sm transition sm:flex-row sm:items-center ${
              selectedIds.has(item.id)
                ? "border-violet-200 hover:border-violet-300"
                : "border-slate-100 opacity-60 hover:border-violet-100"
            }`}
          >
            {/* Book Cover */}
            <div className="relative h-36 w-24 flex-shrink-0 self-center overflow-hidden rounded-xl bg-violet-50 shadow-md sm:self-auto">
              {item.books.cover_url ? (
                <Image
                  src={item.books.cover_url}
                  alt={item.books.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-violet-700">
                  <BookOpen className="h-8 w-8 text-white/80" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-grow space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-slate-800">{item.books.title}</h3>
              <p className="text-sm font-medium text-slate-400">{item.books.author}</p>
              <div className="flex items-center justify-center gap-4 pt-4 sm:justify-start">
                <div className="flex items-center rounded-lg border border-slate-100 bg-slate-50 p-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQtyChange(item.id, item.quantity - 1);
                    }}
                    disabled={isPending}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-white disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQtyChange(item.id, item.quantity + 1);
                    }}
                    disabled={isPending || item.quantity >= item.books.stock}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-white disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {item.books.stock > 0 ? (
                  <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">
                    Stok Tersedia
                  </span>
                ) : (
                  <span className="rounded bg-red-50 px-2 py-1 text-xs font-bold text-red-500">
                    Stok Habis
                  </span>
                )}
              </div>
            </div>

            {/* Price & Remove */}
            <div className="flex flex-col items-center justify-between py-2 sm:items-end">
              <p className="text-xl font-extrabold text-slate-800">
                {formatRupiah(item.books.price * item.quantity)}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item.id);
                }}
                disabled={isPending}
                className="mt-4 text-slate-300 transition hover:text-red-500 disabled:opacity-40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}

        {/* Back to Shop */}
        <Link
          href="/books"
          className="inline-flex items-center gap-2 text-sm font-bold text-violet-700 transition-all hover:gap-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali Belanja
        </Link>
      </div>

      {/* Summary (Right Side) */}
      <div className="w-full lg:w-[400px]">
        <div className="sticky top-28 rounded-[32px] border border-slate-100 bg-white p-8 shadow-xl shadow-violet-100/20">
          <h2 className="mb-6 text-xl font-bold text-slate-800">Ringkasan Pesanan</h2>

          {/* Price Details */}
          <div className="space-y-4 border-t border-slate-50 pt-6">
            <div className="flex justify-between text-sm font-medium text-slate-500">
              <span>Subtotal ({selectedItems.length} Item)</span>
              <span className="text-slate-800">{formatRupiah(selectedTotal)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-slate-500">
              <span>Biaya Pengiriman</span>
              <span className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-600">
                Gratis
              </span>
            </div>
            <div className="flex items-end justify-between border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Pembayaran
                </p>
                <p className="text-2xl font-black text-violet-700">{formatRupiah(selectedTotal)}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={selectedItems.length === 0}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-700 py-4 font-bold text-white shadow-lg shadow-violet-200 transition-all hover:-translate-y-0.5 hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            Checkout Sekarang
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <ShieldCheck className="h-3 w-3" />
              Aman
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Truck className="h-3 w-3" />
              Cepat
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <RefreshCw className="h-3 w-3" />
              Garansi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
