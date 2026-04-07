"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, Tags, BookOpen, Users, ShoppingCart, Mail, LogOut, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_MENU = [
  { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/dashboard/categories", label: "Kategori", icon: Tags },
  { href: "/dashboard/books", label: "Katalog Buku", icon: BookOpen },
  { href: "/dashboard/users", label: "Pengguna", icon: Users },
  { href: "/dashboard/orders", label: "Pesanan", icon: Package },
  { href: "/dashboard/messages", label: "Pesan Masuk", icon: Mail },
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-violet-100 bg-white transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center gap-2 font-bold text-2xl text-violet-700">
          <BookOpen className="h-7 w-7 text-violet-600" />
          <span>FURABBOOKS</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <div className="pb-2">
          <p className="px-4 text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">Main Menu</p>
          {ADMIN_MENU.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition",
                  isActive
                    ? "bg-violet-100/80 text-violet-700 shadow-sm shadow-violet-100/50"
                    : "text-violet-600 hover:bg-violet-50 hover:text-violet-800",
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-violet-600" : "text-violet-500")} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-violet-100 bg-white">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-rose-500 hover:bg-rose-50 rounded-xl transition font-medium"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
