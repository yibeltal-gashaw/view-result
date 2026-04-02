import React, { useEffect, useMemo, useState } from "react";
import SideBar from './SideBar';
import {
  createTeacherAccount,
  fetchAdminUsers,
  readTeacherSession,
  updateAdminUserRole,
} from "../lib/teacherAuthApi";
import AddResult from '../pages/AddResult';
import Analytics from '../pages/Analytics';
import MyCourse from "../pages/MyCourse";
import { fetchCourses } from "../lib/resultApi";

function DashboardLayout() {
  const [teacherSession, setTeacherSession] = useState(() => readTeacherSession());
  const [currentRoute, setCurrentRoute] = useState('home');

  const handleRouteChange = (route) => {
    setCurrentRoute(route);
  };

  const renderCurrentView = () => {
    switch (currentRoute) {
      case 'home':
        return <Analytics />;
      case "courses":
      case "my-course":
        return <MyCourse />;
      case "teachers":
        return <TeachersView teacherSession={teacherSession} />;
      case 'add-result':
        return <AddResult teacherSession={teacherSession} />;
      case 'settings':
        return <SettingsView teacherSession={teacherSession} />;
      case 'register-teacher':
        return <RegisterTeacherView teacherSession={teacherSession} />;
      default:
        return <Analytics />;
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.14),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.2),transparent_30%),linear-gradient(135deg,#120f0d_0%,#1f1b18_45%,#111827_100%)] text-slate-50">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02),rgba(255,255,255,0.02)),radial-gradient(circle_at_center,transparent_0_62%,rgba(0,0,0,0.16)_100%)] opacity-85" />
      <div className="relative flex min-h-screen">
        <SideBar
          teacherSession={teacherSession}
          onRouteChange={handleRouteChange}
          currentRoute={currentRoute}
        />
        <div className="flex-1 min-w-0 px-4 py-5 sm:px-6 lg:px-8 overflow-y-auto">
          {renderCurrentView()}
        </div>
      </div>
    </main>
  );
}

