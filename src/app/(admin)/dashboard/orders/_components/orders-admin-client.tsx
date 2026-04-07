"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BookOpen, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { updateOrderStatus } from "@/lib/actions/orders";

const STATUS_OPTIONS = [
  { value: "pending", label: "Menunggu", style: "bg-yellow-100 text-yellow-700" },
  { value: "confirmed", label: "Dikonfirmasi", style: "bg-blue-100 text-blue-700" },
  { value: "shipped", label: "Dikirim", style: "bg-purple-100 text-purple-700" },
  { value: "delivered", label: "Diterima", style: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Dibatalkan", style: "bg-red-100 text-red-700" },
];

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

interface OrderItem {
  id: string;
  quantity: number;
  price_at_order: number;
  books?: { title?: string; cover_url?: string | null } | null;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  payment_method: string;
  shipping_address: string;
  created_at: string;
  profiles: { full_name: string } | { full_name: string }[] | null;
  order_items?: OrderItem[];
}

interface Props {
  orders: Order[];
}

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
    month: "short",
    year: "numeric",
  });
}

function getUserName(profiles: Order["profiles"]): string {
  if (!profiles) return "—";
  if (Array.isArray(profiles)) return profiles[0]?.full_name ?? "—";
  return profiles.full_name ?? "—";
}

export default function OrdersAdminClient({ orders }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if ("error" in result && result.error) {
        setError(result.error);
      }
      setUpdatingId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {orders.map((order) => {
        const currentStatus = STATUS_OPTIONS.find((s) => s.value === order.status);
        const allowedNext = VALID_TRANSITIONS[order.status] ?? [];
        const isExpanded = expandedId === order.id;

        return (
          <div key={order.id} className="rounded-xl border border-violet-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-[200px]">
                <p className="text-xs text-violet-500">#{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm font-semibold text-violet-900">{getUserName(order.profiles)}</p>
                <p className="text-xs text-violet-500">{formatDate(order.created_at)}</p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-violet-900">{formatRupiah(order.total_amount)}</p>
                <p className="text-xs text-violet-500">{order.payment_method.toUpperCase()}</p>
              </div>

              {/* Status + Dropdown */}
              <div className="flex items-center gap-2">
                {allowedNext.length > 0 ? (
                  <div className="relative">
                    <select
                      value={order.status}
                      disabled={isPending && updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`appearance-none rounded-full py-1 pl-3 pr-8 text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400 ${currentStatus?.style ?? "bg-violet-100 text-violet-700"}`}
                    >
                      <option value={order.status} disabled>
                        {currentStatus?.label ?? order.status}
                      </option>
                      {allowedNext.map((s) => {
                        const opt = STATUS_OPTIONS.find((o) => o.value === s);
                        return (
                          <option key={s} value={s}>
                            → {opt?.label ?? s}
                          </option>
                        );
                      })}
                    </select>
                    {isPending && updatingId === order.id ? (
                      <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-violet-500" />
                    ) : (
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 opacity-50" />
                    )}
                  </div>
                ) : (
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${currentStatus?.style ?? "bg-violet-100 text-violet-700"}`}>
                    {currentStatus?.label ?? order.status}
                  </span>
                )}
              </div>

              {/* Expand toggle */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className="rounded-lg p-1.5 text-violet-400 hover:bg-violet-100 hover:text-violet-700 transition-colors"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="border-t border-violet-100 px-5 py-3 space-y-3">
                <div>
                  <p className="text-xs font-medium text-violet-700 mb-1">Alamat Pengiriman</p>
                  <p className="text-sm text-violet-600">{order.shipping_address}</p>
                </div>

                {order.order_items && order.order_items.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-violet-700 mb-2">Item Pesanan</p>
                    <div className="space-y-2">
                      {order.order_items.map((item) => (
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
                            <p className="text-sm text-violet-900">{item.books?.title ?? "—"}</p>
                            <p className="text-xs text-violet-500">
                              {item.quantity} × {formatRupiah(item.price_at_order)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
