import { redirect } from "next/navigation";
import { getCartItems } from "@/lib/actions/cart";
import CheckoutForm from "./_components/checkout-form";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ items?: string }> }) {
  const { items: itemsParam } = await searchParams;

  if (!itemsParam) redirect("/cart");

  const selectedIds = itemsParam.split(",").filter(Boolean);
  const allCartItems = await getCartItems();
  const selectedItems = allCartItems.filter((item) => selectedIds.includes(item.id));

  if (selectedItems.length === 0) redirect("/cart");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-violet-900">Checkout</h1>
        <p className="mt-1 text-sm text-violet-600">
          Melanjutkan {selectedItems.length} item yang dipilih
        </p>
      </div>
      <CheckoutForm items={selectedItems} cartItemIds={selectedIds} />
    </div>
  );
}
