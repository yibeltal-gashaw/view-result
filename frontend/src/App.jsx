import { Navigate, Route, Routes } from "react-router-dom";
import ResultPage from "./pages/ResultPage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";
import TeacherLoginPage from "./pages/TeacherLoginPage";
import WelcomeRoute from "./pages/WelcomeRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomeRoute />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/teachers/login" element={<TeacherLoginPage />} />
      <Route path="/teachers/dashboard" element={<TeacherDashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
