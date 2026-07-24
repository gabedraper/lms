"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const BUG_REPORT_RECIPIENT = "gabe@bethefactur.com";

export async function submitBugReport(description: string, pageUrl: string) {
  if (!description.trim()) {
    return { success: false, error: "Please describe the bug before sending." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "Factur LMS Bug Reports <onboarding@resend.dev>",
    to: BUG_REPORT_RECIPIENT,
    replyTo: user.email,
    subject: `Bug report from ${profile?.full_name || user.email}`,
    text: [
      `Reporter: ${profile?.full_name || "Unknown"} (${user.email})`,
      `Page: ${pageUrl}`,
      "",
      description,
    ].join("\n"),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
