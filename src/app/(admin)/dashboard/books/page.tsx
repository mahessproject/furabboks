/*
 * Admin Buku — Server Component yang mengambil data buku dan kategori,
 * lalu merender client component untuk CRUD interaktif.
 */

import { getBooks } from "@/lib/actions/books";
import { getCategories } from "@/lib/actions/categories";
import BooksClient from "./_components/books-client";

export default async function AdminBooksPage() {
  const [books, categories] = await Promise.all([getBooks(), getCategories()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-violet-900">Manajemen Buku</h1>
        <p className="mt-1 text-sm text-violet-600">Kelola data buku yang tersedia di toko.</p>
      </div>

      <BooksClient initialBooks={books} categories={categories} />
    </div>
  );
}
