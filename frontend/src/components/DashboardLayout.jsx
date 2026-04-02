import React, { useState } from 'react';
import SideBar from './SideBar';
import {
  readTeacherSession
} from "../lib/teacherAuthApi";
import AddResult from '../pages/AddResult';
import Analytics from '../pages/Analytics';

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
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // This would need to be implemented in the API
      // const result = await createTeacherAccount({ email, password, role });
      setMessage('Teacher registration functionality needs to be implemented in the backend API.');
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

export default DashboardLayout;
