import { getCartItems } from "@/lib/actions/cart";
import CartClient from "./_components/cart-client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function CartPage() {
  const items = await getCartItems();

  return (
    <div className="py-10">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
        <Link href="/books" className="transition-colors hover:text-violet-600">
          Beranda
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-violet-600">Keranjang Belanja</span>
      </nav>

      <CartClient items={items} />
    </div>
  );
}
