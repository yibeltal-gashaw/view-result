import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WelcomePage from "../components/WelcomePage";

const TELEGRAM = window.Telegram?.WebApp;

function WelcomeRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!TELEGRAM) {
      return;
    }

    TELEGRAM.ready();
    TELEGRAM.expand();
    TELEGRAM.setHeaderColor("#0f172a");
    TELEGRAM.setBackgroundColor("#07111f");
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.14),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.2),transparent_30%),linear-gradient(135deg,#120f0d_0%,#1f1b18_45%,#111827_100%)] px-4 py-7 text-slate-50">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02),rgba(255,255,255,0.02)),radial-gradient(circle_at_center,transparent_0_62%,rgba(0,0,0,0.16)_100%)] opacity-85" />
      <div className="relative mx-auto w-full max-w-270">
        <WelcomePage
          status="idle"
          onGetStarted={() => navigate("/result")}
          onTeacherLogin={() => navigate("/teachers/login")}
        />
      </div>
    </main>
  );
}

export default WelcomeRoute;
