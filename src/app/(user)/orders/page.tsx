import { CheckCircle } from "lucide-react";
import { getUserOrders } from "@/lib/actions/orders";
import { createClient } from "@/lib/supabase/server";
import OrdersUserClient from "./_components/orders-user-client";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const { success } = await searchParams;
  const orders = await getUserOrders();

  // Build a map of already-reviewed book+order combos
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let reviewedMap: Record<string, boolean> = {};
  if (user) {
    const { data: reviews } = await supabase
      .from("reviews")
      .select("book_id, order_id")
      .eq("user_id", user.id);
    if (reviews) {
      for (const r of reviews) {
        reviewedMap[`${r.book_id}_${r.order_id}`] = true;
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-violet-900">Riwayat Pesanan</h1>
        <p className="mt-1 text-sm text-violet-600">{orders.length} pesanan</p>
      </div>

      {success === "true" && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
          <p className="text-sm font-medium text-green-800">
            Pesanan berhasil dibuat! Admin akan segera mengkonfirmasi pesananmu.
          </p>
        </div>
      )}

      <OrdersUserClient orders={orders} reviewedMap={reviewedMap} />
    </div>
  );
}
