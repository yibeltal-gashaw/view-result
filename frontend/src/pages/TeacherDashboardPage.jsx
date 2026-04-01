import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { uploadTeacherResults } from "../lib/teacherUploadApi";

const SAMPLE_HEADERS = [
  "Student ID",
  "First Name",
  "Father Name",
  "Sex",
  "year",
  "course",
  "mid exam",
  "quiz",
  "lab",
  "project",
  "final exam",
  "total",
  "grade",
];

const SAMPLE_ROW = [
  "MAU1602154",
  "Abel",
  "Kebede",
  "M",
  "3",
  "fss",
  "18",
  "9",
  "14",
  "16",
  "38",
  "95",
  "A",
];

const REQUIRED_HEADERS = ["Student ID", "total"];
const RESERVED_HEADERS = new Set([
  "Student ID",
  "First Name",
  "Father Name",
  "Sex",
  "year",
  "Year",
  "course",
  "Course",
  "total",
  "grade",
]);

function TeacherDashboardPage() {
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [teacherToken, setTeacherToken] = useState("");
  const [defaultCourse, setDefaultCourse] = useState("");
  const [defaultYear, setDefaultYear] = useState("");
  const [error, setError] = useState("");
  const [uploadErrors, setUploadErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadStatus, setUploadStatus] = useState("idle");

  const previewRows = useMemo(() => rows.slice(0, 8), [rows]);
  const missingHeaders = useMemo(
    () => REQUIRED_HEADERS.filter((header) => !headers.includes(header)),
    [headers],
  );
  const assessmentHeaders = useMemo(
    () => headers.filter((header) => !RESERVED_HEADERS.has(header)),
    [headers],
  );
  const resolvedCourse = useMemo(
    () => String(defaultCourse || inferSharedValue(rows, ["course", "Course"])).trim().toLowerCase(),
    [defaultCourse, rows],
  );
  const resolvedYear = useMemo(
    () => String(defaultYear || inferSharedValue(rows, ["year", "Year"])).trim(),
    [defaultYear, rows],
  );
  const payloadPreview = useMemo(
    () =>
      buildUploadPayload({
        rows,
        course: resolvedCourse,
        year: resolvedYear,
      }),
    [rows, resolvedCourse, resolvedYear],
  );
  const canValidate = rows.length > 0;
  const canUpload =
    canValidate &&
    missingHeaders.length === 0 &&
    assessmentHeaders.length > 0 &&
    Boolean(resolvedCourse) &&
    Boolean(resolvedYear) &&
    Boolean(teacherToken.trim());

  async function handleFileChange(event) {
    const [file] = Array.from(event.target.files || []);

    if (!file) {
      return;
    }

    setUploadStatus("reading");
    setError("");
    setUploadErrors([]);
    setSuccessMessage("");
    setFileName(file.name);

    try {
      const text = await file.text();
      const { parsedHeaders, parsedRows } = parseCsv(text);

      if (!parsedHeaders.length) {
        throw new Error("The CSV file is empty or missing a header row.");
      }

      setHeaders(parsedHeaders);
      setRows(parsedRows);
      setDefaultCourse(inferSharedValue(parsedRows, ["course", "Course"]));
      setDefaultYear(inferSharedValue(parsedRows, ["year", "Year"]));
      setUploadStatus("ready");
    } catch (uploadError) {
      setHeaders([]);
      setRows([]);
      setDefaultCourse("");
      setDefaultYear("");
      setUploadStatus("error");
      setError(uploadError.message || "Unable to read the CSV file.");
      setUploadErrors([]);
    }
  }

  function handleProcessUpload() {
    if (!rows.length) {
      setUploadStatus("error");
      setError("Upload a CSV file before processing.");
      setUploadErrors([]);
      return false;
    }

    if (missingHeaders.length > 0) {
      setUploadStatus("error");
      setError(`Missing required columns: ${missingHeaders.join(", ")}`);
      setUploadErrors([]);
      return false;
    }

    if (!resolvedCourse) {
      setUploadStatus("error");
      setError("Add a course column or enter a default course before upload.");
      setUploadErrors([]);
      return false;
    }

    if (!resolvedYear) {
      setUploadStatus("error");
      setError("Add a year column or enter a default year before upload.");
      setUploadErrors([]);
      return false;
    }

    if (assessmentHeaders.length === 0) {
      setUploadStatus("error");
      setError("Add at least one assessment column in the CSV.");
      setUploadErrors([]);
      return false;
    }

    setUploadStatus("processed");
    setError("");
    setUploadErrors([]);
    setSuccessMessage("");
    return true;
  }

  async function handleUpload() {
    const isValid = handleProcessUpload();

    if (!isValid) {
      return;
    }

    if (!teacherToken.trim()) {
      setUploadStatus("error");
      setError("Enter the teacher token before uploading.");
      setUploadErrors([]);
      return;
    }

    setUploadStatus("uploading");
    setError("");
    setUploadErrors([]);
    setSuccessMessage("");

    try {
      const result = await uploadTeacherResults({
        token: teacherToken.trim(),
        payload: payloadPreview,
      });

      setUploadStatus("uploaded");
      setSuccessMessage(buildSuccessMessage(result));
    } catch (uploadError) {
      setUploadStatus("error");
      if (Array.isArray(uploadError?.errors)) {
        uploadError.errors.forEach((err) => {
          console.error("Upload error detail:", err);
        });
      }
      setError(uploadError.message || "Unable to upload course results.");
      setUploadErrors(Array.isArray(uploadError?.errors) ? uploadError.errors : []);
    }
  }

  function handleDownloadTemplate() {
    const csvContent = [SAMPLE_HEADERS, SAMPLE_ROW]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "teacher-result-upload-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.14),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.2),transparent_30%),linear-gradient(135deg,#120f0d_0%,#1f1b18_45%,#111827_100%)] px-4 py-7 text-slate-50">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02),rgba(255,255,255,0.02)),radial-gradient(circle_at_center,transparent_0_62%,rgba(0,0,0,0.16)_100%)] opacity-85" />
      <div className="relative mx-auto w-full max-w-7xl">
        <section className="mb-5 grid gap-5 rounded-4xl border border-amber-50/10 bg-slate-950/45 p-7 shadow-[0_28px_90px_rgba(3,7,18,0.38)] backdrop-blur-[18px] lg:grid-cols-[minmax(0,1.1fr)_auto] lg:items-center">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">
              Teachers Dashboard
            </p>
            <h1 className="mt-3 max-w-[14ch] font-serif text-[clamp(2.4rem,5vw,4rem)] leading-[0.96] tracking-[-0.04em] text-slate-50">
              Upload different course results with different assessments.
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
              Drop in a course CSV, inspect the detected assessment headers, and
              send the parsed batch to the backend as JSON without reshaping it by hand.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="min-h-12 rounded-full bg-linear-to-r from-amber-300 via-amber-500 to-orange-500 px-5 font-bold text-stone-950 shadow-[0_18px_38px_rgba(245,158,11,0.24)] transition duration-200 ease-out hover:-translate-y-px hover:brightness-105 hover:shadow-[0_22px_42px_rgba(245,158,11,0.3)]"
              type="button"
              onClick={handleDownloadTemplate}
            >
              Download Sample CSV
            </button>
            <Link
              className="min-h-12 rounded-full border border-white/12 bg-white/6 px-5 py-3 font-semibold text-slate-100 transition duration-200 ease-out hover:-translate-y-px hover:border-sky-400/45 hover:bg-sky-400/10"
              to="/teachers/login"
            >
              Back to Login
            </Link>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
          <article className="rounded-[28px] border border-amber-50/10 bg-slate-950/50 p-6 shadow-[0_28px_90px_rgba(3,7,18,0.38)] backdrop-blur-[18px]">
            <p className="text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">
              Upload Center
            </p>
            <h2 className="mt-2 font-serif text-3xl text-slate-50">
              Add Results File
            </h2>
            <p className="mt-3 leading-7 text-slate-300">
              The page reads the CSV first, preserves the original headers, and
              sends <code className="rounded bg-white/8 px-1.5 py-0.5 text-slate-100">{"{ course, year, rows }"}</code> as JSON to the backend.
            </p>

            <label className="mt-6 block cursor-pointer rounded-[28px] border border-dashed border-sky-400/35 bg-sky-400/8 p-7 text-center transition hover:border-sky-300/50 hover:bg-sky-400/12">
              <span className="block text-sm uppercase tracking-[0.16em] text-sky-200">
                Choose CSV File
              </span>
              <strong className="mt-3 block text-xl text-slate-50">
                Drag and drop or browse from your device
              </strong>
              <span className="mt-2 block text-sm text-slate-300">
                Supported format: `.csv`
              </span>
              <input
                accept=".csv,text/csv"
                className="hidden"
                type="file"
                onChange={handleFileChange}
              />
            </label>

            <div className="mt-6 grid gap-3">
              <label className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                <span className="text-sm text-slate-400">Teacher token</span>
                <input
                  className="mt-2 block w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-base text-slate-50 outline-none transition focus:border-sky-400/45"
                  type="password"
                  value={teacherToken}
                  onChange={(event) => setTeacherToken(event.target.value)}
                  placeholder="Enter x-teacher-token"
                />
              </label>

              <div className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                <span className="text-sm text-slate-400">Current file</span>
                <strong className="mt-2 block text-base text-slate-50">
                  {fileName || "No file selected yet"}
                </strong>
              </div>

              <div className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                <span className="text-sm text-slate-400">Upload status</span>
                <strong className="mt-2 block text-base text-slate-50">
                  {uploadStatus === "idle" && "Waiting for file"}
                  {uploadStatus === "reading" && "Reading CSV"}
                  {uploadStatus === "ready" && "Preview ready"}
                  {uploadStatus === "processed" && "JSON payload ready"}
                  {uploadStatus === "uploading" && "Sending to backend"}
                  {uploadStatus === "uploaded" && "Upload complete"}
                  {uploadStatus === "error" && "Needs attention"}
                </strong>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                <span className="text-sm text-slate-400">Default course</span>
                <input
                  className="mt-2 block w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-base text-slate-50 outline-none transition focus:border-sky-400/45"
                  type="text"
                  value={defaultCourse}
                  onChange={(event) => setDefaultCourse(event.target.value)}
                  placeholder="fss"
                />
              </label>

              <label className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                <span className="text-sm text-slate-400">Default year</span>
                <input
                  className="mt-2 block w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-base text-slate-50 outline-none transition focus:border-sky-400/45"
                  type="number"
                  min="1"
                  value={defaultYear}
                  onChange={(event) => setDefaultYear(event.target.value)}
                  placeholder="3"
                />
              </label>
            </div>

            {error ? (
              <div className="mt-5 rounded-[22px] border border-rose-400/30 bg-rose-400/10 p-4 text-sm leading-6 text-rose-100">
                {error}
              </div>
            ) : null}

            {uploadErrors.length > 0 ? (
              <div className="mt-5 rounded-[22px] border border-rose-400/30 bg-rose-400/10 p-4">
                <p className="text-sm font-semibold text-rose-100">
                  Upload validation details
                </p>
                <div className="mt-3 space-y-2 text-sm leading-6 text-rose-50">
                  {uploadErrors.map((item, index) => (
                    <div
                      className="rounded-2xl border border-rose-300/15 bg-black/10 px-3 py-2"
                      key={`${item.row || "row"}-${index}`}
                    >
                      Row {item.row || "?"}: {item.message || "Invalid row"}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {successMessage ? (
              <div className="mt-5 rounded-[22px] border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-100">
                {successMessage}
              </div>
            ) : null}

            {missingHeaders.length > 0 && headers.length > 0 ? (
              <div className="mt-5 rounded-[22px] border border-amber-400/25 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
                Missing required columns: {missingHeaders.join(", ")}
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                className="min-h-14 w-full rounded-[18px] border border-white/10 bg-white/6 px-6 font-semibold text-slate-100 transition duration-200 ease-out hover:-translate-y-px hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                disabled={!canValidate}
                onClick={handleProcessUpload}
              >
                Validate Batch
              </button>
              <button
                className="min-h-14 w-full rounded-[18px] bg-linear-to-r from-emerald-300 via-emerald-400 to-sky-400 px-6 font-bold text-slate-950 shadow-[0_18px_38px_rgba(52,211,153,0.2)] transition duration-200 ease-out hover:-translate-y-px hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                disabled={!canUpload || uploadStatus === "uploading"}
                onClick={handleUpload}
              >
                {uploadStatus === "uploading" ? "Uploading..." : "Upload to Backend"}
              </button>
            </div>
          </article>

          <div className="grid gap-5">
            <section className="grid gap-4 md:grid-cols-4">
              <StatCard label="Rows Parsed" value={rows.length} />
              <StatCard label="Columns Found" value={headers.length} />
              <StatCard label="Assessments" value={assessmentHeaders.length} />
              <StatCard
                label="Required Checks"
                value={missingHeaders.length === 0 && headers.length > 0 ? "Pass" : "Pending"}
              />
            </section>

            <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
              <article className="rounded-[28px] border border-amber-50/10 bg-slate-950/50 p-6 shadow-[0_28px_90px_rgba(3,7,18,0.38)] backdrop-blur-[18px]">
                <p className="text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">
                  Batch Context
                </p>
                <h2 className="mt-2 font-serif text-3xl text-slate-50">
                  Upload Summary
                </h2>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <InfoCard label="Resolved course" value={payloadPreview.course || "Not resolved yet"} />
                  <InfoCard label="Resolved year" value={payloadPreview.year || "Not resolved yet"} />
                  <InfoCard label="Profile fields" value="Student ID, names, sex" />
                  <InfoCard
                    label="Assessment mode"
                    value={
                      assessmentHeaders.length > 0
                        ? `${assessmentHeaders.length} dynamic columns`
                        : "Waiting for assessment headers"
                    }
                  />
                </div>
              </article>

              <article className="rounded-[28px] border border-amber-50/10 bg-slate-950/50 p-6 shadow-[0_28px_90px_rgba(3,7,18,0.38)] backdrop-blur-[18px]">
                <p className="text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">
                  Assessment Columns
                </p>
                <h2 className="mt-2 font-serif text-3xl text-slate-50">
                  Detected from CSV
                </h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {assessmentHeaders.length > 0 ? (
                    assessmentHeaders.map((header) => (
                      <span
                        className="rounded-full border border-sky-300/18 bg-sky-400/10 px-3 py-2 text-sm text-sky-100"
                        key={header}
                      >
                        {header}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm leading-6 text-slate-400">
                      Add numeric assessment columns such as `mid exam`, `assignment`,
                      `attendance`, `presentation`, or `final exam`.
                    </span>
                  )}
                </div>
              </article>
            </section>

            <section className="rounded-[28px] border border-amber-50/10 bg-slate-950/50 p-6 shadow-[0_28px_90px_rgba(3,7,18,0.38)] backdrop-blur-[18px]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">
                    CSV Preview
                  </p>
                  <h2 className="mt-2 font-serif text-3xl text-slate-50">
                    Parsed Results Table
                  </h2>
                </div>
                <span className="rounded-full bg-white/6 px-4 py-2 text-sm text-slate-300">
                  Showing {previewRows.length} of {rows.length} rows
                </span>
              </div>

              {headers.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/3 p-8 text-center text-slate-300">
                  Upload a CSV file to preview student results here.
                </div>
              ) : (
                <div className="mt-6 overflow-hidden rounded-3xl border border-white/8">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/8 text-left text-sm">
                      <thead className="bg-white/6">
                        <tr>
                          {headers.map((header) => (
                            <th
                              className="whitespace-nowrap px-4 py-3 font-medium text-slate-200"
                              key={header}
                              scope="col"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/6 bg-slate-950/50">
                        {previewRows.map((row, index) => (
                          <tr key={`${row["Student ID"] || "row"}-${index}`}>
                            {headers.map((header) => (
                              <td
                                className="whitespace-nowrap px-4 py-3 text-slate-300"
                                key={`${header}-${index}`}
                              >
                                {row[header] || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-[28px] border border-amber-50/10 bg-slate-950/50 p-6 shadow-[0_28px_90px_rgba(3,7,18,0.38)] backdrop-blur-[18px]">
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">
                JSON Preview
              </p>
              <h2 className="mt-2 font-serif text-3xl text-slate-50">
                Payload Sent to Backend
              </h2>
              <pre className="mt-6 overflow-x-auto rounded-3xl border border-white/8 bg-slate-950/80 p-5 text-sm leading-7 text-slate-200">
                <code>{JSON.stringify(buildPayloadPreview(payloadPreview), null, 2)}</code>
              </pre>
            </section>

            <section className="rounded-[28px] border border-amber-50/10 bg-slate-950/50 p-6 shadow-[0_28px_90px_rgba(3,7,18,0.38)] backdrop-blur-[18px]">
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">
                Expected Format
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {SAMPLE_HEADERS.map((header) => (
                  <span
                    className="rounded-full border border-white/8 bg-white/6 px-3 py-2 text-sm text-slate-200"
                    key={header}
                  >
                    {header}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="rounded-3xl border border-white/8 bg-slate-950/50 p-5 shadow-[0_28px_90px_rgba(3,7,18,0.25)] backdrop-blur-[18px]">
      <span className="text-sm text-slate-400">{label}</span>
      <strong className="mt-2 block text-3xl text-slate-50">{value}</strong>
    </article>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-white/5 p-4">
      <span className="text-sm text-slate-400">{label}</span>
      <strong className="mt-2 block text-base text-slate-50">{value}</strong>
    </div>
  );
}

function parseCsv(content) {
  const rows = [];
  let current = "";
  let currentRow = [];
  let insideQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (character === "," && !insideQuotes) {
      currentRow.push(current.trim());
      current = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      currentRow.push(current.trim());
      current = "";

      if (currentRow.some((cell) => cell !== "")) {
        rows.push(currentRow);
      }

      currentRow = [];
      continue;
    }

    current += character;
  }

  if (current.length > 0 || currentRow.length > 0) {
    currentRow.push(current.trim());
    if (currentRow.some((cell) => cell !== "")) {
      rows.push(currentRow);
    }
  }

  const [headerRow = [], ...dataRows] = rows;
  const parsedHeaders = headerRow.map((header) => header.trim()).filter(Boolean);
  const parsedRows = dataRows.map((row) =>
    parsedHeaders.reduce((result, header, index) => {
      result[header] = row[index]?.trim() || "";
      return result;
    }, {}),
  );

  return { parsedHeaders, parsedRows };
}

function escapeCsvValue(value) {
  const stringValue = String(value ?? "");

  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function inferSharedValue(rows, candidateHeaders) {
  const values = Array.from(
    new Set(
      rows
        .map((row) =>
          candidateHeaders
            .map((header) => row[header]?.trim())
            .find(Boolean),
        )
        .filter(Boolean),
    ),
  );

  return values.length === 1 ? values[0] : "";
}

function buildUploadPayload({ rows, course, year }) {
  return {
    course,
    year,
    rows: rows.map((row) => {
      const nextRow = { ...row };

      if (!nextRow.course && !nextRow.Course && course) {
        nextRow.course = course;
      }

      if (!nextRow.year && !nextRow.Year && year) {
        nextRow.year = year;
      }

      return nextRow;
    }),
  };
}

function buildPayloadPreview(payload) {
  return {
    course: payload.course,
    year: payload.year,
    rowCount: payload.rows.length,
    rows: payload.rows.slice(0, 2),
  };
}

function buildSuccessMessage(result) {
  const studentUpserts = result?.students?.upsertedCount ?? 0;
  const resultUpserts = result?.results?.upsertedCount ?? 0;
  const resultMatches = result?.results?.matchedCount ?? 0;

  return `Uploaded successfully. Student profiles added: ${studentUpserts}. Course results added: ${resultUpserts}. Existing course results matched: ${resultMatches}.`;
}

export default TeacherDashboardPage;
