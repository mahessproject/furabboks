"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Loader2, X, Mail, Lock, User } from "lucide-react";

export default function AuthModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authParam = searchParams.get("auth");
    if (authParam === "login") {
      setMode("login");
      setIsOpen(true);
    } else if (authParam === "register") {
      setMode("register");
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [searchParams]);

  const closeModal = () => {
    setIsOpen(false);
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete("auth");
    currentUrl.searchParams.delete("next");
    router.push(currentUrl.pathname + currentUrl.search);
  };

  function switchMode(target: "login" | "register") {
    setError(null);
    setMode(target);
    router.push("?auth=" + target);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      const nextParam = searchParams.get("next");
      const safeNext = nextParam && nextParam.startsWith("/") ? nextParam : null;
      if (safeNext) {
        window.location.href = safeNext;
      } else {
        window.location.href = profile?.role === "admin" ? "/dashboard" : "/books";
      }
    } else {
      window.location.href = "/books";
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("?auth=login&registered=true");
    setMode("login");
    setLoading(false);
    setPassword("");
    setConfirmPassword("");
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-violet-950/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div
        className="relative w-full max-w-[450px] bg-white rounded-[32px] shadow-2xl shadow-violet-200/60 border border-violet-100 overflow-hidden"
        style={{ animation: "modalFadeIn 0.3s ease-out" }}
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute right-5 top-5 z-10 rounded-full p-1.5 text-violet-400 hover:text-violet-700 hover:bg-violet-50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="pt-10 px-10 pb-6 text-center">
          <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-violet-200">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-violet-950 tracking-tight">
            {mode === "login" ? "Selamat Datang Kembali" : "Mulai Perjalananmu"}
          </h2>
          <p className="text-violet-500 text-sm mt-2">
            {mode === "login"
              ? "Silakan masuk untuk melanjutkan petualangan membacamu."
              : "Buat akun dan dapatkan akses ke seluruh koleksi buku kami."}
          </p>
        </div>

        {/* Toggle Tabs */}
        <div className="px-10 mb-6">
          <div className="flex p-1.5 bg-violet-50 rounded-2xl">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={"flex-1 py-2.5 text-sm font-bold rounded-xl transition duration-200 " + (mode === "login" ? "bg-white shadow-sm text-violet-950" : "text-violet-400 hover:text-violet-600")}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={"flex-1 py-2.5 text-sm font-bold rounded-xl transition duration-200 " + (mode === "register" ? "bg-white shadow-sm text-violet-950" : "text-violet-400 hover:text-violet-600")}
            >
              Daftar
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {searchParams.get("registered") === "true" && mode === "login" && (
          <div className="mx-10 mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 text-center font-medium">
            Pendaftaran berhasil! Silakan masuk.
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mx-10 mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 text-center font-medium">
            {error}
          </div>
        )}

        {/* LOGIN Form */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="px-10 pb-10 space-y-5">
            <div className="space-y-4">
              {/* Divider */}
              <div className="relative flex items-center justify-center py-1">
                <div className="flex-grow border-t border-violet-100"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                  Masuk dengan email
                </span>
                <div className="flex-grow border-t border-violet-100"></div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-violet-500 mb-2 uppercase tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contoh@email.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-violet-50/50 border border-violet-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition text-sm text-violet-950"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-violet-500 mb-2 uppercase tracking-wide">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-violet-50/50 border border-violet-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition text-sm text-violet-950"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-950 text-white py-4 rounded-2xl font-bold shadow-lg shadow-violet-200 hover:bg-violet-700 transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</>
                ) : (
                  "Masuk Sekarang"
                )}
              </button>
            </div>
          </form>
        )}

        {/* REGISTER Form */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="px-10 pb-10 space-y-5">
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-violet-500 mb-2 uppercase tracking-wide">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3.5 bg-violet-50/50 border border-violet-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition text-sm text-violet-950"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-violet-500 mb-2 uppercase tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@email.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-violet-50/50 border border-violet-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition text-sm text-violet-950"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-violet-500 mb-2 uppercase tracking-wide">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-12 pr-4 py-3.5 bg-violet-50/50 border border-violet-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition text-sm text-violet-950"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-violet-500 mb-2 uppercase tracking-wide">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-violet-50/50 border border-violet-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition text-sm text-violet-950"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-violet-100 hover:bg-violet-700 transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</>
                ) : (
                  "Buat Akun Gratis"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="bg-violet-50/50 p-6 text-center border-t border-violet-100">
          <p className="text-xs text-violet-400">
            Punya masalah saat masuk?{" "}
            <a href="/contact" className="text-violet-600 font-bold hover:underline">
              Hubungi Kami
            </a>
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: "@keyframes modalFadeIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }"}} />
    </div>
  );
}
