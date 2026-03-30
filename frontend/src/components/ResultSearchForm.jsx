import { subjectOptions, yearOptions } from "../config/resultOptions";

function ResultSearchForm({
  inputValue,
  selectedSubject,
  selectedYear,
  onInputChange,
  onSubjectChange,
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
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      <label className="search-label" htmlFor="subject-select">
        Subject
      </label>
      <select
        id="subject-select"
        className="search-input"
        value={selectedSubject}
        onChange={(event) => onSubjectChange(event.target.value)}
      >
        {subjectOptions.map((subject) => (
          <option key={subject} value={subject}>
            {subject}
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
