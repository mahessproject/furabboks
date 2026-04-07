import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/layout/admin-sidebar";
import { Menu, Search, Bell } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/?auth=login");

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/books");

  const initial = profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "A";

  return (
    <div className="flex min-h-screen font-sans text-violet-900 bg-violet-50/30">
      <AdminSidebar />
      <main className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-violet-100 bg-white px-4 md:px-8">
          <div className="flex flex-1 items-center gap-4">
            <button className="p-2 text-violet-600 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden w-full max-w-md sm:block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-violet-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Cari data atau laporan..."
                className="block w-full rounded-lg border border-violet-100 bg-violet-50/50 py-2 pl-10 pr-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 text-violet-500 hover:bg-violet-50">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-violet-100 pl-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-violet-950">{profile.full_name || "Administrator"}</p>
                <p className="text-xs font-medium text-violet-500">Admin</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 font-bold text-white shadow-sm shadow-violet-200">
                {initial}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 flex-1 bg-violet-50/30">{children}</div>
      </main>
    </div>
  );
}
