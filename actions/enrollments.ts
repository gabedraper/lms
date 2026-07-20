"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function enrollInCourse(courseId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("enrollments").insert({
    user_id: user.id,
    course_id: courseId,
  });

  if (error && error.code !== "23505") {
    // 23505 = unique violation (already enrolled)
    return { success: false, error: error.message };
  }

  revalidatePath("/learner");
  return { success: true };
}

export async function unenrollFromCourse(courseId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("enrollments")
    .delete()
    .eq("user_id", user.id)
    .eq("course_id", courseId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/learner");
  return { success: true };
}
