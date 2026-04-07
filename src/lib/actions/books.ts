"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "./_helpers";
import type { ActionResult } from "@/types";

export async function getBooks() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("books")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getBook(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("books").select("*, categories(name)").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getBooksPublic() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getBooksLatest(limit = 8) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("id, title, author, price, cover_url, stock, categories(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getBooksBestSellers(limit = 8) {
  const supabase = await createClient();

  const { data: salesData } = await supabase.from("order_items").select("book_id, quantity");

  // Belum ada transaksi → fallback ke buku terbaru supaya section tidak kosong
  if (!salesData || salesData.length === 0) {
    return getBooksLatest(limit);
  }

  // Supabase belum support aggregate query sederhana tanpa RPC, jadi hitung di sisi JS
  const soldMap = new Map<string, number>();
  for (const row of salesData) {
    soldMap.set(row.book_id, (soldMap.get(row.book_id) ?? 0) + row.quantity);
  }

  const topIds = Array.from(soldMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  const { data, error } = await supabase
    .from("books")
    .select("id, title, author, price, cover_url, stock, categories(name)")
    .in("id", topIds);
  if (error) throw new Error(error.message);

  // Kembalikan sesuai urutan ranking, bukan urutan DB
  const bookMap = new Map((data ?? []).map((b) => [b.id, b]));
  return topIds.map((id) => bookMap.get(id)).filter(Boolean) as NonNullable<(typeof data)[number]>[];
}

export async function createBook(formData: FormData): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("books").insert({
    title: formData.get("title") as string,
    author: formData.get("author") as string,
    description: formData.get("description") as string,
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    cover_url: formData.get("cover_url") as string,
    category_id: (formData.get("category_id") as string) || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/books");
  return { success: true };
}

export async function updateBook(formData: FormData): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const id = formData.get("id") as string;
  const { error } = await supabase
    .from("books")
    .update({
      title: formData.get("title") as string,
      author: formData.get("author") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock")),
      cover_url: formData.get("cover_url") as string,
      category_id: (formData.get("category_id") as string) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/books");
  return { success: true };
}

export async function deleteBook(id: string): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/books");
  return { success: true };
}
