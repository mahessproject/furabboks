"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "./_helpers";
import type { ActionResult } from "@/types";

export async function getCategories() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.from("categories").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getCategoriesPublic() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("id, name").order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const { error } = await supabase.from("categories").insert({ name, description });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/categories");
  return { success: true };
}

export async function createCategoryQuick(name: string): Promise<{ id: string; name: string } | { error: string }> {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.from("categories").insert({ name }).select("id, name").single();
  if (error) return { error: error.message };
  revalidatePath("/dashboard/categories");
  return data;
}

export async function updateCategory(formData: FormData): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const { error } = await supabase.from("categories").update({ name, description }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/categories");
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/categories");
  return { success: true };
}
