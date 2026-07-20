import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getCourseProgress } from "@/lib/progress";
import { BookOpen, GraduationCap } from "lucide-react";

export default async function LearnerDashboard() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get enrolled courses
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, courses(*)")
    .eq("user_id", user.id)
    .order("enrolled_at", { ascending: false });

  // Get available published courses not yet enrolled
  const enrolledIds = enrollments?.map((e) => e.course_id) || [];
  const { data: availableCourses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .not("id", "in", `(${enrolledIds.length > 0 ? enrolledIds.join(",") : "00000000-0000-0000-0000-000000000000"})`)
    .limit(6);

  // Calculate progress for enrolled courses
  const enrolledWithProgress = await Promise.all(
    (enrollments || []).map(async (enrollment) => {
      const progress = await getCourseProgress(
        supabase,
        user.id,
        enrollment.course_id
      );
      return { ...enrollment, progress };
    })
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Learning</h1>
        <p className="text-muted-foreground mt-1">
          Continue where you left off
        </p>
      </div>

      {/* Enrolled courses */}
      {enrolledWithProgress.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Enrolled Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledWithProgress.map((enrollment) => {
              const course = enrollment.courses as {
                id: string;
                title: string;
                description: string | null;
                thumbnail_url: string | null;
              } | null;
              if (!course) return null;
              return (
                <Card key={enrollment.id} className="overflow-hidden">
                  <div
                    className="h-32 bg-gradient-to-br from-blue-400 to-indigo-600"
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
                      <CardTitle className="text-base line-clamp-1">
                        {course.title}
                      </CardTitle>
                      {enrollment.completed_at && (
                        <Badge variant="default" className="text-xs">
                          Completed
                        </Badge>
                      )}
                    </div>
                    {course.description && (
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/learner/courses/${course.id}`}>
                        {enrollment.progress > 0 ? "Continue" : "Start"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available courses */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Courses</h2>
        {availableCourses && availableCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <div
                  className="h-32 bg-gradient-to-br from-green-400 to-teal-600"
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
                  <CardTitle className="text-base line-clamp-1">
                    {course.title}
                  </CardTitle>
                  {course.description && (
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link href={`/learner/courses/${course.id}`}>
                      View Course
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No courses available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
