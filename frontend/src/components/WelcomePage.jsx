import { useState } from "react";
import hero from "../assets/hero.png";
import logo from "../assets/logo.png";

function WelcomePage({ onGetStarted, onTeacherLogin }) {
  const faqItems = [
  {
    question: "How do I check my exam results?",
    answer:
      "Just enter your year, course, and student ID in the search box. Your result slip pops up instantly—no waiting around!",
  },
  {
    question: "Is my personal info safe?",
    answer:
      "Yep! Only teachers with secure login can see data, and everything you send or receive is protected with HTTPS encryption.",
  },
  {
    question: "How soon are results updated?",
    answer:
      "As soon as teachers upload them! Most results show up right after grading is done for each exam session.",
  },
];

  const [openIndex, setOpenIndex] = useState(null);
  const toggleFaq = (index) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <>
      <header className="mb-6 flex items-center justify-between rounded-4xl border border-amber-50/10 bg-slate-950/45 px-5 py-4 shadow-[0_12px_30px_rgba(3,7,18,0.35)] backdrop-blur-[14px]">
        <div className="flex items-center gap-3">
          <img src={logo} alt="ExamResult logo" className="h-10 w-10 rounded-lg object-contain" />
          <span className="text-xl font-bold text-amber-200">ExamResult</span>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-200">
          <a href="#features" className="transition hover:text-white">Features</a>
          <a href="#faq" className="transition hover:text-white">FAQ</a>
          <a href="#contact" className="rounded-full border border-amber-200 px-4 py-2 text-amber-200 transition hover:bg-amber-200/20 hover:text-white">Contact</a>
          <button
            type="button"
            onClick={onTeacherLogin}
            className="rounded-full bg-amber-400 px-4 py-2 font-semibold text-slate-950 shadow hover:bg-amber-300 cursor-pointer"
          >
            Login
          </button>
        </nav>
      </header>
      <section className="relative mb-5 grid items-center gap-5 overflow-hidden rounded-4xl border border-amber-50/10 bg-slate-950/45 p-7 shadow-[0_28px_90px_rgba(3,7,18,0.38)] backdrop-blur-[18px] lg:grid-cols-[minmax(0,1.25fr)_minmax(220px,0.9fr)_auto]">
        <div className="pointer-events-none absolute -bottom-36 -right-32 h-75 w-75 rounded-full bg-radial-[at_center] from-amber-400/20 to-transparent blur-xl" />

        <div className="relative z-10">
          <p className="text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">
            Mau Student Result Portal
          </p>
          <h1 className="mt-2 max-w-[13ch] font-serif text-[clamp(2.4rem,6vw,4.3rem)] leading-[0.96] tracking-[-0.04em] text-slate-50">
            Get your exam results instantly with clear analytics and score breakdowns.
          </h1>
          <p className="mt-4 max-w-[40ch] text-[1.03rem] leading-[1.65] text-slate-300">
            Search by year, course, and student ID, then get a clean result
            slip with your score breakdown in seconds.
          </p>
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

      <section id="features" className="mb-6 rounded-4xl border border-amber-50/10 bg-slate-900/55 p-6 shadow-[0_20px_60px_rgba(3,7,18,0.35)] backdrop-blur-[14px]">
        <h2 className="mb-4 text-center text-2xl font-semibold text-amber-200">Features</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5">
            <h3 className="mb-2 text-lg font-bold text-sky-200">Smart Search</h3>
            <p className="text-sm leading-relaxed text-slate-300">Search by year, course, student ID, and get instant, accurate result slips in milliseconds.</p>
          </article>
          <article className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5">
            <h3 className="mb-2 text-lg font-bold text-sky-200">Clean UI</h3>
            <p className="text-sm leading-relaxed text-slate-300">Optimized for mobile and desktop with accessible layouts, readability and speedy interactions.</p>
          </article>
          <article className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5">
            <h3 className="mb-2 text-lg font-bold text-sky-200">Secure Access</h3>
            <p className="text-sm leading-relaxed text-slate-300">Login with token protection ensures only authorized personnel can upload and manage results.</p>
          </article>
        </div>
      </section>

      <section id="faq" className="mb-6 rounded-4xl border border-amber-50/10 bg-slate-900/55 p-6 shadow-[0_20px_60px_rgba(3,7,18,0.35)] backdrop-blur-[14px]">
        <h2 className="mb-4 text-center text-2xl font-semibold text-amber-200">FAQ</h2>
        <div className="mx-auto max-w-4xl space-y-3 text-slate-300">
          {faqItems.map((item, index) => (
            <article key={index} className="rounded-xl border border-slate-700 bg-slate-950/80 p-4">
              <button
                type="button"
                className="w-full text-left font-semibold text-sky-200 focus:outline-none"
                onClick={() => toggleFaq(index)}
                aria-expanded={openIndex === index}
              >
                {item.question}
              </button>
              <div
                className={`mt-2 overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-48" : "max-h-0"
                }`}
              >
                <p className="text-sm text-slate-300">{item.answer}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="mt-8 rounded-4xl border border-slate-700 bg-slate-950/70 p-6 text-slate-300 shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
        <div className="mx-auto flex flex-col items-center justify-between gap-4 md:flex-row md:px-4">
          <p className="text-sm text-slate-300">
            &copy; {new Date().getFullYear()} ExamResult. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="text-amber-200 hover:text-amber-100">Made with Love 💖</a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default WelcomePage;
