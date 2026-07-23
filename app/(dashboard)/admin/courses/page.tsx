"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Search, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createCourse } from "@/actions/courses";
import { getCourseGradient } from "@/lib/course-colors";

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

      {/* Course list */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>{courses.length === 0 ? "No courses yet." : "No courses match your search."}</p>
        </div>
      ) : (
        <div className="border rounded-lg divide-y overflow-hidden">
          {filtered.map((course) => (
            <Link
              key={course.id}
              href={`/admin/courses/${course.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded bg-gradient-to-br ${getCourseGradient(course.id)} shrink-0`} />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{course.title}</p>
                  {course.description && (
                    <p className="text-xs text-muted-foreground truncate">{course.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <Badge variant={course.is_published ? "default" : "secondary"} className="text-xs">
                  {course.is_published ? "Published" : "Draft"}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
