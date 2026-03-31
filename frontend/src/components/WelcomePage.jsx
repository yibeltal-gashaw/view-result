import hero from "../assets/hero.png";

function WelcomePage({ onGetStarted, onTeacherLogin }) {
  return (
    <>
      <section className="relative mb-5 grid items-center gap-5 overflow-hidden rounded-4xl border border-amber-50/10 bg-slate-950/45 p-7 shadow-[0_28px_90px_rgba(3,7,18,0.38)] backdrop-blur-[18px] lg:grid-cols-[minmax(0,1.25fr)_minmax(220px,0.9fr)_auto]">
        <div className="pointer-events-none absolute -bottom-36 -right-32 h-75 w-75 rounded-full bg-radial-[at_center] from-amber-400/20 to-transparent blur-xl" />

        <div className="relative z-10">
          <p className="text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">
            HiLCoE Student Result Portal
          </p>
          <h1 className="mt-2 max-w-[11ch] font-serif text-[clamp(2.4rem,6vw,4.3rem)] leading-[0.96] tracking-[-0.04em] text-slate-50">
            Find your result in a calm, polished space built for mobile.
          </h1>
          <p className="mt-4 max-w-[40ch] text-[1.03rem] leading-[1.65] text-slate-300">
            Search by year, course, and student ID, then get a clean result
            slip with your score breakdown in seconds.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              className="min-h-14 rounded-full bg-linear-to-r from-amber-300 via-amber-500 to-orange-500 px-6 font-bold text-stone-950 shadow-[0_18px_38px_rgba(245,158,11,0.24)] transition duration-200 ease-out hover:-translate-y-px hover:brightness-105 hover:shadow-[0_22px_42px_rgba(245,158,11,0.3)]"
              type="button"
              onClick={onGetStarted}
            >
              Get Started
            </button>
            <button
              className="min-h-14 rounded-full border border-white/12 bg-white/6 px-6 font-semibold text-slate-100 transition duration-200 ease-out hover:-translate-y-px hover:border-sky-400/45 hover:bg-sky-400/10"
              type="button"
              onClick={onTeacherLogin}
            >
              Teacher Login
            </button>
          </div>
        </div>

        <div
          className="relative z-10 grid min-h-60 place-items-center"
          aria-hidden="true"
        >
          <div className="absolute left-1/2 top-1/2 h-55 w-55 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-400/30 shadow-[inset_0_0_40px_rgba(56,189,248,0.08)]" />
          <div className="absolute left-1/2 top-1/2 h-72.5 w-72.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-amber-400/25" />
          <img
            className="relative z-10 w-full max-w-60 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.35)] motion-safe:animate-[floatUp_6s_ease-in-out_infinite]"
            src={hero}
            alt=""
          />
        </div>
      </section>
    </>
  );
}

export default WelcomePage;
