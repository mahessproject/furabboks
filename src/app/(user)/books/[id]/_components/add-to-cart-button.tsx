"use client";

import { useState, useTransition } from "react";
import { ShoppingCart, Loader2, Check } from "lucide-react";
import { addToCart } from "@/lib/actions/cart";

export default function AddToCartButton({ bookId, disabled }: { bookId: string; disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await addToCart(bookId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    });
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={disabled || isPending}
        className="flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : added ? (
          <Check className="h-4 w-4" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
        {isPending ? "Menambahkan..." : added ? "Ditambahkan!" : "Tambah ke Keranjang"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
