"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "./_helpers";
import type { ActionResult } from "@/types";

export async function getMessages() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("messages")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function markMessageRead(id: string): Promise<ActionResult> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("messages").update({ is_read: true }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/messages");
  return { success: true };
}

export async function sendMessage(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Kamu harus login untuk mengirim pesan." };

  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,
    subject: formData.get("subject") as string,
    body: formData.get("body") as string,
  });
  if (error) return { error: error.message };
  return { success: true };
}