function SettingsView({ teacherSession }) {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-50">Settings</h1>
        <p className="mt-2 text-slate-300">Manage your profile and preferences</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-white/8 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-slate-50 mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <p className="text-slate-50 bg-white/5 px-3 py-2 rounded-lg">
                {teacherSession?.user?.email || 'Not available'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
              <p className="text-slate-50 bg-white/5 px-3 py-2 rounded-lg">
                {teacherSession?.user?.role || 'Not available'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterTeacherView({ teacherSession }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('TEACHER');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [coursesError, setCoursesError] = useState("");
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const courseOptions = useMemo(
    () => (Array.isArray(courses) ? courses : []),
    [courses],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      setCoursesLoading(true);
      setCoursesError("");

      try {
        const nextCourses = await fetchCourses();
        if (!cancelled) setCourses(nextCourses);
      } catch (err) {
        if (!cancelled)
          setCoursesError(err?.message || "Unable to load courses.");
      } finally {
        if (!cancelled) setCoursesLoading(false);
      }
    }

    loadCourses();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (role !== "TEACHER") {
      setSelectedCourses([]);
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      if (!teacherSession?.token) {
        throw new Error("Login again to continue.");
      }
      if (role === "TEACHER" && selectedCourses.length === 0) {
        throw new Error("Select at least one course for teacher.");
      }

      const payload = {
        email,
        password,
        role,
        ...(role === "TEACHER" ? { courses: selectedCourses } : {}),
      };

      const result = await createTeacherAccount({
        token: teacherSession.token,
        payload,
      });

      const createdUser = result?.user;
      setMessage(
        `Created ${createdUser?.email || email} as ${createdUser?.role || role}${
          Array.isArray(createdUser?.courses) && createdUser.courses.length > 0
            ? ` (${createdUser.courses.join(", ")})`
            : createdUser?.course
              ? ` (${createdUser.course})`
              : ""
        }.`,
      );
      setEmail("");
      setPassword("");
      setRole("TEACHER");
      setSelectedCourses([]);
    } catch (error) {
      setMessage(error.message || 'Failed to register teacher');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-50">Register Teacher</h1>
        <p className="mt-2 text-slate-300">Add new teachers to the system</p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/5 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="teacher@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Enter password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {role === "TEACHER" ? (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Courses
              </label>
              <CourseMultiSelect
                options={courseOptions}
                selectedValues={selectedCourses}
                onChange={setSelectedCourses}
                disabled={coursesLoading}
                placeholder={coursesLoading ? "Loading courses..." : "Select course(s)"}
              />
              {coursesError ? (
                <p className="mt-2 text-sm text-rose-200">{coursesError}</p>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-amber-400 text-slate-950 font-semibold rounded-lg hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Registering...' : 'Register Teacher'}
          </button>

          {message && (
            <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
              <p className="text-blue-200 text-sm">{message}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function TeachersView({ teacherSession }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleDrafts, setRoleDrafts] = useState({});
  const [courseDrafts, setCourseDrafts] = useState({});
  const [courseOptions, setCourseOptions] = useState([]);
  const [updatingTeacherId, setUpdatingTeacherId] = useState(null);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTeachers() {
      setLoading(true);
      setError("");

      try {
        if (!teacherSession?.token) {
          throw new Error("Login again to continue.");
        }

        const users = await fetchAdminUsers({ token: teacherSession.token });
        const courses = await fetchCourses();
        if (!cancelled) {
          setCourseOptions(Array.isArray(courses) ? courses : []);
          setTeachers(Array.isArray(users) ? users : []);
          setRoleDrafts(
            Object.fromEntries(
              (Array.isArray(users) ? users : []).map((teacher) => [teacher.id, teacher.role]),
            ),
          );
          setCourseDrafts(
            Object.fromEntries(
              (Array.isArray(users) ? users : []).map((teacher) => [
                teacher.id,
                Array.isArray(teacher.courses)
                  ? teacher.courses
                  : String(teacher.course || "")
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
              ]),
            ),
          );
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || "Unable to load teachers.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTeachers();
    return () => {
      cancelled = true;
    };
  }, [teacherSession]);

  async function handleUpdateRole(teacher) {
    setUpdatingTeacherId(teacher.id);
    setError("");
    setSuccess("");

    try {
      if (!teacherSession?.token) {
        throw new Error("Login again to continue.");
      }

      const nextRole = roleDrafts[teacher.id] || teacher.role;
      const nextCourses = Array.isArray(courseDrafts[teacher.id])
        ? courseDrafts[teacher.id]
        : [];
      const updated = await updateAdminUserRole({
        token: teacherSession.token,
        userId: teacher.id,
        role: nextRole,
        courses: nextCourses,
      });

      setTeachers((current) =>
        current
          .map((row) => (row.id === teacher.id ? { ...row, ...updated } : row)),
      );
      setSuccess(
        `Updated ${teacher.email} to ${nextRole}${
          nextCourses.length > 0 ? ` (${nextCourses.join(", ")})` : ""
        }.`,
      );
      setEditingTeacherId(null);
    } catch (err) {
      setError(err?.message || "Unable to update teacher role.");
    } finally {
      setUpdatingTeacherId(null);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-50">Teachers</h1>
        <p className="mt-2 text-slate-300">
          Manage user roles and assigned courses.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">
          {success}
        </div>
      ) : null}

      <div className="overflow-x-auto h-full overflow-y-visible rounded-2xl border border-white/8 bg-white/5">
        {loading ? (
          <div className="p-6 text-slate-300">Loading...</div>
        ) : teachers.length === 0 ? (
          <div className="p-6 text-slate-300">No user accounts found.</div>
        ) : (
          <table className="min-w-full divide-y divide-white/8 text-left text-sm">
            <thead className="bg-white/6">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-200">Email</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-200">Courses</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-200">Role</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-200">Created</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-200">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6 bg-slate-950/40">
              {teachers.map((teacher) => (
                <tr key={teacher.id}>
                  {/** Default table shows read-only values; click Update to edit row. */}
                  <td className="whitespace-nowrap px-4 py-3 text-slate-100">
                    {teacher.email}
                  </td>
                  <td className="px-4 py-3 text-slate-200">
                    {editingTeacherId === teacher.id ? (
                      <CourseMultiSelect
                        options={courseOptions}
                        selectedValues={courseDrafts[teacher.id] || []}
                        onChange={(values) =>
                          setCourseDrafts((current) => ({
                            ...current,
                            [teacher.id]: values,
                          }))
                        }
                        disabled={updatingTeacherId === teacher.id}
                        compact
                        placeholder="Select course(s)"
                      />
                    ) : (
                      <span>
                        {Array.isArray(teacher.courses) && teacher.courses.length > 0
                          ? teacher.courses.join(", ")
                          : teacher.course || "-"}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                    {editingTeacherId === teacher.id ? (
                      <select
                        value={roleDrafts[teacher.id] || teacher.role}
                        onChange={(e) =>
                          setRoleDrafts((current) => ({
                            ...current,
                            [teacher.id]: e.target.value,
                          }))
                        }
                        className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        disabled={updatingTeacherId === teacher.id}
                      >
                        <option value="TEACHER">TEACHER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    ) : (
                      <span className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs">
                        {teacher.role}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                    {teacher.createdAt
                      ? new Date(teacher.createdAt).toLocaleString()
                      : "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {editingTeacherId === teacher.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateRole(teacher)}
                          disabled={updatingTeacherId === teacher.id}
                          className="rounded-md border border-emerald-400/40 bg-emerald-400/20 px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updatingTeacherId === teacher.id ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTeacherId(null);
                            setRoleDrafts((current) => ({
                              ...current,
                              [teacher.id]: teacher.role,
                            }));
                            setCourseDrafts((current) => ({
                              ...current,
                              [teacher.id]: Array.isArray(teacher.courses)
                                ? teacher.courses
                                : String(teacher.course || "")
                                    .split(",")
                                    .map((item) => item.trim())
                                    .filter(Boolean),
                            }));
                          }}
                          disabled={updatingTeacherId === teacher.id}
                          className="rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTeacherId(teacher.id);
                          setRoleDrafts((current) => ({
                            ...current,
                            [teacher.id]: teacher.role,
                          }));
                          setCourseDrafts((current) => ({
                            ...current,
                            [teacher.id]: Array.isArray(teacher.courses)
                              ? teacher.courses
                              : String(teacher.course || "")
                                  .split(",")
                                  .map((item) => item.trim())
                                  .filter(Boolean),
                          }));
                        }}
                        className="rounded-md border border-amber-400/40 bg-amber-400/20 px-3 py-1.5 text-xs font-semibold text-amber-100 hover:bg-amber-400/30"
                      >
                        Update
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function CourseMultiSelect({
  options = [],
  selectedValues = [],
  onChange,
  disabled = false,
  compact = false,
  placeholder = "Select course(s)",
}) {
  const [open, setOpen] = useState(false);
  const selectedSet = new Set(selectedValues);

  const selectedLabels = options
    .filter((option) => selectedSet.has(option.value))
    .map((option) => option.label);

  function toggleValue(value) {
    const next = selectedSet.has(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];
    onChange?.(next);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen((current) => !current)}
        disabled={disabled}
        className={`${compact ? "min-w-56 px-2 py-1 text-xs" : "w-full px-3 py-2 text-sm"} rounded-md border border-white/20 bg-white/10 text-left text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder}
      </button>

      {open ? (
        <div className="absolute z-20 mt-2 w-full rounded-md border border-white/20 bg-slate-900/95 p-2 shadow-xl">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm text-slate-100 hover:bg-white/10"
            >
              <input
                type="checkbox"
                checked={selectedSet.has(option.value)}
                onChange={() => toggleValue(option.value)}
                className="h-4 w-4 accent-amber-400"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default DashboardLayout;
