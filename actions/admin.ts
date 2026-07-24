"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { revalidatePath } from "next/cache";

export async function getUsersWithEmails() {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: authUsers } = await supabase.auth.admin.listUsers();

  const emailMap: Record<string, string> = {};
  authUsers?.users?.forEach((u) => {
    emailMap[u.id] = u.email || "";
  });

  return (profiles || []).map((p) => ({ ...p, email: emailMap[p.id] || "" }));
}

export async function inviteUser(email: string, fullName: string, role: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://learn.facturmfg.com"}/reset-password`,
  });

  if (error) return { success: false, error: error.message };

  // Wait briefly for auth user to be created, then create profile
  await new Promise((r) => setTimeout(r, 1000));
  const { data: newUser } = await supabase.auth.admin.listUsers();
  const created = newUser?.users?.find((u) => u.email === email);
  if (created) {
    await supabase.from("profiles").upsert({
      id: created.id,
      full_name: fullName,
      role,
    });
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserRole(userId: string, role: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}

export async function sendPasswordReset(email: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://learn.facturmfg.com"}/reset-password`,
    },
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}
