import { Navigate, Route, Routes } from "react-router-dom";
import { readTeacherSession } from "./lib/teacherAuthApi";
import ResultPage from "./pages/ResultPage";
import TeacherLoginPage from "./pages/TeacherLoginPage";
import WelcomeRoute from "./pages/WelcomeRoute";
import DashboardLayout from "./components/DashboardLayout";
import AddResult from "./pages/AddResult";

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomeRoute />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/teachers/login" element={<TeacherLoginPage />} />
      <Route
        path="/teachers/dashboard"
        element={(
          <ProtectedTeacherRoute>
            <DashboardLayout />
          </ProtectedTeacherRoute>
        )}
      />
      <Route
      path="/teachers/add-result"
        element={(
          <ProtectedTeacherRoute>
            <AddResult />
          </ProtectedTeacherRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ProtectedTeacherRoute({ children }) {
  const session = readTeacherSession();

  if (!session?.token) {
    return <Navigate to="/teachers/login" replace />;
  }

  return children;
}

export default App;
