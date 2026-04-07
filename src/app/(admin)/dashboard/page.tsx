/*
 * Admin Dashboard — halaman utama panel admin.
 * Menampilkan ringkasan statistik real-time dari database Supabase.
 */

import { BookOpen, TrendingUp, Users, Package, Wallet, MousePointerClick, TrendingDown, Clock, MoreHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, cn } from "@/lib/utils";
import Link from "next/link";

async function getDashboardData() {
  const supabase = await createClient();

  const [booksRes, usersRes, ordersRes, recentOrdersRes] = await Promise.all([
    supabase.from("books").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("status, total_amount"),
    supabase.from("orders").select("id, status, total_amount, created_at, profiles(full_name)").order("created_at", { ascending: false }).limit(5),
  ]);

  const orders = ordersRes.data || [];
  const activeOrders = orders.filter((o) => ["pending", "confirmed", "shipped"].includes(o.status)).length;
  const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);

  return {
    books: booksRes.count ?? 0,
    users: usersRes.count ?? 0,
    orders: orders.length,
    activeOrders,
    totalRevenue,
    recentOrders: recentOrdersRes.data || [],
  };
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();
  
  const STATS = [
    {
      label: "Total Pendapatan",
      value: formatRupiah(data.totalRevenue),
      trend: "+12.5% bln ini",
      trendIcon: TrendingUp,
      trendColor: "text-emerald-600",
      icon: Wallet,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Pengguna Baru",
      value: data.users.toLocaleString("id-ID"),
      trend: "+8.2% bln ini",
      trendIcon: TrendingUp,
      trendColor: "text-emerald-600",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Pesanan Aktif",
      value: data.activeOrders.toLocaleString("id-ID"),
      trend: "Tetap stabil",
      trendIcon: Clock,
      trendColor: "text-amber-600",
      icon: Package,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Total Buku",
      value: data.books.toLocaleString("id-ID"),
      trend: "+2.4% bln ini",
      trendIcon: TrendingUp,
      trendColor: "text-emerald-600",
      icon: BookOpen,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {STATS.map(({ label, value, trend, trendIcon: TrendIcon, trendColor, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">{value}</h3>
                <p className={`mt-2 flex items-center gap-1 text-xs font-medium ${trendColor}`}>
                  <TrendIcon className="h-3 w-3" /> {trend}
                </p>
              </div>
              <div className={`rounded-lg p-3 ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900">Transaksi Terbaru</h2>
          <Link href="/dashboard/orders" className="text-sm font-semibold text-indigo-600 hover:underline">
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Jumlah</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    Belum ada transaksi.
                  </td>
                </tr>
              ) : (
                data.recentOrders.map((order: any) => {
                  let statusStr = order.status;
                  let badgeClass = "bg-slate-100 text-slate-700";

                  switch (order.status) {
                    case "pending":
                      statusStr = "Menunggu";
                      badgeClass = "bg-amber-100 text-amber-700";
                      break;
                    case "confirmed":
                      statusStr = "Konfirmasi";
                      badgeClass = "bg-blue-100 text-blue-700";
                      break;
                    case "shipped":
                      statusStr = "Dikirim";
                      badgeClass = "bg-purple-100 text-purple-700";
                      break;
                    case "delivered":
                      statusStr = "Selesai";
                      badgeClass = "bg-emerald-100 text-emerald-700";
                      break;
                    case "cancelled":
                      statusStr = "Batal";
                      badgeClass = "bg-red-100 text-red-700";
                      break;
                  }

                  const initial = order.profiles?.full_name?.charAt(0).toUpperCase() || "?";
                  const name = order.profiles?.full_name || "Unknown";

                  return (
                    <tr key={order.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                            {initial}
                          </div>
                          <span className="font-medium text-sm text-slate-900">{name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {formatRupiah(Number(order.total_amount))}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badgeClass}`}>
                          {statusStr}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link href="/dashboard/orders" className="p-1 text-slate-400 hover:text-slate-600 inline-block">
                          <MoreHorizontal className="h-5 w-5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
