import { Link, useNavigate } from "react-router-dom";

function TeacherLoginPage() {
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate("/teachers/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.14),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.2),transparent_30%),linear-gradient(135deg,#120f0d_0%,#1f1b18_45%,#111827_100%)] px-4 py-7 text-slate-50">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02),rgba(255,255,255,0.02)),radial-gradient(circle_at_center,transparent_0_62%,rgba(0,0,0,0.16)_100%)] opacity-85" />
      <div className="relative mx-auto grid min-h-[calc(100vh-3.5rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,460px)]">
        <section className="rounded-[32px] border border-amber-50/10 bg-slate-950/40 p-8 shadow-[0_28px_90px_rgba(3,7,18,0.38)] backdrop-blur-[18px]">
          <p className="text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">
            Teachers Portal
          </p>
          <h1 className="mt-3 max-w-[12ch] font-serif text-[clamp(2.5rem,6vw,4.4rem)] leading-[0.95] tracking-[-0.04em] text-slate-50">
            Secure access for course result management.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Sign in to review class performance, manage published results, and
            keep assessment records organized in one trusted workspace.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="rounded-[24px] border border-white/8 bg-white/5 p-5">
              <strong className="block text-base text-amber-50">
                Class Overview
              </strong>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Inspect student progress and course performance quickly.
              </p>
            </article>
            <article className="rounded-[24px] border border-white/8 bg-white/5 p-5">
              <strong className="block text-base text-amber-50">
                Assessment Control
              </strong>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Work with course-specific assessment structures confidently.
              </p>
            </article>
            <article className="rounded-[24px] border border-white/8 bg-white/5 p-5">
              <strong className="block text-base text-amber-50">
                Protected Access
              </strong>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Keep academic data behind a clean teacher-only sign-in flow.
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-[32px] border border-amber-50/10 bg-slate-950/55 p-7 shadow-[0_28px_90px_rgba(3,7,18,0.38)] backdrop-blur-[18px]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">
                Sign In
              </p>
              <h2 className="mt-2 font-serif text-3xl text-slate-50">
                Teacher Login
              </h2>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-100">
              Staff Only
            </span>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-200">
                School Email
              </span>
              <input
                className="min-h-14 rounded-[18px] border border-white/10 bg-slate-950/70 px-4 text-slate-50 outline-none transition duration-200 ease-out placeholder:text-slate-500 focus:-translate-y-px focus:border-sky-400/80 focus:shadow-[0_0_0_4px_rgba(56,189,248,0.12)]"
                type="email"
                placeholder="teacher@hilcoe.edu.et"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-200">
                Password
              </span>
              <input
                className="min-h-14 rounded-[18px] border border-white/10 bg-slate-950/70 px-4 text-slate-50 outline-none transition duration-200 ease-out placeholder:text-slate-500 focus:-translate-y-px focus:border-sky-400/80 focus:shadow-[0_0_0_4px_rgba(56,189,248,0.12)]"
                type="password"
                placeholder="Enter your password"
              />
            </label>

            <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
              <label className="flex items-center gap-2">
                <input
                  className="h-4 w-4 rounded border-white/20 bg-slate-900 text-amber-400"
                  type="checkbox"
                />
                <span>Remember me</span>
              </label>
              <button
                className="text-sky-300 transition hover:text-sky-200"
                type="button"
              >
                Forgot password?
              </button>
            </div>

            <button
              className="mt-2 min-h-14 rounded-[18px] bg-linear-to-r from-amber-300 via-amber-500 to-orange-500 px-6 font-bold text-stone-950 shadow-[0_18px_38px_rgba(245,158,11,0.24)] transition duration-200 ease-out hover:-translate-y-px hover:brightness-105 hover:shadow-[0_22px_42px_rgba(245,158,11,0.3)]"
              type="submit"
            >
              Login
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/8 pt-5 text-sm text-slate-300">
            <span>Need the student result page instead?</span>
            <Link
              className="rounded-full border border-white/10 px-4 py-2 text-slate-100 transition hover:border-sky-400/50 hover:bg-sky-400/10"
              to="/"
            >
              Back Home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default TeacherLoginPage;
