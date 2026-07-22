"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getRoleCoursesAll() {
  const supabase = createServiceClient();

  const [{ data: roleCourses }, { data: courses }] = await Promise.all([
    supabase
      .from("role_courses")
      .select("*, courses(id, title)")
      .order("created_at"),
    supabase
      .from("courses")
      .select("id, title")
      .order("title"),
  ]);

  return {
    roleCourses: (roleCourses || []) as any[],
    courses: (courses || []) as { id: string; title: string }[],
  };
}

export async function addRoleCourse(role: string, courseId: string) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("role_courses")
    .insert({ role, course_id: courseId });

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/role-training");
  return { success: true };
}

export async function removeRoleCourse(id: string) {
  const supabase = createServiceClient();
  await supabase.from("role_courses").delete().eq("id", id);
  revalidatePath("/admin/role-training");
  return { success: true };
}
