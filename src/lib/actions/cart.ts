"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types";

export async function getCartItems() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("cart_items")
    .select("*, books(id, title, author, price, stock, cover_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addToCart(bookId: string, quantity = 1): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Kamu harus login untuk menambah ke keranjang." };

  const { data: book } = await supabase.from("books").select("stock").eq("id", bookId).single();
  if (!book || book.stock < 1) return { error: "Stok buku habis." };

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .single();

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > book.stock) return { error: "Stok tidak mencukupi untuk jumlah yang diminta." };
    const { error } = await supabase.from("cart_items").update({ quantity: newQty }).eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("cart_items").insert({ user_id: user.id, book_id: bookId, quantity });
    if (error) return { error: error.message };
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function updateCartQuantity(cartItemId: string, quantity: number): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  if (quantity <= 0) {
    const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId).eq("user_id", user.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function removeFromCart(cartItemId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/cart");
  return { success: true };
}

export async function clearCart(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/cart");
  return { success: true };
}
