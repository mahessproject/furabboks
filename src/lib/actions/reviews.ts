"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types";

/**
 * Ambil semua review untuk buku tertentu (publik, tanpa auth).
 */
export async function getBookReviews(bookId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles(full_name)")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Ambil rata-rata rating untuk sebuah buku.
 */
export async function getBookAverageRating(bookId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("reviews").select("rating").eq("book_id", bookId);
  if (error) return { average: 0, count: 0 };
  if (!data || data.length === 0) return { average: 0, count: 0 };
  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  return { average: Math.round((sum / data.length) * 10) / 10, count: data.length };
}

/**
 * Cek apakah user sudah mereview buku tertentu di order tertentu.
 */
export async function hasReviewed(bookId: string, orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .eq("order_id", orderId)
    .maybeSingle();
  return !!data;
}

/**
 * Buat review baru. Validasi:
 * 1. User harus login
 * 2. Order harus milik user
 * 3. Order harus berstatus 'delivered'
 * 4. Buku harus ada di order_items
 * 5. Belum pernah review buku ini di order ini
 */
export async function createReview(
  bookId: string,
  orderId: string,
  rating: number,
  comment: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Kamu harus login." };

  // Validasi rating
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Rating harus antara 1-5." };
  }

  // Validasi order milik user & status delivered
  const { data: order } = await supabase.from("orders").select("id, user_id, status").eq("id", orderId).single();

  if (!order) return { error: "Pesanan tidak ditemukan." };
  if (order.user_id !== user.id) return { error: "Kamu tidak bisa mereview pesanan orang lain." };
  if (order.status !== "delivered") return { error: "Pesanan harus sudah diterima untuk memberikan review." };

  // Validasi buku ada di order
  const { data: orderItem } = await supabase
    .from("order_items")
    .select("id")
    .eq("order_id", orderId)
    .eq("book_id", bookId)
    .maybeSingle();

  if (!orderItem) return { error: "Buku ini tidak ada di pesanan tersebut." };

  // Cek sudah pernah review
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .eq("order_id", orderId)
    .maybeSingle();

  if (existing) return { error: "Kamu sudah memberikan review untuk buku ini." };

  // Sanitize comment
  const sanitizedComment = comment.trim().slice(0, 1000) || null;

  const { error } = await supabase.from("reviews").insert({
    user_id: user.id,
    book_id: bookId,
    order_id: orderId,
    rating,
    comment: sanitizedComment,
  });

  if (error) return { error: error.message };

  revalidatePath("/orders");
  revalidatePath(`/books/${bookId}`);
  return { success: true };
}
