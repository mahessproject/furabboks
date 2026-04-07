/*
 * Admin Kategori — Server Component yang mengambil data kategori
 * dan merender client component untuk CRUD interaktif.
 */

import { getCategories } from "@/lib/actions/categories";
import CategoriesClient from "./_components/categories-client";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-violet-950">Manajemen Kategori</h1>
        <p className="mt-1 text-xs italic text-indigo-400">
          Kelola kategori buku yang tersedia di toko.
        </p>
      </div>

      <CategoriesClient initialCategories={categories} />
    </div>
  );
}
