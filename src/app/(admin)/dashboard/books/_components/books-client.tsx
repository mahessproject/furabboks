"use client";

/*
 * BooksClient — komponen interaktif CRUD data buku.
 * Menampilkan tabel buku, form tambah/edit (termasuk pilih kategori), dan konfirmasi hapus.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import Modal from "@/components/ui/modal";
import { createBook, updateBook, deleteBook } from "@/lib/actions/books";
import { createCategoryQuick } from "@/lib/actions/categories";
import type { Category } from "@/types";

/* Tipe buku dengan relasi kategori dari Supabase join */
interface BookRow {
  id: string;
  title: string;
  author: string;
  description: string | null;
  price: number;
  stock: number;
  cover_url: string | null;
  category_id: string;
  created_at: string;
  updated_at: string;
  categories: { id: string; name: string } | null;
}

interface Props {
  initialBooks: BookRow[];
  categories: Category[];
}

/* Format angka ke Rupiah */
function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function BooksClient({ initialBooks, categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  /* State modal form */
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BookRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  /* State modal hapus */
  const [deleteTarget, setDeleteTarget] = useState<BookRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  /* State kategori lokal (bisa bertambah saat user buat kategori baru inline) */
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatError, setNewCatError] = useState<string | null>(null);
  const [newCatLoading, setNewCatLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  function openCreate() {
    setEditing(null);
    setFormError(null);
    setSelectedCategoryId("");
    setShowNewCat(false);
    setNewCatName("");
    setNewCatError(null);
    setFormOpen(true);
  }

  function openEdit(book: BookRow) {
    setEditing(book);
    setFormError(null);
    setSelectedCategoryId(book.category_id ?? "");
    setShowNewCat(false);
    setNewCatName("");
    setNewCatError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setFormError(null);
    setShowNewCat(false);
    setNewCatName("");
    setNewCatError(null);
  }

  async function handleAddCategory() {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    setNewCatLoading(true);
    setNewCatError(null);
    try {
      const result = await createCategoryQuick(trimmed);
      if ("error" in result) {
        setNewCatError(result.error);
      } else {
        setLocalCategories((prev) => [...prev, { ...result, description: null, created_at: new Date().toISOString() }]);
        setSelectedCategoryId(result.id);
        setNewCatName("");
        setShowNewCat(false);
      }
    } finally {
      setNewCatLoading(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = editing ? await updateBook(formData) : await createBook(formData);

      if ("error" in result && result.error) {
        setFormError(result.error);
        return;
      }

      closeForm();
      router.refresh();
    });
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteBook(deleteTarget.id);

      if ("error" in result && result.error) {
        setDeleteError(result.error);
        return;
      }

      setDeleteTarget(null);
      setDeleteError(null);
      router.refresh();
    });
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-violet-500">{initialBooks.length} buku</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          Tambah Buku
        </button>
      </div>

      {/* Tabel Buku */}
      {initialBooks.length === 0 ? (
        <div className="rounded-xl border border-violet-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-violet-500">
            Belum ada buku. Klik &quot;Tambah Buku&quot; untuk memulai.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-violet-200 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-violet-200 bg-violet-50">
              <tr>
                <th className="px-4 py-3 font-medium text-violet-700">Cover</th>
                <th className="px-4 py-3 font-medium text-violet-700">Judul</th>
                <th className="px-4 py-3 font-medium text-violet-700">Penulis</th>
                <th className="px-4 py-3 font-medium text-violet-700">Kategori</th>
                <th className="px-4 py-3 font-medium text-violet-700">Harga</th>
                <th className="px-4 py-3 font-medium text-violet-700">Stok</th>
                <th className="px-4 py-3 text-right font-medium text-violet-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-100 bg-white">
              {initialBooks.map((book) => (
                <tr key={book.id} className="hover:bg-violet-50/50 transition-colors">
                  <td className="px-4 py-3">
                    {book.cover_url ? (
                      <Image
                        src={book.cover_url}
                        alt={book.title}
                        width={40}
                        height={56}
                        className="rounded object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-14 w-10 items-center justify-center rounded bg-violet-100 text-xs text-violet-400">
                        —
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-violet-900">{book.title}</td>
                  <td className="px-4 py-3 text-violet-600">{book.author}</td>
                  <td className="px-4 py-3 text-violet-600">{book.categories?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-violet-600">{formatRupiah(book.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        book.stock > 0
                          ? "text-violet-600"
                          : "font-medium text-red-600"
                      }
                    >
                      {book.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(book)}
                        className="rounded-lg p-1.5 text-violet-400 transition-colors hover:bg-violet-100 hover:text-violet-700"
                        aria-label={`Edit ${book.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteError(null);
                          setDeleteTarget(book);
                        }}
                        className="rounded-lg p-1.5 text-violet-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label={`Hapus ${book.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form Tambah/Edit Buku */}
      <Modal open={formOpen} onClose={closeForm} title={editing ? "Edit Buku" : "Tambah Buku"}>
        <form action={handleSubmit} className="space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}

          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {/* Judul */}
          <div className="space-y-2">
            <label htmlFor="book-title" className="block text-sm font-medium text-violet-700">
              Judul Buku
            </label>
            <input
              id="book-title"
              name="title"
              type="text"
              required
              defaultValue={editing?.title ?? ""}
              className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-violet-900 placeholder:text-violet-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="Contoh: Laskar Pelangi"
            />
          </div>

          {/* Penulis */}
          <div className="space-y-2">
            <label htmlFor="book-author" className="block text-sm font-medium text-violet-700">
              Penulis
            </label>
            <input
              id="book-author"
              name="author"
              type="text"
              required
              defaultValue={editing?.author ?? ""}
              className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-violet-900 placeholder:text-violet-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="Contoh: Andrea Hirata"
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <label htmlFor="book-desc" className="block text-sm font-medium text-violet-700">
              Deskripsi <span className="text-violet-400">(opsional)</span>
            </label>
            <textarea
              id="book-desc"
              name="description"
              rows={3}
              defaultValue={editing?.description ?? ""}
              className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-violet-900 placeholder:text-violet-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="Sinopsis singkat buku"
            />
          </div>

          {/* Harga & Stok */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="book-price" className="block text-sm font-medium text-violet-700">
                Harga (Rp)
              </label>
              <input
                id="book-price"
                name="price"
                type="number"
                required
                min={1}
                step="any"
                defaultValue={editing?.price ?? ""}
                className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-violet-900 placeholder:text-violet-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder="85000"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="book-stock" className="block text-sm font-medium text-violet-700">
                Stok
              </label>
              <input
                id="book-stock"
                name="stock"
                type="number"
                required
                min={0}
                defaultValue={editing?.stock ?? 0}
                className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-violet-900 placeholder:text-violet-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Kategori */}
          <div className="space-y-2">
            <label htmlFor="book-category" className="block text-sm font-medium text-violet-700">
              Kategori
            </label>
            <div className="flex items-center gap-2">
              <select
                id="book-category"
                name="category_id"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-violet-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="">Pilih Kategori</option>
                {localCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setShowNewCat((v) => !v);
                  setNewCatError(null);
                  setNewCatName("");
                }}
                className="flex-shrink-0 rounded-lg border border-violet-200 p-2 text-violet-500 transition-colors hover:bg-violet-50 hover:text-violet-700"
                title="Tambah kategori baru"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {showNewCat && (
              <div className="mt-2 flex items-start gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                    className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-violet-900 placeholder:text-violet-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    placeholder="Nama kategori baru"
                    autoFocus
                  />
                  {newCatError && (
                    <p className="mt-1 text-xs text-red-500">{newCatError}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={newCatLoading || !newCatName.trim()}
                  className="flex-shrink-0 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
                >
                  {newCatLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Tambah"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Cover URL */}
          <div className="space-y-2">
            <label htmlFor="book-cover" className="block text-sm font-medium text-violet-700">
              URL Cover <span className="text-violet-400">(opsional)</span>
            </label>
            <input
              id="book-cover"
              name="cover_url"
              type="url"
              defaultValue={editing?.cover_url ?? ""}
              className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-violet-900 placeholder:text-violet-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="https://picsum.photos/seed/book/400/600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-violet-200 px-4 py-2 text-sm text-violet-700 transition-colors hover:bg-violet-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Simpan" : "Tambah"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus Buku">
        <div className="space-y-4">
          {deleteError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {deleteError}
            </div>
          )}

          <p className="text-sm text-violet-600">
            Yakin ingin menghapus buku{" "}
            <strong className="text-violet-900">{deleteTarget?.title}</strong>? Data yang sudah dihapus
            tidak bisa dikembalikan.
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg border border-violet-200 px-4 py-2 text-sm text-violet-700 transition-colors hover:bg-violet-50"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Hapus
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
