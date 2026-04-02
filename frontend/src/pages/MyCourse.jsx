import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { fetchCourses } from "../lib/resultApi";

function MyCourse() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const nextCourses = await fetchCourses();
        if (!cancelled) setCourses(nextCourses);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Unable to load courses.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-50 mb-2 flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-emerald-300" />
          My course
        </h1>
        <p className="text-slate-300">
          Courses available in the system (from backend).
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm leading-6 text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/8 bg-white/5 p-6">
        {isLoading ? (
          <p className="text-slate-400">Loading...</p>
        ) : courses.length === 0 ? (
          <p className="text-slate-300">No courses found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {courses.map((course) => (
              <div
                className="rounded-xl border border-white/8 bg-slate-950/30 p-4"
                key={course.value || course.label}
              >
                <p className="text-slate-50 font-semibold">{course.label}</p>
                <p className="text-xs text-slate-400 mt-1">{course.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCourse;

