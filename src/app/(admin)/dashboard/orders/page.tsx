import { getOrders } from "@/lib/actions/orders";
import { Package } from "lucide-react";
import OrdersAdminClient from "./_components/orders-admin-client";

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-violet-900">Daftar Pesanan</h1>
        <p className="mt-1 text-sm text-violet-600">{orders.length} pesanan</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-violet-200 bg-white py-16 shadow-sm">
          <Package className="h-10 w-10 text-violet-300" />
          <p className="mt-3 text-sm text-violet-500">Belum ada pesanan.</p>
        </div>
      ) : (
        <OrdersAdminClient orders={orders} />
      )}
    </div>
  );
}
