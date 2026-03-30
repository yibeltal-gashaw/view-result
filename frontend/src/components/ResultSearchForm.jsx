import { courseOptions, yearOptions } from "../config/resultOptions";

function ResultSearchForm({
  inputValue,
  selectedCourse,
  selectedYear,
  onInputChange,
  onCourseChange,
  onSubmit,
  onYearChange,
}) {
  return (
    <form className="search-form" onSubmit={onSubmit}>
      <label className="search-label" htmlFor="year-select">
        Year
      </label>
      <select
        id="year-select"
        className="search-input"
        value={selectedYear}
        onChange={(event) => onYearChange(event.target.value)}
      >
        {yearOptions.map((year) => (
          <option key={year.value} value={year.value}>
            {year.label}
          </option>
        ))}
      </select>

      <label className="search-label" htmlFor="course-select">
        Course
      </label>
      <select
        id="course-select"
        className="search-input"
        value={selectedCourse}
        onChange={(event) => onCourseChange(event.target.value)}
      >
        {courseOptions.map((course) => (
          <option key={course.value} value={course.value}>
            {course.label}
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
          onChange={(event) => onInputChange(event.target.value)}
        />
        <button className="search-button" type="submit">
          View Result
        </button>
      </div>
    </form>
  );
}

export default ResultSearchForm;
