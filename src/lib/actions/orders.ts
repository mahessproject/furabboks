"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./_helpers";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types";

/* Valid status transitions agar admin tidak bisa loncat sembarangan */
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const ALL_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export async function getOrders() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("*, profiles(full_name), order_items(*, books(title, cover_url))")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function updateOrderStatus(id: string, status: string): Promise<ActionResult> {
  const supabase = await requireAdmin();

  // Validasi status input
  if (!ALL_STATUSES.includes(status)) {
    return { error: "Status tidak valid." };
  }

  // Ambil status saat ini untuk validasi transisi
  const { data: order } = await supabase.from("orders").select("status").eq("id", id).single();
  if (!order) return { error: "Pesanan tidak ditemukan." };

  const allowed = VALID_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(status)) {
    return { error: `Tidak bisa mengubah status dari "${order.status}" ke "${status}".` };
  }

  const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/orders");
  revalidatePath("/orders");
  return { success: true };
}

/**
 * User mengonfirmasi pesanan diterima.
 * Hanya bisa dilakukan oleh pemilik pesanan dan saat status = 'shipped'.
 */
export async function confirmOrder(orderId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Kamu harus login." };

  // Ambil order dan validasi kepemilikan
  const { data: order } = await supabase.from("orders").select("id, user_id, status").eq("id", orderId).single();

  if (!order) return { error: "Pesanan tidak ditemukan." };
  if (order.user_id !== user.id) return { error: "Kamu tidak bisa mengonfirmasi pesanan orang lain." };
  if (order.status !== "shipped") {
    return { error: "Pesanan hanya bisa dikonfirmasi saat status 'Dikirim'." };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "delivered", updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("user_id", user.id); // double-check ownership di query level

  if (error) return { error: error.message };
  revalidatePath("/orders");
  revalidatePath("/dashboard/orders");
  return { success: true };
}

export async function getUserOrders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, books(id, title, cover_url))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createOrder(
  shippingAddress: string,
  cartItemIds: string[],
): Promise<{ error: string } | { success: true; orderId: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Kamu harus login untuk melakukan pemesanan." };

  if (!cartItemIds || cartItemIds.length === 0) return { error: "Pilih setidaknya satu item untuk di-checkout." };

  // Sanitize shipping address
  const trimmedAddress = shippingAddress.trim();
  if (!trimmedAddress || trimmedAddress.length < 10) {
    return { error: "Alamat pengiriman minimal 10 karakter." };
  }

  const { data: cartItems, error: cartError } = await supabase
    .from("cart_items")
    .select("*, books(id, title, price, stock)")
    .eq("user_id", user.id)
    .in("id", cartItemIds);
  if (cartError) return { error: cartError.message };
  if (!cartItems || cartItems.length === 0) return { error: "Item yang dipilih tidak ditemukan." };

  for (const item of cartItems) {
    if (item.quantity > item.books.stock) {
      return { error: `Stok "${item.books.title}" tidak mencukupi.` };
    }
  }

  const totalAmount = cartItems.reduce(
    (sum: number, item: { books: { price: number }; quantity: number }) =>
      sum + Number(item.books.price) * item.quantity,
    0,
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      total_amount: totalAmount,
      shipping_address: trimmedAddress,
      payment_method: "cod",
    })
    .select("id")
    .single();
  if (orderError) return { error: orderError.message };

  const orderItems = cartItems.map((item: { book_id: string; quantity: number; books: { price: number } }) => ({
    order_id: order.id,
    book_id: item.book_id,
    quantity: item.quantity,
    price_at_order: item.books.price,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) return { error: itemsError.message };

  await supabase.from("cart_items").delete().eq("user_id", user.id).in("id", cartItemIds);

  revalidatePath("/orders");
  revalidatePath("/cart");
  return { success: true, orderId: order.id };
}
