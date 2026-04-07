export type Role = "user" | "admin";

export interface Profile {
  id: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  book_id: string;
  quantity: number;
  created_at: string;
  books: {
    id: string;
    title: string;
    author: string;
    price: number;
    stock: number;
    cover_url: string | null;
  };
}

export interface OrderItem {
  id: string;
  order_id: string;
  book_id: string;
  quantity: number;
  price_at_order: number;
  books: {
    title: string;
    cover_url: string | null;
  } | null;
}

export interface Order {
  id: string;
  user_id: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  shipping_address: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface Review {
  id: string;
  user_id: string;
  book_id: string;
  order_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: { full_name: string } | null;
}

export type ActionResult = { error: string } | { success: true };
export type CreateOrderResult = { error: string } | { success: true; orderId: string };
