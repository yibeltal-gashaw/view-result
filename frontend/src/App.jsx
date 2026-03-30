import { useEffect, useState } from "react";
import "./App.css";
import male from "./assets/male.png";
import female from "./assets/female.png";
import ResultSearchForm from "./components/ResultSearchForm";
import {
  getCourseLabel,
  getYearLabel,
  scoreItems,
} from "./config/resultOptions";
import { getResultEndpoint, readApiResponse } from "./lib/resultApi";
import {
  getCourseFromQuery,
  getStudentIdFromQuery,
  getYearFromQuery,
  normalizeStudentId,
  updateSearchParams,
} from "./lib/resultQuery";

const TELEGRAM = window.Telegram?.WebApp;

function App() {
  const [studentId, setStudentId] = useState(() => getStudentIdFromQuery());
  const [inputValue, setInputValue] = useState(() => getStudentIdFromQuery());
  const [selectedYear, setSelectedYear] = useState(() => getYearFromQuery());
  const [submittedYear, setSubmittedYear] = useState(() => getYearFromQuery());
  const [selectedCourse, setSelectedCourse] = useState(() =>
    getCourseFromQuery(),
  );
  const [submittedCourse, setSubmittedCourse] = useState(() =>
    getCourseFromQuery(),
  );
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
    if (!studentId || !submittedYear || !submittedCourse) {
      setStatus("idle");
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
              "ngrok-skip-browser-warning": "true",
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
        </div>

        <ResultSearchForm
          inputValue={inputValue}
          selectedCourse={selectedCourse}
          selectedYear={selectedYear}
          onInputChange={(value) => setInputValue(normalizeStudentId(value))}
          onCourseChange={setSelectedCourse}
          onSubmit={handleSubmit}
          onYearChange={setSelectedYear}
        />
      </section>

      {status === "idle" && (
        <section className="panel empty-state">
          <h2>No student selected</h2>
          <p>
            Choose your year, select your course, and enter your Student ID to
            load your result.
          </p>
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
              <p className="muted-text">
                {result.course || getCourseLabel(submittedCourse)}
                {submittedYear
                  ? ` | ${result.year || getYearLabel(submittedYear)}`
                  : ""}
              </p>
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
