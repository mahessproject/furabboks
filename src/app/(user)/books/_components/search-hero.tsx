"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchHero({ userName }: { userName: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") ?? "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (searchParams.get("category")) params.set("category", searchParams.get("category")!);
    router.push(`/books${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <section className="pt-8 pb-8 px-4 sm:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-violet-950">
            Apa yang ingin kamu baca <span className="text-violet-600">hari ini?</span>
          </h1>
          <p className="text-violet-500 font-medium">Temukan inspirasi dan bacaan terbaru dari FURABBOOKS.</p>
        </div>
        <div className="relative w-full md:w-96">
          <form onSubmit={handleSearch}>
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-violet-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul, penulis..."
              className="w-full pl-12 pr-4 py-4 bg-violet-50 border border-violet-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition shadow-sm text-violet-950 font-medium"
            />
          </form>
        </div>
      </div>
    </section>
  );
}
