"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createCourse } from "@/actions/courses";
import { getCourseGradientStyle } from "@/lib/course-colors";

const ALPHABET = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [letter, setLetter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("courses")
      .select("id, title, description, is_published")
      .order("title")
      .then(({ data }) => {
        setCourses(data || []);
        setLoading(false);
      });
  }, []);

  async function handleCreate() {
    setCreating(true);
    const fd = new FormData();
    fd.append("title", "New Course");
    const result = await createCourse(fd);
    if (result?.success && result?.course?.id) {
      router.push(`/instructor/courses/${result.course.id}`);
    }
    setCreating(false);
  }

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesLetter =
      letter === "All" || c.title.toUpperCase().startsWith(letter);
    return matchesSearch && matchesLetter;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">All Courses</h1>
          <p className="text-muted-foreground mt-1">
            {courses.length} courses total
          </p>
        </div>
        <Button onClick={handleCreate} disabled={creating}>
          <Plus className="h-4 w-4 mr-2" />
          {creating ? "Creating..." : "New Course"}
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setLetter("All"); }}
          className="pl-9"
        />
      </div>

      {/* Alphabet filter */}
      <div className="flex flex-wrap gap-1 mb-6">
        {ALPHABET.map((l) => (
          <button
            key={l}
            onClick={() => { setLetter(l); setSearch(""); }}
            className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
              letter === l
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Results count */}
      {(search || letter !== "All") && (
        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Course grid */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>{courses.length === 0 ? "No courses yet." : "No courses match your search."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((course) => (
            <Link
              key={course.id}
              href={`/admin/courses/${course.id}`}
              className="group rounded-xl border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-24" style={getCourseGradientStyle(course.id)} />
              <div className="p-3">
                <p className="font-medium text-sm line-clamp-2 leading-snug mb-1">{course.title}</p>
                <Badge variant={course.is_published ? "default" : "secondary"} className="text-xs">
                  {course.is_published ? "Published" : "Draft"}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
