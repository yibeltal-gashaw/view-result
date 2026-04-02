import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Calendar, TrendingUp, Award, Target } from 'lucide-react';

import { readTeacherSession } from '../lib/teacherAuthApi';

const defaultAnalyticsData = {
  totalStudents: 0,
  totalCourses: 0,
  totalDepartments: 0,
  studentsByYear: [],
  studentsByDepartment: [],
  popularCourses: [],
  recentActivity: [],
};

function getAnalyticsEndpoint() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';
  return apiBaseUrl ? `${apiBaseUrl}/api/admin/analytics` : '/api/admin/analytics';
}

function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(defaultAnalyticsData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      setIsLoading(true);
      setError('');

      try {
        const session = readTeacherSession();
        const token = session?.token;

        const response = await fetch(getAnalyticsEndpoint(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const rawText = await response.text();
        const payload = rawText ? JSON.parse(rawText) : null;

        if (!response.ok) {
          throw new Error(payload?.message || 'Unable to load analytics.');
        }

        const next = payload?.analyticsData;
        if (!next) {
          throw new Error('The analytics service returned an invalid response.');
        }

        if (!cancelled) setAnalyticsData(next);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Unable to load analytics.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadAnalytics();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-50 mb-2">Analytics Dashboard</h1>
        <p className="text-slate-300">Overview of student data and system statistics</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm leading-6 text-rose-100">
          {error}
        </div>
      ) : null}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={analyticsData.totalStudents.toLocaleString()}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Total Courses"
          value={analyticsData.totalCourses.toString()}
          icon={<BookOpen className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Departments"
          value={analyticsData.totalDepartments.toString()}
          icon={<Target className="h-6 w-6" />}
          color="purple"
        />
        <StatCard
          title="Active Year"
          value="2026"
          icon={<Calendar className="h-6 w-6" />}
          color="amber"
        />
      </div>

      {/* Students by Year */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-white/8 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold text-slate-50 mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-amber-400" />
            Students by Year
          </h2>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-slate-400">Loading...</p>
            ) : (
              analyticsData.studentsByYear.map((yearData, index) => (
                <YearCard key={index} {...yearData} />
              ))
            )}
          </div>
        </div>

        {/* Students by Department */}
        <div className="rounded-2xl border border-white/8 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold text-slate-50 mb-6 flex items-center gap-2">
            <Award className="h-6 w-6 text-blue-400" />
            Students by Department
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="text-slate-400">Loading...</p>
            ) : (
              analyticsData.studentsByDepartment.map((dept, index) => (
                <DepartmentCard key={index} {...dept} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Popular Courses and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-white/8 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold text-slate-50 mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-green-400" />
            Popular Courses
          </h2>
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-slate-400">Loading...</p>
            ) : (
              analyticsData.popularCourses.map((course, index) => (
                <CourseCard key={index} {...course} />
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold text-slate-50 mb-6 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-purple-400" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-slate-400">Loading...</p>
            ) : (
              analyticsData.recentActivity.map((activity, index) => (
                <ActivityCard key={index} {...activity} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400'
  };

  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-6 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-white/10 ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-slate-50">{value}</p>
        <p className="text-sm text-slate-300">{title}</p>
      </div>
    </div>
  );
}

function YearCard({ year, count, percentage }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/5">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
        <span className="text-slate-50 font-medium">{year}</span>
      </div>
      <div className="text-right">
        <p className="text-slate-50 font-bold">{count}</p>
        <p className="text-xs text-slate-400">{percentage}%</p>
      </div>
    </div>
  );
}

function DepartmentCard({ name, count, percentage }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/5">
      <div className="flex-1">
        <p className="text-slate-50 font-medium">{name}</p>
        <div className="w-full bg-white/10 rounded-full h-2 mt-2">
          <div
            className="bg-blue-400 h-2 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
      <div className="text-right ml-4">
        <p className="text-slate-50 font-bold">{count}</p>
        <p className="text-xs text-slate-400">{percentage}%</p>
      </div>
    </div>
  );
}

function CourseCard({ name, students, department }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/5">
      <div>
        <p className="text-slate-50 font-medium">{name}</p>
        <p className="text-xs text-slate-400">{department}</p>
      </div>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-green-400" />
        <span className="text-slate-50 font-bold">{students}</span>
      </div>
    </div>
  );
}

function ActivityCard({ action, course, time }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-white/8 bg-white/5">
      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
      <div className="flex-1">
        <p className="text-slate-50 text-sm">
          <span className="font-medium">{action}</span> - {course}
        </p>
        <p className="text-xs text-slate-400">{time}</p>
      </div>
    </div>
  );
}

export default Analytics;
