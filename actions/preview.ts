"use server";

import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";

export async function setPreviewRole(role: string) {
  const supabase = createServiceClient();
  const { data: { user } } = await (await import("@/lib/supabase/server")).createClient().auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return;

  const cookieStore = await cookies();
  cookieStore.set("preview_role", role, { path: "/", httpOnly: true, maxAge: 60 * 60 });
}

export async function clearPreviewRole() {
  const cookieStore = await cookies();
  cookieStore.delete("preview_role");
}
