import { useEffect, useMemo, useState } from "react";
import { BookOpen, Filter, Pencil, Save, X } from "lucide-react";
import { buildApiUrl } from "../lib/apiBaseUrl";
import { readTeacherSession } from "../lib/teacherAuthApi";

function MyCourse() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchName, setSearchName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const teacherCourses = useMemo(() => {
    const session = readTeacherSession();
    const fromArray = Array.isArray(session?.user?.courses)
      ? session.user.courses
      : [];
    const fromLegacy = String(session?.user?.course || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    return [...new Set([...fromArray, ...fromLegacy].map((item) => item.toLowerCase()))];
  }, []);

  const [editingId, setEditingId] = useState(null);
  const [editTotal, setEditTotal] = useState("");
  const [editGrade, setEditGrade] = useState("");
  const [editAssessments, setEditAssessments] = useState({});
  const [saveStatus, setSaveStatus] = useState("idle");

  function getCourseResultsEndpoint() {
    return buildApiUrl("/api/teacher/course-results");
  }

  function getPatchResultEndpoint(resultId) {
    return buildApiUrl(`/api/teacher/course-results/${encodeURIComponent(resultId)}`);
  }

  const sortedResults = useMemo(() => {
    if (!Array.isArray(results)) return [];
    return [...results].sort((a, b) => {
      const yearA = Number(a?.year ?? 0);
      const yearB = Number(b?.year ?? 0);
      if (yearA !== yearB) return yearA - yearB;
      return String(a?.studentId || "").localeCompare(String(b?.studentId || ""));
    });
  }, [results]);

  useEffect(() => {
    if (!selectedCourse && teacherCourses.length > 0) {
      setSelectedCourse(teacherCourses[0]);
    }
  }, [teacherCourses, selectedCourse]);

  const resultsBySelectedCourse = useMemo(() => {
    if (!selectedCourse) return [];
    return sortedResults.filter(
      (row) => String(row?.course || "").trim().toLowerCase() === selectedCourse,
    );
  }, [sortedResults, selectedCourse]);

  const filteredResults = useMemo(() => {
    const query = searchName.trim().toLowerCase();
    if (!query) return resultsBySelectedCourse;

    return resultsBySelectedCourse.filter((row) => {
      const fullName = String(
        row.fullName || `${row.firstName || ""} ${row.fatherName || ""}`.trim(),
      )
        .trim()
        .toLowerCase();
      return fullName.includes(query);
    });
  }, [resultsBySelectedCourse, searchName]);

  const assessmentKeys = useMemo(() => {
    const keys = new Set();
    resultsBySelectedCourse.forEach((row) => {
      Object.keys(row?.assessments || {}).forEach((key) => keys.add(key));
    });
    return Array.from(keys).sort((a, b) => a.localeCompare(b));
  }, [resultsBySelectedCourse]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const session = readTeacherSession();
        const token = session?.token || "";

        const response = await fetch(getCourseResultsEndpoint(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const rawText = await response.text();
        const payload = rawText ? JSON.parse(rawText) : null;

        if (!response.ok) {
          throw new Error(payload?.message || "Unable to load course results.");
        }

        const nextResults = Array.isArray(payload?.results) ? payload.results : [];
        if (!cancelled) setResults(nextResults);
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

  function startEdit(row) {
    setEditingId(row.id);
    setEditTotal(row.total ?? "");
    setEditGrade(row.grade ?? "");
    setEditAssessments({ ...(row.assessments || {}) });
    setSaveStatus("idle");
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTotal("");
    setEditGrade("");
    setEditAssessments({});
    setSaveStatus("idle");
  }

  async function saveEdit(resultId) {
    setSaveStatus("saving");
    setError("");

    try {
      const session = readTeacherSession();
      const token = session?.token || "";
      const normalizedAssessments = Object.entries(editAssessments || {}).reduce(
        (current, [key, value]) => {
          if (value === "" || value === null || value === undefined) {
            return current;
          }

          const numericValue =
            typeof value === "number" ? value : Number(String(value).trim());
          if (!Number.isFinite(numericValue)) {
            throw new Error(`Assessment "${key}" must be numeric.`);
          }

          current[key] = numericValue;
          return current;
        },
        {},
      );

      const response = await fetch(getPatchResultEndpoint(resultId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          total: editTotal,
          grade: editGrade,
          assessments: normalizedAssessments,
        }),
      });

      const rawText = await response.text();
      const payload = rawText ? JSON.parse(rawText) : null;

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to update result.");
      }

      const updated = payload?.result;
      if (!updated) {
        throw new Error("The update service returned an invalid response.");
      }

      setResults((current) =>
        Array.isArray(current)
          ? current.map((row) => (row.id === updated.id ? updated : row))
          : current,
      );
      setSaveStatus("saved");
      cancelEdit();
    } catch (err) {
      setSaveStatus("error");
      setError(err?.message || "Unable to update result.");
    }
  }

  function handleAssessmentChange(key, value) {
    setEditAssessments((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-50 mb-2 flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-emerald-300" />
          My course
        </h1>
        <p className="text-slate-300">
          Showing results for your assigned courses
          {teacherCourses.length > 0 ? ` (${teacherCourses.join(", ")})` : ""}.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm leading-6 text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/8 bg-white/5 p-6">
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.12em] text-slate-400 mb-2">
              Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full max-w-sm rounded-md border border-white/12 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400/60"
              disabled={teacherCourses.length === 0}
            >
              {teacherCourses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.12em] text-slate-400 mb-2">
              Search by student name
            </label>
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="e.g. Ephrem Babu"
                className="w-full rounded-md border border-white/12 bg-slate-950/70 px-3 py-2 pr-9 text-sm text-slate-100 outline-none focus:border-emerald-400/60"
              />
              <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="text-slate-400">Loading...</p>
        ) : teacherCourses.length === 0 ? (
          <p className="text-slate-300">
            No courses assigned to this teacher account yet.
          </p>
        ) : !selectedCourse ? (
          <p className="text-slate-300">Select a course to view results.</p>
        ) : filteredResults.length === 0 ? (
          <p className="text-slate-300">
            No students matched your search.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/8">
            <table className="min-w-full divide-y divide-white/8 text-left text-xs">
              <thead className="bg-white/6">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-slate-200">
                    Student ID
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-slate-200">
                    Name
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-slate-200">
                    Year
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-slate-200">
                    Sex
                  </th>
                  {assessmentKeys.map((key) => (
                    <th
                      className="whitespace-nowrap px-3 py-2 font-medium text-slate-200"
                      key={key}
                    >
                      {key}
                    </th>
                  ))}
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-slate-200">
                    Total
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-slate-200">
                    Grade
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-slate-200">
                    Updated
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-slate-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6 bg-slate-950/40">
                {filteredResults.map((row) => {
                  const isEditing = editingId === row.id;
                  const updatedAt = row.updatedAt
                    ? new Date(row.updatedAt).toLocaleString()
                    : "-";

                  return (
                    <tr key={row.id}>
                      <td className="whitespace-nowrap px-3 py-1.5 text-slate-200">
                        {row.studentId}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1.5 text-slate-200">
                        {row.fullName || `${row.firstName || ""} ${row.fatherName || ""}`.trim() || "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1.5 text-slate-300">
                        {row.year}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1.5 text-slate-300">
                        {row.sex || "-"}
                      </td>
                      {assessmentKeys.map((key) => (
                        <td className="whitespace-nowrap px-3 py-1.5 text-slate-200" key={`${row.id}-${key}`}>
                          {isEditing ? (
                            <input
                              className="w-16 rounded-md border border-white/12 bg-slate-950/70 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-400/60"
                              value={editAssessments?.[key] ?? ""}
                              onChange={(e) => handleAssessmentChange(key, e.target.value)}
                            />
                          ) : (
                            (row.assessments && row.assessments[key]) ?? "-"
                          )}
                        </td>
                      ))}
                      <td className="whitespace-nowrap px-3 py-1.5 text-slate-200">
                        {isEditing ? (
                          <input
                            className="w-20 rounded-md border border-white/12 bg-slate-950/70 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-400/60"
                            value={editTotal}
                            onChange={(e) => setEditTotal(e.target.value)}
                          />
                        ) : (
                          row.total
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1.5 text-slate-200">
                        {isEditing ? (
                          <input
                            className="w-16 rounded-md border border-white/12 bg-slate-950/70 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-400/60"
                            value={editGrade}
                            onChange={(e) => setEditGrade(e.target.value)}
                            placeholder="auto"
                          />
                        ) : (
                          row.grade || "-"
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1.5 text-slate-400">
                        {updatedAt}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1.5">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <button
                              className="inline-flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-100 hover:bg-emerald-400/15 disabled:opacity-50"
                              type="button"
                              disabled={saveStatus === "saving"}
                              onClick={() => saveEdit(row.id)}
                              title="Save"
                            >
                              <Save className="h-4 w-4" />
                              Save
                            </button>
                            <button
                              className="inline-flex items-center gap-1 rounded-md border border-white/12 bg-white/6 px-2 py-1 text-xs font-semibold text-slate-100 hover:bg-white/10"
                              type="button"
                              onClick={cancelEdit}
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="inline-flex items-center gap-1 rounded-md border border-white/12 bg-white/6 px-2 py-1 text-xs font-semibold text-slate-100 hover:bg-white/10"
                            type="button"
                            onClick={() => startEdit(row)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCourse;
