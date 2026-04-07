"use server";

import { requireAdmin } from "./_helpers";

export async function getUsers() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}
