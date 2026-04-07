"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BookOpen,
  Home,
  ShoppingCart,
  ClipboardList,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Bell,
  Wallet,
} from "lucide-react";
import type { Profile } from "@/types";

export default function UserNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setProfile(data);
      }
    }
    load();

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initial = profile?.full_name?.charAt(0).toUpperCase() || "?";

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md border-b border-violet-100 shadow-sm" : "bg-white border-b border-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/books" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-200 group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-violet-950">
              FURAB<span className="text-violet-600">BOOKS</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-violet-600">
            <Link
              href="/books"
              className={`${pathname === "/books" ? "text-violet-700 font-bold" : "hover:text-violet-700 transition"}`}
            >
              Beranda
            </Link>
            <Link
              href="/orders"
              className={`${pathname === "/orders" ? "text-violet-700 font-bold" : "hover:text-violet-700 transition"}`}
            >
              Pesanan Saya
            </Link>
            <Link
              href="/cart"
              className={`${pathname === "/cart" ? "text-violet-700 font-bold" : "hover:text-violet-700 transition"}`}
            >
              Keranjang
            </Link>
            <Link
              href="/contact"
              className={`${pathname === "/contact" ? "text-violet-700 font-bold" : "hover:text-violet-700 transition"}`}
            >
              Kontak
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center gap-2">
              <Link
                href="/cart"
                className="p-2.5 text-violet-600 hover:bg-violet-50 rounded-full transition relative group"
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>
            </div>

            {/* Profile Dropdown */}
            {profile ? (
              <div className="relative" ref={dropdownRef}>
                <div
                  className="flex items-center gap-3 pl-4 border-l border-violet-100 cursor-pointer group"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-violet-950">
                      Halo, {profile.full_name?.split(" ")[0] || "User"}!
                    </p>
                    <p className="text-[10px] text-violet-500 font-medium uppercase tracking-tighter">Member</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 font-bold flex items-center justify-center border-2 border-transparent group-hover:border-violet-500 transition">
                    {initial}
                  </div>
                </div>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-48 rounded-2xl border border-violet-100 bg-white py-2 shadow-xl shadow-violet-500/10">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-10 w-32 animate-pulse bg-violet-100 rounded-xl"></div>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-violet-700">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-violet-100 bg-white px-4 py-4 md:hidden shadow-lg">
          <div className="flex flex-col gap-2">
            <Link
              href="/books"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-violet-50 text-sm font-bold text-violet-700"
            >
              <Home className="h-4 w-4" /> Beranda
            </Link>
            <Link
              href="/orders"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-violet-50 text-sm font-bold text-violet-700"
            >
              <ClipboardList className="h-4 w-4" /> Pesanan Saya
            </Link>
            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-violet-50 text-sm font-bold text-violet-700"
            >
              <ShoppingCart className="h-4 w-4" /> Keranjang
            </Link>
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-violet-50 text-sm font-bold text-violet-700"
            >
              <MessageSquare className="h-4 w-4" /> Kontak
            </Link>
            <div className="my-2 border-t border-violet-100"></div>
            {profile && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 text-sm font-bold text-rose-600 hover:bg-rose-100 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
