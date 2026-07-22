import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Eye, Pencil, Plus } from "lucide-react";
import { createCourse } from "@/actions/courses";

async function handleCreate(formData: FormData) {
  "use server";
  const result = await createCourse(formData);
  if (result?.success && result?.course?.id) {
    redirect(`/instructor/courses/${result.course.id}`);
  }
}

export default async function AdminCoursesPage() {
  const supabase = createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">All Courses</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage courses
          </p>
        </div>
        <form action={handleCreate}>
          <input type="hidden" name="title" value="New Course" />
          <Button type="submit">
            <Plus className="h-4 w-4 mr-2" />
            New Course
          </Button>
        </form>
      </div>

      {(!courses || courses.length === 0) ? (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No courses created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <Card key={course.id} className="flex flex-col">
              <div
                className="h-32 rounded-t-lg bg-gradient-to-br from-blue-400 to-indigo-600"
                style={
                  course.thumbnail_url
                    ? {
                        backgroundImage: `url(${course.thumbnail_url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {}
                }
              />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">
                    {course.title}
                  </CardTitle>
                  <Badge
                    variant={course.is_published ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {course.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
                {course.description && (
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Instructor: {(course.profiles as any)?.full_name ?? "Unknown"}
                </p>
              </CardHeader>
              <CardContent className="mt-auto pt-0 flex gap-2">
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/learner/courses/${course.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/instructor/courses/${course.id}`}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
