"use server";

import { createClient } from "@/lib/supabase/server";

type ActionResult = { error: string; redirectTo?: never } | { redirectTo: string; error?: never };

export async function loginAction(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi tidak valid, coba lagi." };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  return { redirectTo: profile?.role === "admin" ? "/dashboard" : "/books" };
}
