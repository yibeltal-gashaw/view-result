const { prisma } = require("../config/database");
const { COURSE_MAP, YEAR_MAP } = require("../config/resultOptions");

function formatTimeAgo(date) {
  if (!date) return "Just now";

  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "Just now";

  const diffMs = Date.now() - d.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12)
    return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears === 1 ? "" : "s"} ago`;
}

async function getAnalyticsData() {
  // If the dataset is empty, keep the response stable for the UI.
  const [totalStudents, totalCoursesRows] = await Promise.all([
    prisma.student.count(),
    prisma.result.findMany({
      distinct: ["course"],
      select: { course: true },
    }),
  ]);

  const courses = totalCoursesRows.map((r) => r.course).filter(Boolean);
  const totalCourses = courses.length;
  const totalDepartments = totalCourses;

  const totalRecordsAgg = await prisma.result.aggregate({
    _count: { _all: true },
  });
  const totalRecords = totalRecordsAgg?._count?._all ?? 0;

  const byYearRows = await prisma.result.groupBy({
    by: ["year"],
    _count: { _all: true },
  });

  const studentsByYear = byYearRows
    .sort((a, b) => Number(a.year) - Number(b.year))
    .map((row) => {
      const count = row._count._all;
      const percentage = totalRecords ? (count / totalRecords) * 100 : 0;
      const year = YEAR_MAP[row.year] || String(row.year);
      return {
        year,
        count,
        percentage: Number(percentage.toFixed(1)),
      };
    });

  const byCourseRows = await prisma.result.groupBy({
    by: ["course"],
    _count: { _all: true },
  });

  const studentsByDepartment = byCourseRows
    .sort((a, b) => (b._count._all ?? 0) - (a._count._all ?? 0))
    .map((row) => {
      const count = row._count._all;
      const percentage = totalRecords ? (count / totalRecords) * 100 : 0;
      return {
        name: COURSE_MAP[row.course] || row.course,
        count,
        percentage: Number(percentage.toFixed(1)),
      };
    });

  const popularCourseRows = byCourseRows
    .sort((a, b) => (b._count._all ?? 0) - (a._count._all ?? 0))
    .slice(0, 5)
    .map((row) => ({
      name: COURSE_MAP[row.course] || row.course,
      // The UI labels this as "students"; we use record count as a stable proxy.
      students: row._count._all,
      department: String(row.course || "")
        .toUpperCase()
        .slice(0, 2)
        .padEnd(2, " "),
    }));

  const recentRows = await prisma.result.findMany({
    orderBy: { updatedAt: "desc" },
    take: 4,
    select: { course: true, updatedAt: true },
  });

  const recentActivity = recentRows.map((row) => ({
    action: "Results uploaded",
    course: COURSE_MAP[row.course] || row.course,
    time: formatTimeAgo(row.updatedAt),
  }));

  return {
    totalStudents,
    totalCourses,
    totalDepartments,
    studentsByYear,
    studentsByDepartment,
    popularCourses: popularCourseRows,
    recentActivity,
  };
}

module.exports = {
  getAnalyticsData,
};

