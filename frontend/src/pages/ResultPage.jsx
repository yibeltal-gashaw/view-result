import { useEffect, useState } from "react";
import male from "../assets/male.png";
import female from "../assets/female.png";
import ResultSearchForm from "../components/ResultSearchForm";
import {
  courseOptions as fallbackCourseOptions,
  getCourseLabel,
  getYearLabel,
  scoreItems,
} from "../config/resultOptions";
import {
  fetchCourses,
  getResultEndpoint,
  readApiResponse,
} from "../lib/resultApi";
import {
  getStudentIdFromQuery,
  getYearFromQuery,
  normalizeStudentId,
  updateSearchParams,
} from "../lib/resultQuery";

function ResultPage() {
  const [availableCourses, setAvailableCourses] = useState(fallbackCourseOptions);
  const [studentId, setStudentId] = useState(() => getStudentIdFromQuery());
  const [inputValue, setInputValue] = useState(() => getStudentIdFromQuery());
  const [selectedYear, setSelectedYear] = useState(() => getYearFromQuery());
  const [submittedYear, setSubmittedYear] = useState(() => getYearFromQuery());
  const [selectedCourse, setSelectedCourse] = useState(() =>
    getInitialCourse(fallbackCourseOptions),
  );
  const [submittedCourse, setSubmittedCourse] = useState(() =>
    getInitialCourse(fallbackCourseOptions),
  );
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(
    studentId && getYearFromQuery() && getInitialCourse(fallbackCourseOptions)
      ? "loading"
      : "idle",
  );
  const [error, setError] = useState("");
  const displayStatus =
    !studentId || !submittedYear || !submittedCourse ? "idle" : status;

  const avatarSrc =
    result?.sex === "M" || result?.sex === "MALE" || result?.avatar === "male"
      ? male
      : female;
  const assessmentItems = result?.assessmentItems?.length
    ? result.assessmentItems
    : scoreItems.map((item) => ({
        ...item,
        value: result?.breakdown?.[item.key],
      }));

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      try {
        const courses = await fetchCourses();

        if (cancelled || courses.length === 0) {
          return;
        }

        const requestedCourse = getInitialCourse(courses);

        setAvailableCourses(courses);
        setSelectedCourse((currentValue) =>
          hasCourseOption(courses, currentValue) ? currentValue : requestedCourse,
        );
        setSubmittedCourse((currentValue) =>
          hasCourseOption(courses, currentValue) ? currentValue : requestedCourse,
        );
      } catch (loadError) {
        if (!cancelled) {
          setAvailableCourses(fallbackCourseOptions);
        }
      }
    }

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!studentId || !submittedYear || !submittedCourse) {
      return;
    }

    let cancelled = false;

    async function loadResult() {
      setStatus("loading");
      setError("");
      setResult(null);

      try {
        const response = await fetch(
          getResultEndpoint(studentId, submittedYear, submittedCourse),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        const data = await readApiResponse(response);

        if (cancelled) {
          return;
        }

        setResult(data);
        setStatus("success");
      } catch (fetchError) {
        if (cancelled) {
          return;
        }
        setError(fetchError.message || "Unable to load result.");
        setStatus("error");
      }
    }

    loadResult();

    return () => {
      cancelled = true;
    };
  }, [studentId, submittedYear, submittedCourse]);

  function handleSubmit(event) {
    event.preventDefault();

    const normalizedId = normalizeStudentId(inputValue);

    if (normalizedId.length < 5) {
      setResult(null);
      setError("Please enter a valid Student ID.");
      setStatus("error");
      return;
    }

    if (!selectedYear) {
      setResult(null);
      setError("Please select your year.");
      setStatus("error");
      return;
    }

    if (!selectedCourse) {
      setResult(null);
      setError("Please select a course.");
      setStatus("error");
      return;
    }

    updateSearchParams({
      studentId: normalizedId,
      year: selectedYear,
      course: selectedCourse,
    });

    setStudentId(normalizedId);
    setSubmittedYear(selectedYear);
    setSubmittedCourse(selectedCourse);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.14),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.2),transparent_30%),linear-gradient(135deg,#120f0d_0%,#1f1b18_45%,#111827_100%)] px-4 py-7 text-slate-50">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02),rgba(255,255,255,0.02)),radial-gradient(circle_at_center,transparent_0_62%,rgba(0,0,0,0.16)_100%)] opacity-85" />
      <div className="relative mx-auto w-full max-w-270">
        <section className="mb-5 grid gap-6 rounded-[28px] border border-amber-50/10 bg-slate-950/45 p-6 shadow-[0_28px_90px_rgba(3,7,18,0.38)] backdrop-blur-[18px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="grid content-start gap-3">
            <p className="text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">
              Result Search
            </p>
            <h2 className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] leading-none text-slate-50">
              Open your academic snapshot
            </h2>
            <p className="leading-7 text-slate-300">
              Enter the same student ID used in school records, then choose your
              current year and course.
            </p>
          </div>

          <ResultSearchForm
            courseOptions={availableCourses}
            inputValue={inputValue}
            selectedCourse={selectedCourse}
            selectedYear={selectedYear}
            onInputChange={(value) => setInputValue(normalizeStudentId(value))}
            onCourseChange={setSelectedCourse}
            onSubmit={handleSubmit}
            onYearChange={setSelectedYear}
          />
        </section>

        {displayStatus === "loading" && (
          <section className="rounded-[28px] border border-amber-50/10 bg-slate-950/45 p-6 text-center shadow-[0_28px_90px_rgba(3,7,18,0.38)] backdrop-blur-[18px]">
            <div
              className="mx-auto mb-4.5 h-13 w-13 animate-spin rounded-full border-4 border-white/15 border-t-sky-400"
              aria-hidden="true"
            />
            <h2 className="font-serif text-[clamp(1.8rem,3vw,2.3rem)] leading-[1.04] text-slate-50">
              Fetching your result
            </h2>
            <p className="mt-2 leading-7 text-slate-300">
              We are preparing your result slip now.
            </p>
          </section>
        )}

        {displayStatus === "error" && (
          <section className="rounded-[28px] border border-rose-400/35 bg-slate-950/45 p-6 text-center shadow-[0_28px_90px_rgba(3,7,18,0.38)] backdrop-blur-[18px]">
            <h2 className="font-serif text-[clamp(1.8rem,3vw,2.3rem)] leading-[1.04] text-slate-50">
              Unable to load result
            </h2>
            <p className="mt-2 leading-7 text-slate-300">{error}</p>
          </section>
        )}

        {displayStatus === "success" && result && (
          <>
            <section className="mb-5 grid gap-5 rounded-[28px] border border-amber-50/10 bg-slate-950/45 p-6 shadow-[0_28px_90px_rgba(3,7,18,0.38)] backdrop-blur-[18px]">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="h-39 w-39 rounded-full bg-linear-to-br from-amber-400/45 to-sky-400/45 p-1.25">
                  <img
                    className="block h-full w-full rounded-full bg-slate-900/90 object-cover"
                    src={avatarSrc}
                    alt={`${result.fullName} avatar`}
                  />
                </div>
              </div>
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">
                  Student
                </p>
                <h2 className="mt-2 font-serif text-[clamp(1.8rem,3vw,2.3rem)] leading-[1.04] text-slate-50">
                  {result.fullName}
                </h2>
                <p className="mt-2 leading-7 text-slate-300">
                  {result.course || getCourseLabel(submittedCourse)}
                  {submittedYear
                    ? ` | ${result.year || getYearLabel(submittedYear)}`
                    : ""}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-[20px] border border-white/6 bg-white/5 p-4">
                  <span className="mb-2 block text-[0.8rem] text-slate-400">
                    ID
                  </span>
                  <strong className="text-base text-slate-50">
                    {result.studentId}
                  </strong>
                </div>
                <div className="rounded-[20px] border border-white/6 bg-white/5 p-4">
                  <span className="mb-2 block text-[0.8rem] text-slate-400">
                    Grade
                  </span>
                  <strong className="text-base text-slate-50">
                    {result.grade}
                  </strong>
                </div>
                <div className="rounded-[20px] border border-white/6 bg-linear-to-br from-amber-400/20 to-sky-400/15 p-4">
                  <span className="mb-2 block text-[0.8rem] text-slate-400">
                    Total
                  </span>
                  <strong className="text-base text-slate-50">
                    {result.total}
                  </strong>
                </div>
              </div>
            </section>

            <section className="grid gap-5">
              <article className="rounded-[28px] border border-amber-50/10 bg-slate-950/45 p-6 shadow-[0_28px_90px_rgba(3,7,18,0.38)] backdrop-blur-[18px]">
                <p className="text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">
                  Assessment Breakdown
                </p>
                <div className="mt-4.5 grid gap-3">
                  {assessmentItems.map((item) => (
                    <div
                      className="flex items-center justify-between gap-4 rounded-[18px] border border-white/6 bg-white/5 px-4.5 py-3.75"
                      key={item.key}
                    >
                      <span className="text-slate-300">{item.label}</span>
                      <strong className="text-base text-amber-50">
                        {item.value ?? "-"}
                      </strong>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function getInitialCourse(courseOptions) {
  const params = new URLSearchParams(window.location.search);
  const requestedCourse = (params.get("course") || "").trim().toLowerCase();

  if (requestedCourse && hasCourseOption(courseOptions, requestedCourse)) {
    return requestedCourse;
  }

  return courseOptions[0]?.value || "";
}

function hasCourseOption(courseOptions, courseCode) {
  return courseOptions.some((course) => course.value === courseCode);
}

export default ResultPage;
