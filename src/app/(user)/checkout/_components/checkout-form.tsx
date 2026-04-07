"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Package } from "lucide-react";
import { createOrder } from "@/lib/actions/orders";

interface CartItemSummary {
  id: string;
  quantity: number;
  books: {
    title: string;
    price: number;
  };
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function CheckoutForm({ items, cartItemIds }: { items: CartItemSummary[]; cartItemIds: string[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState("");

  const total = items.reduce((sum, item) => sum + item.books.price * item.quantity, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createOrder(address.trim(), cartItemIds);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/orders?success=true");
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-violet-200 bg-white p-8 text-center">
        <p className="text-sm text-violet-600">Keranjangmu kosong. Tambah buku terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="rounded-xl border border-violet-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-violet-900">
            <MapPin className="h-4 w-4" />
            Alamat Pengiriman
          </h2>
          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-violet-800">Alamat Lengkap</label>
            <textarea
              rows={4}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nama penerima, Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos"
              className="w-full rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-sm text-violet-900 placeholder:text-violet-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>

        <div className="rounded-xl border border-violet-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-violet-900">
            <Package className="h-4 w-4" />
            Metode Pembayaran
          </h2>
          <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 p-3">
            <p className="text-sm font-medium text-violet-900">Cash on Delivery (COD)</p>
            <p className="mt-0.5 text-xs text-violet-600">
              Bayar tunai saat buku sampai di alamat pengiriman.
            </p>
          </div>
        </div>
      </div>

      <div className="h-fit rounded-xl border border-violet-200 bg-white p-5">
        <h2 className="text-base font-semibold text-violet-900">Ringkasan Pesanan</h2>
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="line-clamp-1 max-w-40 text-violet-600">
                {item.books.title} x{item.quantity}
              </span>
              <span className="text-violet-900">{formatRupiah(item.books.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="my-4 h-px bg-violet-200" />
        <div className="flex justify-between text-base font-bold text-violet-900">
          <span>Total</span>
          <span>{formatRupiah(total)}</span>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || !address.trim()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Memproses..." : "Buat Pesanan"}
        </button>
      </div>
    </form>
  );
}
