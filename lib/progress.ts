import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCourseProgress(
  supabase: SupabaseClient,
  userId: string,
  courseId: string
): Promise<number> {
  try {
    // Get all lessons for the course in one query (joined through modules)
    const { data: lessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("id, modules!inner(course_id)")
      .eq("modules.course_id", courseId);

    if (lessonsError || !lessons || lessons.length === 0) return 0;

    const lessonIds = lessons.map((l) => l.id);

    // Get completed lessons for user
    const { data: progress, error: progressError } = await supabase
      .from("lesson_progress")
      .select("id")
      .eq("user_id", userId)
      .in("lesson_id", lessonIds);

    if (progressError) return 0;

    const completed = progress?.length ?? 0;
    const total = lessons.length;

    return Math.round((completed / total) * 100);
  } catch {
    return 0;
  }
}
