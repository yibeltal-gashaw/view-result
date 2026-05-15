import { BookOpen, FilePlus, Home, LogOut, Settings2, UserPlus, Users } from "lucide-react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import {clearTeacherSession} from "../lib/teacherAuthApi";

function SideBar({ teacherSession, onRouteChange, currentRoute }) {
  const navigate = useNavigate();
  const isAdmin = teacherSession?.user?.role === "ADMIN";

  const getButtonClasses = (route) => {
    const baseClasses = "flex w-full items-center gap-2 rounded-xl px-4 py-2 text-left text-sm font-semibold transition-colors";
    const activeClasses = currentRoute === route
      ? "bg-white/15 text-white border border-white/20"
      : "text-slate-300 hover:bg-white/10 hover:text-white";
    return `${baseClasses} ${activeClasses}`;
  };

  function handleLogout() {
    clearTeacherSession();
    navigate("/teachers/login");
  }

  return (
    <aside className="flex h-screen w-72 flex-col border-b border-white/8 bg-slate-950/75 p-6 backdrop-blur-xl lg:border-b-0 lg:border-r lg:overflow-y-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-linear-to-br from-amber-400 to-fuchsia-500">
          <img src={logo} alt="Logo" className="h-full w-full object-contain" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
            Mau ExamResult
          </p>
          <h2 className="text-lg font-bold text-slate-50">Dashboard</h2>
        </div>
      </div>

      <nav className="flex flex-1 flex-col space-y-2">
        <button
          className={getButtonClasses("home")}
          onClick={() => onRouteChange?.("home")}
        >
          <Home className="h-4 w-4" />
          Home
        </button>
        <button
          className={getButtonClasses("courses")}
          onClick={() => onRouteChange?.("courses")}
        >
          <BookOpen className="h-4 w-4" />
          Courses
        </button>
        <button
          className={getButtonClasses("add-result")}
          onClick={() => onRouteChange?.("add-result")}
        >
          <FilePlus className="h-4 w-4" />
          Add Result
        </button>
        {isAdmin && (
          <button
            className={getButtonClasses("teachers")}
            onClick={() => onRouteChange?.("teachers")}
          >
            <Users className="h-4 w-4" />
            Teachers
          </button>
        )}
        {isAdmin && (
          <button
            className={getButtonClasses("register-teacher")}
            onClick={() => onRouteChange?.("register-teacher")}
          >
            <UserPlus className="h-4 w-4" />
            Register Teacher
          </button>
        )}
        <button
          className={getButtonClasses("settings")}
          onClick={() => onRouteChange?.("settings")}
        >
          <Settings2 className="h-4 w-4" />
          Settings
        </button>

        <div className="mt-auto pt-10">
          <button
            className="flex w-full items-center gap-3 rounded-xl border border-white/12 bg-white/5 px-4 py-3 font-semibold text-slate-100 transition-all duration-200 hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-100"
            type="button"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}
export default SideBar;
