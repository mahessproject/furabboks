"use client";

/*
 * CategoriesClient — komponen interaktif CRUD kategori.
 * Menampilkan tabel kategori, form tambah/edit, dan konfirmasi hapus.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import Modal from "@/components/ui/modal";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/categories";
import type { Category } from "@/types";

interface Props {
  initialCategories: Category[];
}

export default function CategoriesClient({ initialCategories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  /* State untuk modal form */
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  /* State untuk modal konfirmasi hapus */
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setFormError(null);
  }

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = editing ? await updateCategory(formData) : await createCategory(formData);

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
      const result = await deleteCategory(deleteTarget.id);

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
        <p className="text-sm italic text-indigo-400">
          {initialCategories.length} kategori ditemukan
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition-all hover:bg-violet-700 hover:shadow-violet-300"
        >
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </button>
      </div>

      {/* Tabel Kategori */}
      {initialCategories.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-sm italic text-indigo-400">
            Belum ada kategori. Klik &quot;Tambah Kategori&quot; untuk memulai.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-[#fcfcff]">
              <tr>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-violet-600 italic">
                  Nama
                </th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-violet-600 italic">
                  Deskripsi
                </th>
                <th className="px-8 py-4 text-right text-xs font-bold uppercase tracking-wider text-violet-600 italic">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {initialCategories.map((cat) => (
                <tr key={cat.id} className="transition-colors hover:bg-violet-50/30">
                  <td className="px-8 py-5 font-semibold text-violet-950">{cat.name}</td>
                  <td className="px-8 py-5 text-xs font-medium italic text-indigo-400">
                    {cat.description || "—"}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(cat)}
                        className="rounded-lg p-2 text-indigo-300 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                        aria-label={`Edit ${cat.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteError(null);
                          setDeleteTarget(cat);
                        }}
                        className="rounded-lg p-2 text-indigo-300 transition-colors hover:bg-red-50 hover:text-red-500"
                        aria-label={`Hapus ${cat.name}`}
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

      {/* Modal Form Tambah/Edit */}
      <Modal open={formOpen} onClose={closeForm} title={editing ? "Edit Kategori" : "Tambah Kategori"}>
        <form action={handleSubmit} className="space-y-5">
          {editing && <input type="hidden" name="id" value={editing.id} />}

          {formError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {formError}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="cat-name"
              className="block text-xs font-bold uppercase tracking-wider text-violet-700"
            >
              Nama Kategori
            </label>
            <input
              id="cat-name"
              name="name"
              type="text"
              required
              defaultValue={editing?.name ?? ""}
              className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-violet-900 placeholder:text-slate-400 focus:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="Contoh: Fiksi"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="cat-desc"
              className="block text-xs font-bold uppercase tracking-wider text-violet-700"
            >
              Deskripsi <span className="font-normal normal-case text-slate-400">(opsional)</span>
            </label>
            <textarea
              id="cat-desc"
              name="description"
              rows={3}
              defaultValue={editing?.description ?? ""}
              className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-violet-900 placeholder:text-slate-400 focus:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="Deskripsi singkat kategori"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition-all hover:bg-violet-700 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Simpan Perubahan" : "Tambah"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus Kategori">
        <div className="space-y-5">
          {deleteError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {deleteError}
            </div>
          )}

          <p className="text-sm text-slate-600">
            Yakin ingin menghapus kategori{" "}
            <strong className="font-semibold text-violet-950">{deleteTarget?.name}</strong>? Buku yang
            terkait akan kehilangan kategori.
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 disabled:opacity-50"
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
