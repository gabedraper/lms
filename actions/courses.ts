"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCourse(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const thumbnailUrl = formData.get("thumbnail_url") as string;

  if (!title) return { success: false, error: "Title is required" };

  const { data, error } = await supabase
    .from("courses")
    .insert({
      title,
      description,
      thumbnail_url: thumbnailUrl || null,
      instructor_id: user.id,
      is_published: false,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/instructor/courses");
  return { success: true, course: data };
}

export async function updateCourse(
  courseId: string,
  updates: {
    title?: string;
    description?: string;
    thumbnail_url?: string;
    is_published?: boolean;
  }
) {
  const supabase = createClient();

  const { error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", courseId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/instructor/courses/${courseId}`);
  return { success: true };
}

export async function deleteCourse(courseId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/instructor/courses");
  return { success: true };
}

export async function publishCourse(courseId: string, publish: boolean) {
  return updateCourse(courseId, { is_published: publish });
}
