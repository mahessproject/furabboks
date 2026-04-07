"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Menu, X, LogOut, ChevronDown, ShoppingCart } from "lucide-react";
import type { Profile } from "@/types";

export default function Navbar() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setProfile(data);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfile(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-violet-200 bg-white   shadow-sm">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-700 transition-transform group-hover:scale-105">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-[18px] tracking-tight text-violet-900 ">FURABBOOKS</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {profile ? (
            <Link href="/cart" className="relative p-2 text-violet-600 hover:text-violet-600  ">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          ) : !loading ? (
            <Link href="?auth=login" className="relative p-2 text-violet-600 hover:text-violet-600  ">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          ) : null}

          {loading ? (
            <div className="h-9 w-32 animate-pulse rounded-full bg-violet-200 " />
          ) : profile ? (
            <div className="flex items-center gap-3">
              <Link
                href={profile.role === "admin" ? "/dashboard" : "/books"}
                className="text-sm font-medium text-violet-900 hover:text-violet-600 "
              >
                {profile.full_name}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center rounded-full border border-violet-300 px-4 py-1.5 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-50   "
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-0.5">
              <Link
                href="?auth=login"
                className="rounded-full border border-violet-500/30 px-6 py-2 text-[13px] font-bold text-violet-900 transition-colors hover:bg-violet-100   "
              >
                Masuk
              </Link>
              <Link
                href="?auth=register"
                className="rounded-full bg-violet-700 px-6 py-2 text-[13px] font-bold text-white transition-colors hover:bg-violet-800"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-violet-700 "
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-violet-200 bg-white px-4 py-4 md:hidden  ">
          <div className="flex flex-col gap-3">
            <Link
              href="/books"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between text-sm text-violet-600 "
            >
              Kategori <ChevronDown className="h-4 w-4" />
            </Link>
            {profile ? (
              <Link
                href="/cart"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-violet-600  flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" /> Keranjang
              </Link>
            ) : (
              <Link
                href="?auth=login"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-violet-600  flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" /> Keranjang
              </Link>
            )}

            <div className="my-2 border-t border-violet-100 "></div>

            {profile ? (
              <>
                <Link
                  href={profile.role === "admin" ? "/dashboard" : "/books"}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-violet-900 "
                >
                  Profil ({profile.full_name})
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-fit items-center gap-2 rounded-md bg-violet-50 px-3 py-1.5 text-sm text-violet-600 "
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Keluar
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Link
                  href="?auth=login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full border border-violet-300 py-2 text-center text-sm font-medium text-violet-700  "
                >
                  Masuk
                </Link>
                <Link
                  href="?auth=register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full bg-violet-700 py-2 text-center text-sm font-medium text-white"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
