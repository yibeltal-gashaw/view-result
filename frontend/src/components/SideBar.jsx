import { BookOpen, FilePlus, Home, Settings2, UserPlus, Users } from "lucide-react";
import logo from "../assets/logo.png";

function SideBar({ teacherSession, onRouteChange, currentRoute }) {
  const isAdmin = teacherSession?.user?.role === "ADMIN";

  const getButtonClasses = (route) => {
    const baseClasses = "flex w-full items-center gap-2 rounded-xl px-4 py-2 text-left text-sm font-semibold transition-colors";
    const activeClasses = currentRoute === route
      ? "bg-amber-400/20 text-amber-100 border border-amber-400/30"
      : "text-amber-200 hover:bg-white/10";
    return `${baseClasses} ${activeClasses}`;
  };

  return (
    <aside className="w-72 shrink-0 border-b border-white/8 bg-slate-950/75 p-6 backdrop-blur-xl lg:border-b-0 lg:border-r lg:max-h-screen lg:overflow-y-auto">
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

      <nav className="space-y-2">
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
        
      </nav>
    </aside>
  );
}
export default SideBar;
