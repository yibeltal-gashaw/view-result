import { useEffect, useState } from "react";
import "./App.css";
import male from "./assets/male.png";
import female from "./assets/female.png";

const TELEGRAM = window.Telegram?.WebApp;
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";
const defaultCourseOptions = ["Fundamentals of Software Security"];
const courseOptions = [
  ...new Set(
    (import.meta.env.VITE_COURSE_OPTIONS || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  ),
];

if (courseOptions.length === 0) {
  courseOptions.push(...defaultCourseOptions);
}

const scoreItems = [
  { key: "midExam", label: "Mid Exam" },
  { key: "quiz", label: "Quiz" },
  { key: "lab", label: "Lab" },
  { key: "project", label: "Project" },
  { key: "finalExam", label: "Final Exam" },
];

function getStudentIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("studentId") || "").trim().toUpperCase();
}

function getCourseFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const requestedCourse = (params.get("course") || "").trim();

  return courseOptions.includes(requestedCourse)
    ? requestedCourse
    : courseOptions[0];
}

function normalizeStudentId(value) {
  return value.trim().toUpperCase();
}

function getResultEndpoint(studentId, course) {
  const endpoint = new URL(
    `${API_BASE_URL}/api/results/${encodeURIComponent(studentId)}`,
    window.location.origin,
  );

  if (course) {
    endpoint.searchParams.set("course", course);
  }

  const queryString = endpoint.searchParams.toString();
  const basePath = API_BASE_URL
    ? `${API_BASE_URL}/api/results/${encodeURIComponent(studentId)}`
    : endpoint.pathname;

  return queryString ? `${basePath}?${queryString}` : basePath;
}

async function readApiResponse(response) {
  const rawText = await response.text();
  const contentType = response.headers.get("content-type") || "";
  const looksLikeJson =
    contentType.includes("application/json") ||
    rawText.trim().startsWith("{") ||
    rawText.trim().startsWith("[");

  let data = null;

  if (looksLikeJson && rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || "Unable to load result.");
  }

  if (!data) {
    throw new Error(
      API_BASE_URL
        ? "The result service returned an invalid response."
        : "The mini app is not connected to the backend. Set VITE_API_BASE_URL to your API server.",
    );
  }

  return data;
}

function App() {
  const [studentId, setStudentId] = useState(() => getStudentIdFromQuery());
  const [inputValue, setInputValue] = useState(() => getStudentIdFromQuery());
  const [selectedCourse, setSelectedCourse] = useState(() => getCourseFromQuery());
  const [submittedCourse, setSubmittedCourse] = useState(() => getCourseFromQuery());
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(studentId ? "loading" : "idle");
  const [error, setError] = useState("");

  const avatarSrc =
    result?.sex === "M" || result?.sex === "MALE" || result?.avatar === "male"
      ? male
      : female;

  useEffect(() => {
    if (!TELEGRAM) {
      return;
    }

    TELEGRAM.ready();
    TELEGRAM.expand();
    TELEGRAM.setHeaderColor("#0f172a");
    TELEGRAM.setBackgroundColor("#07111f");
  }, []);

  useEffect(() => {
    if (!studentId || !submittedCourse) {
      setStatus("idle");
      return;
    }

    let cancelled = false;

    async function loadResult() {
      setStatus("loading");
      setError("");
      setResult(null);

      try {
        const response = await fetch(getResultEndpoint(studentId, submittedCourse));
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
  }, [studentId, submittedCourse]);

  function handleSubmit(event) {
    event.preventDefault();

    const normalizedId = normalizeStudentId(inputValue);

    if (normalizedId.length < 5) {
      setResult(null);
      setError("Please enter a valid Student ID.");
      setStatus("error");
      return;
    }

    if (!selectedCourse) {
      setResult(null);
      setError("Please select a course.");
      setStatus("error");
      return;
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("studentId", normalizedId);
    nextUrl.searchParams.set("course", selectedCourse);
    window.history.replaceState({}, "", nextUrl);

    setStudentId(normalizedId);
    setSubmittedCourse(selectedCourse);
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Exam Result Portal</p>
          <p className="hero-text">
            Clean, quick, and mobile friendly access to your latest exam result.
          </p>
        </div>
        <div className="hero-badge">
          <span className="badge-label">Status</span>
          <strong className={`badge-pill badge-${status}`}>
            {status === "loading" && "Loading"}
            {status === "success" && "Ready"}
            {status === "error" && "Issue"}
            {status === "idle" && "Waiting"}
          </strong>
        </div>
      </section>

      <section className="panel search-panel">
        <div className="search-copy">
          <p className="section-label">Search Result</p>
          <h2>Enter your ID</h2>
        </div>

        <form className="search-form" onSubmit={handleSubmit}>
          <label className="search-label" htmlFor="course-select">
            Course
          </label>
          <select
            id="course-select"
            className="search-input"
            value={selectedCourse}
            onChange={(event) => setSelectedCourse(event.target.value)}
          >
            {courseOptions.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>

          <label className="search-label" htmlFor="student-id">
            Student ID
          </label>
          <div className="search-input-group">
            <input
              id="student-id"
              className="search-input"
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck="false"
              placeholder="MAU1602154"
              value={inputValue}
              onChange={(event) =>
                setInputValue(normalizeStudentId(event.target.value))
              }
            />
            <button className="search-button" type="submit">
              View Result
            </button>
          </div>
        </form>
      </section>

      {status === "idle" && (
        <section className="panel empty-state">
          <h2>No student selected</h2>
          <p>Enter your Student ID above to load your result.</p>
        </section>
      )}

      {status === "loading" && (
        <section className="panel state-panel">
          <div className="loader" aria-hidden="true" />
          <h2>Fetching your result</h2>
          <p>We are preparing your result slip now.</p>
        </section>
      )}

      {status === "error" && (
        <section className="panel state-panel error-panel">
          <h2>Unable to load result</h2>
          <p>{error}</p>
        </section>
      )}

      {status === "success" && result && (
        <>
          <section className="panel profile-panel">
            <div className="profile-header">
              <div className="avatar-wrap">
                <img
                  className="avatar-image"
                  src={avatarSrc}
                  alt={`${result.fullName} avatar`}
                />
              </div>
            </div>
            <div>
              <p className="section-label">Student</p>
              <h2>{result.fullName}</h2>
              <p className="muted-text">{result.course || submittedCourse}</p>
            </div>
            <div className="profile-meta">
              <div className="meta-chip">
                <span>ID</span>
                <strong>{result.studentId}</strong>
              </div>
              <div className="meta-chip">
                <span>Grade</span>
                <strong>{result.grade}</strong>
              </div>
              <div className="meta-chip highlight-chip">
                <span>Total</span>
                <strong>{result.total}</strong>
              </div>
            </div>
          </section>

          <section className="grid-layout">
            <article className="panel breakdown-panel">
              <p className="section-label">Assessment Breakdown</p>
              <div className="score-list">
                {scoreItems.map((item) => (
                  <div className="score-row" key={item.key}>
                    <span>{item.label}</span>
                    <strong>{result.breakdown[item.key]}</strong>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </>
      )}
    </main>
  );
}

export default App;
