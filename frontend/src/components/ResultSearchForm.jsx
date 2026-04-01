import { yearOptions } from "../config/resultOptions";

function ResultSearchForm({
  courseOptions,
  inputValue,
  selectedCourse,
  selectedYear,
  onInputChange,
  onCourseChange,
  onSubmit,
  onYearChange,
  studentIdInputRef,
}) {
  return (
    <form
      className="grid gap-3 rounded-3xl border border-white/10 bg-white/4 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur"
      onSubmit={onSubmit}
    >
      <label
        className="text-[0.84rem] uppercase tracking-[0.16em] text-slate-200"
        htmlFor="year-select"
      >
        Year
      </label>
      <select
        id="year-select"
        className="min-h-13.5 w-full rounded-[18px] border border-white/10 bg-slate-950/70 px-4 text-base text-slate-50 outline-none transition duration-200 ease-out appearance-none focus:-translate-y-px focus:border-sky-400/80 focus:shadow-[0_0_0_4px_rgba(56,189,248,0.12)]"
        value={selectedYear}
        onChange={(event) => onYearChange(event.target.value)}
      >
        {yearOptions.map((year) => (
          <option key={year.value} value={year.value}>
            {year.label}
          </option>
        ))}
      </select>

      <label
        className="text-[0.84rem] uppercase tracking-[0.16em] text-slate-200"
        htmlFor="course-select"
      >
        Course
      </label>
      <select
        id="course-select"
        className="min-h-13.5 w-full rounded-[18px] border border-white/10 bg-slate-950/70 px-4 text-base text-slate-50 outline-none transition duration-200 ease-out appearance-none focus:-translate-y-px focus:border-sky-400/80 focus:shadow-[0_0_0_4px_rgba(56,189,248,0.12)]"
        value={selectedCourse}
        onChange={(event) => onCourseChange(event.target.value)}
      >
        {courseOptions.map((course) => (
          <option key={course.value} value={course.value}>
            {course.label}
          </option>
        ))}
      </select>

      <label
        className="text-[0.84rem] uppercase tracking-[0.16em] text-slate-200"
        htmlFor="student-id"
      >
        Student ID
      </label>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <input
          id="student-id"
          ref={studentIdInputRef}
          className="min-h-13.5 w-full rounded-[18px] border border-white/10 bg-slate-950/70 px-4 text-base text-slate-50 outline-none transition duration-200 ease-out placeholder:text-slate-500 focus:-translate-y-px focus:border-sky-400/80 focus:shadow-[0_0_0_4px_rgba(56,189,248,0.12)]"
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck="false"
          placeholder="MAU1602154"
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
        />
        <button
          className="min-h-13.5 rounded-[18px] bg-linear-to-r from-amber-400 via-orange-500 to-rose-400 px-5 font-bold text-stone-950 shadow-[0_16px_34px_rgba(249,115,22,0.24)] transition duration-200 ease-out hover:-translate-y-px hover:brightness-105 hover:shadow-[0_20px_40px_rgba(249,115,22,0.3)]"
          type="submit"
        >
          View Result
        </button>
      </div>
    </form>
  );
}

export default ResultSearchForm;
