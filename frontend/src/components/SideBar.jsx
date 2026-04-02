import logo from "../assets/logo.png";

function SideBar({ teacherSession, onRouteChange }) {
  const isAdmin = teacherSession?.user?.role === "ADMIN";

  return (
    <aside className="border-b border-white/8 bg-slate-950/75 p-6 backdrop-blur-xl lg:border-b-0 lg:border-r">
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
          className="w-full rounded-xl px-4 py-2 text-left text-sm font-semibold text-amber-200 hover:bg-white/10"
          onClick={() => onRouteChange?.("home")}
        >
          Home
        </button>
        <button
          className="w-full rounded-xl px-4 py-2 text-left text-sm font-semibold text-amber-200 hover:bg-white/10"
          onClick={() => onRouteChange?.("add-result")}
        >
          Add Result
        </button>
        {isAdmin && (
          <button
            className="w-full rounded-xl px-4 py-2 text-left text-sm font-semibold text-amber-200 hover:bg-white/10"
            onClick={() => onRouteChange?.("register-teacher")}
          >
            Register Teacher
          </button>
        )}
        <button
          className="w-full rounded-xl px-4 py-2 text-left text-sm font-semibold text-amber-200 hover:bg-white/10"
          onClick={() => onRouteChange?.("settings")}
        >
          Settings
        </button>
      </nav>
    </aside>
  );
}
export default SideBar;
