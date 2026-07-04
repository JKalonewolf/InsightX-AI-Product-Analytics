import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import {
  useDashboardMetrics, useFunnelMetrics, useRetentionCohorts,
  useExperimentResults, usePredictChurn, useRevenueForecast,
  useAiInsights, useAskAiMutation, useDocsList, useDocContent, api,
  useFunnelsList, useCreateFunnel, useExperimentsList, useCreateExperiment,
  useFeatureFlagsList, useCreateFeatureFlag, useToggleFeatureFlag,
  useUpdateFlagRollout, useUpdateFlagBeta, useUserJourney,
  useUserSegmentation, useAiUserClustering, useAiFeatureRecommendations,
  useOrganizationInvoices, useUpdateOrganizationBilling, useAdminUsers,
  useAdminProjects, useAdminLogs, useUpdateUserRole
} from './api';

const API_BASE = window.location.protocol === 'file:' ? 'http://127.0.0.1:3000' : '';

// ==========================================
// 1. Icon Component (Lucide Alternatives)
// ==========================================
interface IconProps {
  name: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className = "w-5 h-5" }) => {
  const paths: Record<string, React.ReactNode> = {
    dashboard: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
      </>
    ),
    sdk: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
    funnel: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />,
    retention: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    experiment: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />,
    ai: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
    heatmap: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ),
    docs: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
    settings: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ),
    api: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    logout: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    lightning: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />,
  };

  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {paths[name] || <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
    </svg>
  );
};

// ==========================================
// 2. Authentication View Component
// ==========================================
interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AuthPageProps {
  onLoginSuccess: (token: string, user: AuthUser) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [authStep, setAuthStep] = useState<'login' | 'signup' | 'forgot' | 'reset' | 'mfa'>('login');
  const [email, setEmail] = useState('demo@insightx.ai');
  const [password, setPassword] = useState('demo123');
  const [fullName, setFullName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (authStep === 'login') {
        const res = await api.post('/api/v1/auth/login', { email, password });
        if (res.data.success) {
          if (res.data.mfa_required) {
            setTempToken(res.data.temp_token);
            setAuthStep('mfa');
          } else {
            onLoginSuccess(res.data.accessToken, res.data.user);
          }
        }
      } else if (authStep === 'signup') {
        const res = await api.post('/api/v1/auth/signup', { email, password, full_name: fullName });
        if (res.data.success) {
          // Sim email verification immediately for user review
          setSuccessMsg(`Registration successful! Verification token generated: ${res.data.verification_token}. Verifying email...`);
          // Call verify-email automatically to activate account
          await api.post('/api/v1/auth/verify-email', { token: res.data.verification_token });
          setSuccessMsg(`Account created and verified! You can now log in.`);
          setAuthStep('login');
        }
      } else if (authStep === 'forgot') {
        const res = await api.post('/api/v1/auth/forgot-password', { email });
        if (res.data.success) {
          setResetToken(res.data.reset_token);
          setSuccessMsg(`Reset token generated: ${res.data.reset_token}. Use this to set your password.`);
          setAuthStep('reset');
        }
      } else if (authStep === 'reset') {
        const res = await api.post('/api/v1/auth/reset-password', { reset_token: resetToken, new_password: newPassword });
        if (res.data.success) {
          setSuccessMsg('Password reset completed successfully. Please login.');
          setAuthStep('login');
        }
      } else if (authStep === 'mfa') {
        const res = await api.post('/api/v1/auth/mfa/verify-login', { code: mfaCode, temp_token: tempToken });
        if (res.data.success) {
          onLoginSuccess(res.data.accessToken, res.data.user);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authorization endpoint connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Glow balls */}
      <div className="absolute w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] top-10 left-10 pointer-events-none"></div>
      <div className="absolute w-96 h-96 bg-accent-cyan/5 rounded-full blur-[100px] bottom-10 right-10 pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center font-bold text-2xl text-white shadow-xl shadow-brand-500/20 mb-3">
            IX
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white capitalize">
            {authStep === 'login' && 'Welcome back'}
            {authStep === 'signup' && 'Create account'}
            {authStep === 'forgot' && 'Reset Password'}
            {authStep === 'reset' && 'Set Password'}
            {authStep === 'mfa' && 'MFA Verification'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 text-center">
            {authStep === 'login' && 'AI-powered SaaS Product Analytics'}
            {authStep === 'signup' && 'Start collecting client user events'}
            {authStep === 'forgot' && 'Enter your email to retrieve recovery key'}
            {authStep === 'reset' && 'Enter your reset token and new credentials'}
            {authStep === 'mfa' && 'Enter your authenticator 6-digit OTP (use 123456)'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-lg text-xs bg-accent-rose/10 border border-accent-rose/20 text-accent-rose font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-lg text-xs bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authStep === 'signup' && (
            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1.5 uppercase">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sarah Jenkins"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          )}

          {(authStep === 'login' || authStep === 'signup' || authStep === 'forgot') && (
            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1.5 uppercase">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@insightx.ai"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          )}

          {(authStep === 'login' || authStep === 'signup') && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs text-slate-400 font-semibold uppercase">Password</label>
                {authStep === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setError(null); setSuccessMsg(null); setAuthStep('forgot'); }}
                    className="text-[10px] text-brand-500 hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          )}

          {authStep === 'reset' && (
            <>
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1.5 uppercase">Reset Token</label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="rst-123456"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1.5 uppercase">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </>
          )}

          {authStep === 'mfa' && (
            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1.5 uppercase">Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-center font-mono text-white tracking-widest focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Processing...' : (
              <>
                {authStep === 'login' && 'Log In'}
                {authStep === 'signup' && 'Sign Up'}
                {authStep === 'forgot' && 'Send Reset Token'}
                {authStep === 'reset' && 'Save Password'}
                {authStep === 'mfa' && 'Verify & Enter'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          {authStep === 'login' ? (
            <button
              onClick={() => { setError(null); setSuccessMsg(null); setAuthStep('signup'); }}
              className="text-xs text-brand-500 hover:underline"
            >
              Don't have an account? Sign up
            </button>
          ) : (
            <button
              onClick={() => { setError(null); setSuccessMsg(null); setAuthStep('login'); }}
              className="text-xs text-brand-500 hover:underline"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. Modular Component Views
// ==========================================

// --- SIDEBAR ITEM ---
interface SidebarItemProps {
  label: string;
  tab: string;
  active: string;
  onClick: (tab: string) => void;
  icon: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ label, tab, active, onClick, icon }) => {
  const isSelected = active === tab;
  return (
    <button
      onClick={() => onClick(tab)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all relative ${
        isSelected
          ? 'text-white bg-brand-600/10 border-l-2 border-brand-500 pl-4'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
      }`}
    >
      <Icon name={icon} className={`w-4.5 h-4.5 ${isSelected ? 'text-brand-500' : 'text-slate-400'}`} />
      <span>{label}</span>
    </button>
  );
};

// --- KPI CARD ---
interface KpiCardProps {
  title: string;
  value: string | number;
  sub: string;
  trend: string;
  trendUp: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, sub, trend, trendUp }) => {
  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trendUp ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-accent-rose/10 text-accent-rose'}`}>
          {trend}
        </span>
      </div>
      <div className="mt-4">
        <h4 className="text-2xl font-bold text-white tracking-tight">{value}</h4>
        <p className="text-[10px] text-slate-500 mt-1">{sub}</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500/20 to-transparent"></div>
    </div>
  );
};

// --- DASHBOARD VIEW ---
interface LogEvent {
  id: string;
  event_name: string;
  timestamp: string;
  properties: Record<string, any>;
}

interface DashboardViewProps {
  apiKey: string;
  logEvents: LogEvent[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ apiKey: _apiKey, logEvents }) => {
  const { data, isLoading } = useDashboardMetrics();

  if (isLoading || !data) {
    return (
      <div className="h-96 flex items-center justify-center">
        <span className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-brand-500 animate-spin"></span>
      </div>
    );
  }

  const { metrics, distributions, series } = data;

  return (
    <div className="space-y-8">
      {/* Real-time Counter Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-xl gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Live Product Workspace</h3>
          <p className="text-xs text-slate-400 mt-0.5">Monitoring live telemetry stream pipelines.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-lg text-emerald-400 text-xs font-bold font-mono">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          <span>{metrics.realtime_users} ACTIVE USERS NOW</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Daily Active Users" value={metrics.dau} sub="Unique active users today" trend="+12.4%" trendUp={true} />
        <KpiCard title="Monthly Active Users" value={metrics.mau} sub="Unique active users 30d" trend="+8.2%" trendUp={true} />
        <KpiCard title="Total Stored Events" value={metrics.total_events.toLocaleString()} sub="Ingestion storage database" trend="+4.5%" trendUp={true} />
        <KpiCard title="Product Stickiness" value={`${metrics.stickiness}%`} sub="DAU / MAU engagement ratio" trend="Target 30%" trendUp={true} />
        
        <KpiCard title="Conversion Rate" value={`${metrics.conversion_rate}%`} sub="Ratio of Purchases to Sessions" trend="+1.2%" trendUp={true} />
        <KpiCard title="Avg Session Duration" value={`${Math.floor(metrics.avg_session_duration)}s`} sub="Mean active session time" trend="-15s" trendUp={false} />
        <KpiCard title="Bounce Rate" value={`${metrics.bounce_rate}%`} sub="Single page event sessions" trend="-2.4%" trendUp={true} />
        <KpiCard title="Total Revenue" value={`$${metrics.revenue.toLocaleString()}`} sub="Gross platform transactions" trend="+14.2%" trendUp={true} />
      </div>

      {/* AI Retention and Churn Card alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-xl flex justify-between items-center">
          <div>
            <strong className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Day 1 Retention Index</strong>
            <span className="text-2xl font-bold text-white block mt-1">{metrics.retention_rate}%</span>
          </div>
          <span className="text-[10px] bg-brand-500/10 text-brand-500 border border-brand-500/20 px-2 py-0.5 rounded font-bold">Stable</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-xl flex justify-between items-center">
          <div>
            <strong className="text-xs text-slate-500 block uppercase font-bold tracking-wider">AI Churn Warning Count</strong>
            <span className="text-2xl font-bold text-accent-rose block mt-1">{metrics.churn_count} users</span>
          </div>
          <span className="text-[10px] bg-accent-rose/10 text-accent-rose border border-accent-rose/20 px-2 py-0.5 rounded font-bold">High Risk</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-xl flex justify-between items-center">
          <div>
            <strong className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Average ARPU</strong>
            <span className="text-2xl font-bold text-accent-cyan block mt-1">${metrics.arpu}</span>
          </div>
          <span className="text-[10px] bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 px-2 py-0.5 rounded font-bold">MoM Growth</span>
        </div>
      </div>

      {/* Chart and distribution grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* DAU Chart */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider mb-6">Daily Active User Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series.dau_trend}>
                <defs>
                  <linearGradient id="dauGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="dau" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#dauGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Browser Dist */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl relative">
          <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider mb-6">Browser Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributions.browsers}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributions.browsers.map((_entry: any, index: number) => {
                    const colors = ['#6366f1', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-bold text-white">Browser</span>
              <span className="text-[10px] text-slate-500 uppercase">Share</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pages and Campaigns Table distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Pages */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Top Page Views</h3>
          <div className="divide-y divide-slate-800/40">
            {distributions.pages.map((p: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center py-2 text-xs">
                <span className="text-slate-300 font-mono font-medium">{p.name}</span>
                <span className="text-slate-500 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-850">{p.value} views</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Campaigns */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Top Referrer Campaigns</h3>
          <div className="divide-y divide-slate-800/40">
            {distributions.campaigns.map((c: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center py-2 text-xs">
                <span className="text-slate-300 font-medium">{c.name}</span>
                <span className="text-brand-400 font-bold bg-brand-500/5 px-2 py-0.5 rounded border border-brand-500/10">{c.value} sessions</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Devices, Countries and Live Ingestion stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Country distribution */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Top Countries</h3>
          <div className="divide-y divide-slate-800/40">
            {distributions.countries.map((c: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center py-2.5 text-xs">
                <span className="text-slate-300 font-semibold">{c.name}</span>
                <span className="text-slate-400">{c.value} hits</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live stream */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col h-64">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Live SDK Event Stream</h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded animate-pulse">
              Listening
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 text-xs font-mono">
            {logEvents.map((ev, i) => (
              <div key={ev.id || i} className="flex items-center justify-between py-1.5 px-3 rounded bg-slate-950/50 border border-slate-800/40 hover:border-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">{ev.timestamp}</span>
                  <span className="text-white font-semibold">{ev.event_name}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-400">
                  <span>{ev.properties.$browser}</span>
                  <span>{ev.properties.$device}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SDK PLAYGROUND ---
interface SDKPlaygroundProps {
  apiKey: string;
  setLogEvents: React.Dispatch<React.SetStateAction<LogEvent[]>>;
}

const SDKPlayground: React.FC<SDKPlaygroundProps> = ({ apiKey, setLogEvents }) => {
  const [activeEvent, setActiveEvent] = useState('Page View');
  const [customProps, setCustomProps] = useState('{\n  "title": "Pricing Plans Page",\n  "path": "/pricing",\n  "referrer": "https://google.com"\n}');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const presets: Record<string, string> = {
    'Page View': '{\n  "title": "Pricing Plans Page",\n  "path": "/pricing",\n  "referrer": "https://google.com"\n}',
    'Button Click': '{\n  "element_id": "btn-upgrade-pro",\n  "text": "Start Pro Trial",\n  "color": "indigo"\n}',
    'Scroll': '{\n  "depth_percentage": 75,\n  "max_height_px": 2800\n}',
    'Purchase': '{\n  "transaction_id": "tx-8827-01",\n  "amount": 99.00,\n  "currency": "USD",\n  "plan": "Enterprise"\n}',
    'Login': '{\n  "method": "Google SSO",\n  "mfa_used": true\n}',
    'Signup': '{\n  "method": "Email",\n  "campaign": "Summer Sale 2026"\n}',
    'Logout': '{\n  "session_duration_sec": 1840\n}',
    'Checkout': '{\n  "cart_items_count": 3,\n  "total_value": 149.97\n}',
    'Search': '{\n  "query": "cohort retention matrix",\n  "results_count": 8\n}',
    'Video Watch': '{\n  "video_title": "Onboarding Walkthrough",\n  "play_duration_sec": 84,\n  "completed": false\n}',
    'Feature Click': '{\n  "feature_key": "ai-mrr-forecast",\n  "tab": "AI Insights"\n}',
    'Form Submit': '{\n  "form_id": "form-team-invite",\n  "fields_count": 3,\n  "success": true\n}',
    'API Calls': '{\n  "endpoint": "/api/v1/analytics/dashboard",\n  "latency_ms": 142,\n  "status": 200\n}',
    'Errors': '{\n  "error_message": "Failed to read property metrics of null",\n  "severity": "critical",\n  "stack": "TypeError: Cannot read... at dashboard.js:14"\n}'
  };

  const handleSelectEvent = (name: string) => {
    setActiveEvent(name);
    setCustomProps(presets[name] || '{}');
  };

  const triggerSDKEvent = async (eventName: string) => {
    setLoading(true);
    setApiResponse(null);
    let parsedProps = {};
    try {
      if (customProps.trim()) {
        parsedProps = JSON.parse(customProps);
      }
    } catch (e: any) {
      setConsoleLogs(prev => [`[SDK Error] Invalid properties JSON syntax: ${e.message}`, ...prev]);
      setLoading(false);
      return;
    }

    const payload = {
      event_name: eventName,
      user_id: 'ix-demo-user-112',
      session_id: 'ix-demo-session-889',
      properties: {
        $browser: 'Chrome',
        $device: 'Desktop',
        $url: window.location.href,
        $referrer: '$direct',
        country: 'United States',
        ...parsedProps
      }
    };

    setConsoleLogs(prev => [`[SDK track] Sending event "${eventName}" with ${Object.keys(payload.properties).length} properties...`, ...prev]);

    try {
      const res = await api.post('/api/v1/track', payload, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      if (res.data.success) {
        setApiResponse(res.data);
        setConsoleLogs(prev => [`[Server response] 200 OK. event_id: ${res.data.event_id}`, ...prev]);
        setLogEvents(old => [{
          id: res.data.event_id,
          event_name: eventName,
          timestamp: new Date().toLocaleTimeString(),
          properties: payload.properties
        }, ...old]);
      }
    } catch (err: any) {
      setConsoleLogs(prev => [`[Server Error] ${err.response?.data?.detail || err.message}`, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const simulateException = () => {
    setConsoleLogs(prev => [`[SDK Autocapture] Simulating Javascript Exception...`, ...prev]);
    const errEvent = new ErrorEvent('error', {
      error: new TypeError('Cannot read properties of undefined (reading "metrics")'),
      message: 'Uncaught TypeError: Cannot read properties of undefined (reading "metrics")',
      filename: 'http://localhost:3000/src/dashboard.js',
      lineno: 14,
      colno: 32
    });
    window.dispatchEvent(errEvent);
    
    // Auto post the error telemetry log
    triggerSDKEvent('$error');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider mb-3">Install SDK snippet</h3>
          <pre className="bg-slate-950 p-4 rounded-lg text-xs font-mono border border-slate-800 text-brand-100 overflow-x-auto select-all">
{`<!-- InsightX Product Analytics -->
<script src="http://localhost:3000/sdk/insightx-sdk.js"></script>
<script>
  InsightX.init("${apiKey}");
</script>`}
          </pre>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Telemetry Event Sandbox</h3>
            <button
              onClick={simulateException}
              className="bg-accent-rose/10 hover:bg-accent-rose/20 text-accent-rose text-[10px] px-2.5 py-1 rounded font-bold border border-accent-rose/25"
            >
              Simulate JS Exception
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold mb-2 uppercase">Select Ingestion Event</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(presets).map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleSelectEvent(name)}
                    className={`text-[10px] font-semibold py-1.5 rounded transition-all border ${
                      activeEvent === name
                        ? 'bg-brand-500/15 text-white border-brand-500'
                        : 'bg-slate-850 hover:bg-slate-800 text-slate-400 border-slate-800/40'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-bold mb-2 uppercase">Custom Properties (JSON)</label>
              <textarea
                rows={5}
                value={customProps}
                onChange={(e) => setCustomProps(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-850 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <button
              onClick={() => triggerSDKEvent(activeEvent)}
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-semibold py-2 rounded-lg text-xs"
            >
              {loading ? 'Ingesting...' : `Fire Event "${activeEvent}"`}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider mb-4">SDK Console Logs</h3>
        <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-y-auto space-y-2 h-[340px]">
          {consoleLogs.map((log, i) => (
            <div key={i} className={`pb-1.5 border-b border-slate-900/50 ${log.includes('Error') ? 'text-accent-rose' : (log.includes('response') ? 'text-accent-emerald' : 'text-slate-300')}`}>
              {log}
            </div>
          ))}
        </div>
        {apiResponse && (
          <pre className="mt-4 p-4 rounded-lg bg-accent-emerald/5 border border-accent-emerald/25 text-[10px] font-mono text-slate-400">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

// --- FUNNELS VIEW ---
const FunnelsView: React.FC = () => {
  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null);
  const [newFunnelName, setNewFunnelName] = useState('');
  const [funnelSteps, setFunnelSteps] = useState<string[]>(['Page View']);
  const [isCreating, setIsCreating] = useState(false);

  const { data: funnelsList, refetch: refetchList } = useFunnelsList();
  const { data: funnelData, isLoading } = useFunnelMetrics(selectedFunnelId);
  const createFunnelMutation = useCreateFunnel();

  useEffect(() => {
    if (funnelsList && funnelsList.funnels.length > 0 && !selectedFunnelId) {
      setSelectedFunnelId(funnelsList.funnels[0].id);
    }
  }, [funnelsList]);

  const handleAddStep = () => {
    setFunnelSteps([...funnelSteps, 'Page View']);
  };

  const handleStepChange = (index: number, val: string) => {
    const updated = [...funnelSteps];
    updated[index] = val;
    setFunnelSteps(updated);
  };

  const handleRemoveStep = (index: number) => {
    if (funnelSteps.length <= 1) return;
    const updated = funnelSteps.filter((_, idx) => idx !== index);
    setFunnelSteps(updated);
  };

  const handleSaveFunnel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFunnelName.trim() || funnelSteps.length === 0) return;
    try {
      const res = await createFunnelMutation.mutateAsync({
        name: newFunnelName,
        steps: funnelSteps
      });
      if (res.success) {
        setNewFunnelName('');
        setFunnelSteps(['Page View']);
        setIsCreating(false);
        refetchList();
        setSelectedFunnelId(res.funnel.id);
      }
    } catch (err) {}
  };

  if (isLoading || !funnelData) {
    return (
      <div className="h-96 flex items-center justify-center">
        <span className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-brand-500 animate-spin"></span>
      </div>
    );
  }

  const standardEvents = [
    'Page View',
    'Signup',
    'Email Verify',
    'Subscription',
    'Payment',
    'Success',
    'Button Click',
    'Scroll',
    'Purchase',
    'Login',
    'Logout',
    'Checkout',
    'Search',
    'Video Watch',
    'Feature Click',
    'Form Submit',
    'API Calls',
    'Errors'
  ];

  return (
    <div className="space-y-8 bg-slate-900/40 border border-slate-800 rounded-xl p-8 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-2">Funnels conversion pipeline</h3>
          <p className="text-xs text-slate-400">Analyzes stage drop-offs from landing page to purchase success.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {funnelsList && (
            <select
              value={selectedFunnelId || ''}
              onChange={(e) => setSelectedFunnelId(e.target.value)}
              className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              {funnelsList.funnels.map((f: any) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-1.5 px-3.5 rounded-lg shrink-0"
          >
            {isCreating ? 'Cancel Builder' : 'Create Custom Funnel'}
          </button>
        </div>
      </div>

      {isCreating && (
        <form onSubmit={handleSaveFunnel} className="bg-slate-950 border border-slate-850 p-6 rounded-xl space-y-4">
          <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">Funnel Builder Configurator</h4>
          <div>
            <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Funnel Flow Name</label>
            <input
              type="text"
              required
              value={newFunnelName}
              onChange={(e) => setNewFunnelName(e.target.value)}
              placeholder="E.g. Onboarding conversion funnel..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] text-slate-500 font-bold uppercase">Define Funnel Stages</label>
            {funnelSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-bold shrink-0 min-w-[50px]">Step {idx + 1}</span>
                <select
                  value={step}
                  onChange={(e) => handleStepChange(idx, e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  {standardEvents.map((evt) => (
                    <option key={evt} value={evt}>
                      {evt}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveStep(idx)}
                  className="bg-accent-rose/10 hover:bg-accent-rose/25 text-accent-rose text-[10px] font-bold p-1.5 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddStep}
              className="text-[10px] text-brand-400 hover:underline font-bold mt-1 block"
            >
              + Add Step Event
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2 rounded-lg text-xs"
          >
            Save and Build Funnel
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData.stages}>
              <CartesianGrid stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]}>
                {funnelData.stages.map((_entry: any, index: number) => {
                  const colors = ['#6366f1', '#4f46e5', '#8b5cf6', '#06b6d4', '#10b981'];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          {funnelData.stages.map((st: any, i: number) => (
            <div key={i} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Step {st.step}</span>
                <span className="text-xs text-white font-semibold">{st.name}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-white font-bold block">{st.count} users</span>
                <span className="text-[10px] text-accent-cyan">Reach: {st.completion_rate}%</span>
                {i > 0 && (
                  <span className="text-[10px] text-accent-rose block">Drop: {st.drop_rate}%</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- RETENTION VIEW ---
const RetentionView: React.FC = () => {
  const [granularity, setGranularity] = useState('day');
  const [type, setType] = useState('classic');
  const [country, setCountry] = useState('');
  const [device, setDevice] = useState('');
  const [browser, setBrowser] = useState('');
  const [campaign, setCampaign] = useState('');
  const [feature, setFeature] = useState('');
  const [signupMonth, setSignupMonth] = useState('');
  const [paying, setPaying] = useState('');

  // Collect params object, discarding empty parameters
  const params: Record<string, string> = { granularity, type };
  if (country) params.country = country;
  if (device) params.device = device;
  if (browser) params.browser = browser;
  if (campaign) params.campaign = campaign;
  if (feature) params.feature = feature;
  if (signupMonth) params.signup_month = signupMonth;
  if (paying) params.paying = paying;

  const { data, isLoading } = useRetentionCohorts(params);

  if (isLoading || !data) {
    return (
      <div className="h-96 flex items-center justify-center">
        <span className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-brand-500 animate-spin"></span>
      </div>
    );
  }

  const getHeatmapColor = (rate: number) => {
    if (rate === 100) return 'bg-brand-700/80 text-white';
    if (rate > 50) return 'bg-brand-600/60 text-white';
    if (rate > 30) return 'bg-brand-500/40 text-brand-100';
    if (rate > 15) return 'bg-brand-500/20 text-slate-300';
    if (rate > 0) return 'bg-brand-500/10 text-slate-400';
    return 'bg-slate-950 text-slate-600';
  };

  const getHeaderLabel = (interval: number) => {
    if (granularity === 'week') return `Week ${interval}`;
    if (granularity === 'month') return `Month ${interval}`;
    return `Day ${interval}`;
  };

  return (
    <div className="space-y-6">
      {/* Configuration Controls & Filters */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Cohort Retention Analysis</h3>
            <p className="text-xs text-slate-450 mt-0.5">Toggle granularities, models, and slice user metrics.</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value)}
              className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              <option value="day">Daily intervals</option>
              <option value="week">Weekly intervals</option>
              <option value="month">Monthly intervals</option>
            </select>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              <option value="classic">Classic Retention</option>
              <option value="rolling">Rolling Retention</option>
            </select>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          <div>
            <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">Country</label>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[11px] text-slate-300">
              <option value="">All Countries</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">Device</label>
            <select value={device} onChange={(e) => setDevice(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[11px] text-slate-300">
              <option value="">All Devices</option>
              <option value="Desktop">Desktop</option>
              <option value="Mobile">Mobile</option>
              <option value="Tablet">Tablet</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">Browser</label>
            <select value={browser} onChange={(e) => setBrowser(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[11px] text-slate-300">
              <option value="">All Browsers</option>
              <option value="Chrome">Chrome</option>
              <option value="Safari">Safari</option>
              <option value="Firefox">Firefox</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">Campaign</label>
            <select value={campaign} onChange={(e) => setCampaign(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[11px] text-slate-300">
              <option value="">All Campaigns</option>
              <option value="Google_Ads">Google Ads</option>
              <option value="Newsletter">Newsletter</option>
              <option value="Direct">Direct Referrals</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">Feature Event</label>
            <select value={feature} onChange={(e) => setFeature(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[11px] text-slate-300">
              <option value="">Any Interaction</option>
              <option value="Page View">Page View</option>
              <option value="Purchase">Purchase Completed</option>
              <option value="Signup">Signup Completed</option>
              <option value="Errors">Script Errors</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">Signup Cohort</label>
            <select value={signupMonth} onChange={(e) => setSignupMonth(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[11px] text-slate-300">
              <option value="">Any Signup Month</option>
              <option value="2026-06">June 2026</option>
              <option value="2026-07">July 2026</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">Revenue (Role)</label>
            <select value={paying} onChange={(e) => setPaying(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[11px] text-slate-300">
              <option value="">All Users</option>
              <option value="1">Paying (Admin)</option>
              <option value="0">Free Account</option>
            </select>
          </div>
        </div>
      </div>

      {/* Heatmap Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-3 px-4 uppercase tracking-wider font-bold">Cohort Interval</th>
              <th className="py-3 px-4 uppercase tracking-wider font-bold">Cohort Size</th>
              {data.intervals.map((interval: number) => (
                <th key={interval} className="py-3 px-4 uppercase tracking-wider font-bold text-center">
                  {getHeaderLabel(interval)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {data.cohorts.map((ch: any, idx: number) => (
              <tr key={idx} className="hover:bg-slate-900/20 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-white">{ch.cohort}</td>
                <td className="py-3.5 px-4 text-slate-400 font-medium">{ch.size} users</td>
                {data.intervals.map((interval: number) => {
                  const rateVal = ch.rates[`interval_${interval}`] ?? 0;
                  return (
                    <td
                      key={interval}
                      className={`py-3.5 px-4 text-center font-bold font-mono transition-colors ${getHeatmapColor(rateVal)}`}
                    >
                      {rateVal}%
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- EXPERIMENTS VIEW ---
const ExperimentsView: React.FC = () => {
  const [subTab, setSubTab] = useState<'ab' | 'flags'>('ab');

  // A/B states
  const [selectedExpId, setSelectedExpId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newExpName, setNewExpName] = useState('');
  const [newMetric, setNewMetric] = useState('Purchase');
  const [trafficSplit, setTrafficSplit] = useState(50);
  const [controlFlag, setControlFlag] = useState('checkout-control');
  const [variationFlag, setVariationFlag] = useState('checkout-variation');
  const [hypothesis, setHypothesis] = useState('');

  const { data: expList } = useExperimentsList();
  const { data: results, isLoading, refetch } = useExperimentResults(selectedExpId || undefined);
  const createExpMutation = useCreateExperiment();

  // Flags states
  const [isCreatingFlag, setIsCreatingFlag] = useState(false);
  const [newFlagKey, setNewFlagKey] = useState('');
  const [newFlagDesc, setNewFlagDesc] = useState('');
  const [newFlagRollout, setNewFlagRollout] = useState(100);
  const [betaUsersInput, setBetaUsersInput] = useState<Record<string, string>>({}); 

  const { data: flagsList, refetch: refetchFlags } = useFeatureFlagsList();
  const createFlagMutation = useCreateFeatureFlag();
  const toggleFlagMutation = useToggleFeatureFlag();
  const updateRolloutMutation = useUpdateFlagRollout();
  const updateBetaMutation = useUpdateFlagBeta();

  useEffect(() => {
    if (expList?.experiments?.length > 0 && !selectedExpId) {
      setSelectedExpId(expList.experiments[0].id);
    }
  }, [expList, selectedExpId]);

  const handleSaveExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpName) return;

    createExpMutation.mutate({
      name: newExpName,
      metric_name: newMetric,
      traffic_split: trafficSplit,
      control_flag_id: controlFlag,
      variation_flag_id: variationFlag,
      hypothesis_text: hypothesis
    }, {
      onSuccess: (data: any) => {
        setIsCreating(false);
        setNewExpName('');
        setHypothesis('');
        if (data.experiment_id) {
          setSelectedExpId(data.experiment_id);
        }
      }
    });
  };

  const handleSaveFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlagKey) return;

    createFlagMutation.mutate({
      key: newFlagKey,
      description: newFlagDesc,
      rollout_percentage: newFlagRollout,
      active: 1
    }, {
      onSuccess: () => {
        setIsCreatingFlag(false);
        setNewFlagKey('');
        setNewFlagDesc('');
        refetchFlags();
      }
    });
  };

  const handleSaveBetaUsers = (flagId: string) => {
    const input = betaUsersInput[flagId] || '';
    const users = input.split(',').map(u => u.trim()).filter(Boolean);
    updateBetaMutation.mutate({ id: flagId, rules: users }, {
      onSuccess: () => {
        refetchFlags();
      }
    });
  };

  const standardMetrics = ['Page View', 'Signup', 'Login', 'Purchase', 'Checkout', 'Success', 'Errors'];

  return (
    <div className="space-y-6">
      {/* Sidebar Sub Tab Selector */}
      <div className="flex border-b border-slate-800 pb-2 gap-4">
        <button
          onClick={() => setSubTab('ab')}
          className={`pb-2 px-1 text-xs font-bold transition-all relative ${
            subTab === 'ab' ? 'text-white border-b-2 border-brand-500' : 'text-slate-500 hover:text-white'
          }`}
        >
          A/B Testing Experiments
        </button>
        <button
          onClick={() => setSubTab('flags')}
          className={`pb-2 px-1 text-xs font-bold transition-all relative ${
            subTab === 'flags' ? 'text-white border-b-2 border-brand-500' : 'text-slate-500 hover:text-white'
          }`}
        >
          Feature Flags Rollout
        </button>
      </div>

      {subTab === 'ab' ? (
        <div className="space-y-8 bg-slate-900/40 border border-slate-800 rounded-xl p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">A/B Testing & Feature Flags</h3>
              <p className="text-xs text-slate-400">Statistical calculations for conversion variances and revenue impacts.</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {expList?.experiments?.length > 0 && (
                <select
                  value={selectedExpId || ''}
                  onChange={(e) => setSelectedExpId(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  {expList.experiments.map((exp: any) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-1.5 px-3.5 rounded-lg shrink-0"
              >
                {isCreating ? 'Cancel' : 'Create Custom Experiment'}
              </button>
            </div>
          </div>

          {isCreating && (
            <form onSubmit={handleSaveExperiment} className="bg-slate-950 border border-slate-850 p-6 rounded-xl space-y-4">
              <h4 className="font-bold text-xs text-slate-355 uppercase tracking-wider">A/B Experiment Configurator</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Experiment Name</label>
                  <input
                    type="text"
                    required
                    value={newExpName}
                    onChange={(e) => setNewExpName(e.target.value)}
                    placeholder="E.g. Pricing Page Redesign V2..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Goal Metric Event</label>
                  <select
                    value={newMetric}
                    onChange={(e) => setNewMetric(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {standardMetrics.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Traffic Split (Variation split)</label>
                  <span className="text-xs text-brand-400 font-mono font-bold">{100 - trafficSplit}% Control / {trafficSplit}% Variation</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={trafficSplit}
                  onChange={(e) => setTrafficSplit(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Control Flag Key</label>
                  <input
                    type="text"
                    value={controlFlag}
                    onChange={(e) => setControlFlag(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Variation Flag Key</label>
                  <input
                    type="text"
                    value={variationFlag}
                    onChange={(e) => setVariationFlag(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Hypothesis Notes</label>
                <textarea
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  placeholder="Changing primary buttons from blue to red will increase purchase rate..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={createExpMutation.isPending}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs"
              >
                {createExpMutation.isPending ? 'Launching...' : 'Activate & Run Experiment'}
              </button>
            </form>
          )}

          {isLoading ? (
            <div className="h-60 flex items-center justify-center">
              <span className="w-8 h-8 rounded-full border-4 border-slate-800 border-t-brand-500 animate-spin"></span>
            </div>
          ) : results ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-up">
              <div className="space-y-4">
                <div className="p-5 bg-slate-950 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Group A: Control ({100 - (results.traffic_split || 50)}% Split)</h4>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-slate-900 text-slate-400 font-bold border border-slate-800">Baseline</span>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <div>
                      <span className="text-3xl font-extrabold text-white tracking-tight">{results.variants.control.rate}%</span>
                      <span className="text-[10px] text-slate-500 block mt-1">Conversion rate</span>
                    </div>
                    <div className="text-right text-xs text-slate-400 font-medium">
                      <span>{results.variants.control.conversions} / {results.variants.control.visitors} converted</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-950 rounded-xl border border-brand-500/20">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-3">Group B: Variation ({results.traffic_split || 50}% Split)</h4>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-brand-500/10 text-brand-400 font-bold border border-brand-500/20">Active</span>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <div>
                      <span className="text-3xl font-extrabold text-white tracking-tight">{results.variants.variation.rate}%</span>
                      <span className="text-[10px] text-slate-500 block mt-1">Conversion rate</span>
                    </div>
                    <div className="text-right text-xs text-slate-400 font-medium">
                      <span>{results.variants.variation.conversions} / {results.variants.variation.visitors} converted</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between text-xs border-b border-slate-900/50 pb-2.5">
                    <span className="text-slate-400 font-medium">Z-Score Statistic</span>
                    <strong className="text-white font-mono">{results.stats.z_score}</strong>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-900/50 pb-2.5">
                    <span className="text-slate-400 font-medium">P-Value Significance</span>
                    <strong className="text-white font-mono">{results.stats.p_value}</strong>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-900/50 pb-2.5">
                    <span className="text-slate-400 font-medium">Relative Conversion Lift</span>
                    <strong className={`font-bold font-mono ${results.stats.lift >= 0 ? 'text-accent-cyan' : 'text-accent-rose'}`}>
                      {results.stats.lift >= 0 ? '+' : ''}{results.stats.lift}%
                    </strong>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-900/50 pb-2.5">
                    <span className="text-slate-400 font-medium">Confidence Margin (Sig. Threshold)</span>
                    <strong className={`font-bold ${results.stats.is_significant ? 'text-accent-emerald' : 'text-slate-500'}`}>
                      {results.stats.confidence}% (95% Sig.)
                    </strong>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-900/50 pb-2.5">
                    <span className="text-slate-400 font-medium">Estimated LTV Revenue Impact</span>
                    <strong className="text-accent-emerald font-bold font-mono">
                      +${results.stats.revenue_impact?.toLocaleString() || '0.00'} LTV
                    </strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Hypothesis Winner</span>
                    <strong className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      results.stats.winner.includes('Variation') ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' :
                      results.stats.winner.includes('Control') ? 'bg-slate-900 text-slate-400 border border-slate-800' :
                      'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    }`}>
                      {results.stats.winner}
                    </strong>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className={`flex-1 p-3 rounded-lg text-xs font-semibold ${
                    results.stats.is_significant 
                      ? 'bg-accent-emerald/10 border border-accent-emerald/25 text-accent-emerald' 
                      : 'bg-yellow-500/10 border border-yellow-500/25 text-yellow-500'
                  }`}>
                    {results.stats.is_significant 
                      ? `✔ Statistical significance reached! ${results.stats.winner} is the clear conversion winner.`
                      : `⌛ Sample sizes insufficient or lift too low. Keep running experiment.`}
                  </div>
                  <button 
                    onClick={() => refetch()} 
                    className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-lg p-2.5 shrink-0"
                    title="Recalculate A/B conversion rates"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 italic">
              No A/B experiments configured yet. Click "Create Custom Experiment" above to deploy one.
            </div>
          )}
        </div>
      ) : (
        /* Feature flags panel */
        <div className="space-y-6 bg-slate-900/40 border border-slate-800 rounded-xl p-8 shadow-xl">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Feature Flags Rollout Panel</h3>
              <p className="text-xs text-slate-400">Control feature visibility, configure percentage rollouts, whitelists, and kill switches.</p>
            </div>
            <button
              onClick={() => setIsCreatingFlag(!isCreatingFlag)}
              className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-1.5 px-3.5 rounded-lg shrink-0"
            >
              {isCreatingFlag ? 'Cancel' : 'Register Feature Flag'}
            </button>
          </div>

          {isCreatingFlag && (
            <form onSubmit={handleSaveFlag} className="bg-slate-950 border border-slate-850 p-6 rounded-xl space-y-4">
              <h4 className="font-bold text-xs text-slate-355 uppercase tracking-wider">New Feature Flag</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Flag Key Identifier</label>
                  <input
                    type="text"
                    required
                    value={newFlagKey}
                    onChange={(e) => setNewFlagKey(e.target.value)}
                    placeholder="E.g. checkout-new-ui..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Rollout Percentage</label>
                  <select
                    value={newFlagRollout}
                    onChange={(e) => setNewFlagRollout(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="10">10% Rollout</option>
                    <option value="25">25% Rollout</option>
                    <option value="50">50% Rollout</option>
                    <option value="75">75% Rollout</option>
                    <option value="100">100% Rollout (Full Release)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Description</label>
                <input
                  type="text"
                  value={newFlagDesc}
                  onChange={(e) => setNewFlagDesc(e.target.value)}
                  placeholder="Control new checkout layout for users..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={createFlagMutation.isPending}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs"
              >
                {createFlagMutation.isPending ? 'Saving...' : 'Create Flag'}
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 gap-6">
            {flagsList?.flags?.map((flag: any) => {
              const rules = JSON.parse(flag.rules || '[]');
              const isEnabled = flag.active === 1;

              return (
                <div key={flag.id} className="p-5 bg-slate-950 rounded-xl border border-slate-855 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <strong className="text-white text-sm font-mono">{flag.key}</strong>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isEnabled ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20' : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}>
                        {isEnabled ? 'Enabled' : 'Disabled / Killed'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-405">{flag.description || 'No description provided'}</p>
                    
                    <div className="pt-2 flex items-center gap-3">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0">Beta Tester Whitelist:</span>
                      <input
                        type="text"
                        placeholder="usr-1, usr-2 (comma separated)"
                        value={betaUsersInput[flag.id] !== undefined ? betaUsersInput[flag.id] : rules.join(', ')}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBetaUsersInput(prev => ({ ...prev, [flag.id]: val }));
                        }}
                        className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-white focus:outline-none w-52"
                      />
                      <button
                        onClick={() => handleSaveBetaUsers(flag.id)}
                        className="bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-800 rounded px-2.5 py-1"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="space-y-1 w-36">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>Rollout:</span>
                        <span className="text-brand-400 font-mono">{flag.rollout_percentage}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={flag.rollout_percentage}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          updateRolloutMutation.mutate({ id: flag.id, rollout_percentage: val }, {
                            onSuccess: () => refetchFlags()
                          });
                        }}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                      />
                    </div>

                    <button
                      onClick={() => {
                        toggleFlagMutation.mutate({ id: flag.id, active: !isEnabled }, {
                          onSuccess: () => refetchFlags()
                        });
                      }}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        isEnabled ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-brand-500/10 border-brand-500/20 text-brand-400 hover:bg-brand-500/20'
                      }`}
                    >
                      {isEnabled ? 'Disable' : 'Enable'}
                    </button>

                    {isEnabled && (
                      <button
                        onClick={() => {
                          toggleFlagMutation.mutate({ id: flag.id, active: false }, {
                            onSuccess: () => {
                              updateRolloutMutation.mutate({ id: flag.id, rollout_percentage: 0 }, {
                                onSuccess: () => refetchFlags()
                              });
                            }
                          });
                        }}
                        className="bg-accent-rose hover:bg-accent-rose/85 text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-accent-rose/30 shadow-md shadow-accent-rose/10"
                        title="Halt feature rollout instantly"
                      >
                        Kill Switch
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {(!flagsList?.flags || flagsList.flags.length === 0) && (
              <div className="text-center py-6 text-slate-500 italic">
                No feature flags registered yet. Register one above to configure rollouts.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- USER JOURNEYS ---
const JourneysView: React.FC = () => {
  const { data, isLoading } = useUserJourney();

  if (isLoading || !data) {
    return (
      <div className="h-96 flex items-center justify-center">
        <span className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-brand-500 animate-spin"></span>
      </div>
    );
  }

  const { stages } = data;
  const colors = [
    'border-brand-500',
    'border-accent-violet',
    'border-accent-cyan',
    'border-accent-violet',
    'border-brand-500',
    'border-accent-emerald'
  ];

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 shadow-xl">
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white mb-2">User Journey Visual Flow</h3>
        <p className="text-xs text-slate-400">Chronological analysis of the standard conversion path with structural drop-offs computed in real-time.</p>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 py-6 overflow-x-auto relative">
        {stages.map((stage: any, idx: number) => (
          <React.Fragment key={idx}>
            {idx > 0 && <JourneyArrow drop={stage.drop} />}
            <JourneyNode
              step={String(idx + 1)}
              name={stage.name}
              value={`${stage.count} users`}
              activePercent={stage.reach}
              color={colors[idx % colors.length]}
            />
          </React.Fragment>
        ))}
      </div>

      <div className="mt-8 bg-slate-950/80 p-5 rounded-lg border border-slate-800">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-rose"></span>
          Journey Drop-off Analysis Notes
        </h4>
        <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
          <li>The conversion reaches <strong>{stages[stages.length - 1].reach}</strong> at the final <strong>{stages[stages.length - 1].name}</strong> stage.</li>
          <li>Real-time database records show <strong>{stages[0].count}</strong> entry users, dropping to <strong>{stages[stages.length - 1].count}</strong> conversion users.</li>
          <li>Use the event simulator in the SDK Sandbox tab to fire events and watch conversions update dynamically!</li>
        </ul>
      </div>
    </div>
  );
};

const JourneyNode: React.FC<{ step: string; name: string; value: string; activePercent: string; color: string }> = ({ step, name, value, activePercent, color }) => (
  <div className={`w-44 bg-slate-950/80 border ${color} rounded-xl p-4 shadow-lg flex flex-col items-center text-center shrink-0`}>
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Stage {step}</span>
    <h4 className="text-xs font-bold text-white mb-2 leading-tight h-8 flex items-center">{name}</h4>
    <div className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs">
      <span className="text-white font-semibold">{value}</span>
      <span className="text-[10px] text-slate-400 block mt-0.5">Reach: {activePercent}</span>
    </div>
  </div>
);

const JourneyArrow: React.FC<{ drop: string }> = ({ drop }) => (
  <div className="flex flex-col items-center justify-center shrink-0 py-2 animate-fade-in">
    <div className="flex items-center">
      <div className="w-8 h-0.5 bg-slate-700"></div>
      <div className="w-2 h-2 border-t-2 border-r-2 border-slate-700 rotate-45 -ml-1"></div>
    </div>
    <span className="text-[10px] font-bold text-accent-rose bg-accent-rose/10 border border-accent-rose/20 px-2 py-0.5 rounded mt-2">
      -{drop} drop
    </span>
  </div>
);

// --- USER SEGMENTATION VIEW ---
const SegmentationView: React.FC = () => {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [device, setDevice] = useState('');
  const [browser, setBrowser] = useState('');
  const [language, setLanguage] = useState('');
  const [plan, setPlan] = useState('');
  const [revenue, setRevenue] = useState('');
  const [event, setEvent] = useState('');

  const params: Record<string, string> = {};
  if (age) params.age = age;
  if (gender) params.gender = gender;
  if (country) params.country = country;
  if (city) params.city = city;
  if (device) params.device = device;
  if (browser) params.browser = browser;
  if (language) params.language = language;
  if (plan) params.plan = plan;
  if (revenue) params.revenue = revenue;
  if (event) params.event = event;

  const { data, isLoading } = useUserSegmentation(params);

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">User Segmentation Engine</h3>
          <p className="text-xs text-slate-450 mt-0.5">Filter user cohorts dynamically based on demographic and interaction traits.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-xs">
          <div>
            <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">Age Range</label>
            <select value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none">
              <option value="">All Ages</option>
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35-44">35-44</option>
              <option value="45+">45+</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-355 focus:outline-none">
              <option value="">All Genders</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">Country</label>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none">
              <option value="">All Countries</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Germany">Germany</option>
              <option value="Japan">Japan</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">City</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none">
              <option value="">All Cities</option>
              <option value="San Francisco">San Francisco</option>
              <option value="London">London</option>
              <option value="Toronto">Toronto</option>
              <option value="Berlin">Berlin</option>
              <option value="Tokyo">Tokyo</option>
              <option value="New York">New York</option>
              <option value="Manchester">Manchester</option>
              <option value="Vancouver">Vancouver</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">Device</label>
            <select value={device} onChange={(e) => setDevice(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none">
              <option value="">All Devices</option>
              <option value="Desktop">Desktop</option>
              <option value="Mobile">Mobile</option>
              <option value="Tablet">Tablet</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">Browser</label>
            <select value={browser} onChange={(e) => setBrowser(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none">
              <option value="">All Browsers</option>
              <option value="Chrome">Chrome</option>
              <option value="Safari">Safari</option>
              <option value="Firefox">Firefox</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none">
              <option value="">All Languages</option>
              <option value="en">en (English)</option>
              <option value="de">de (German)</option>
              <option value="ja">ja (Japanese)</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">Billing Plan</label>
            <select value={plan} onChange={(e) => setPlan(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none">
              <option value="">All Plans</option>
              <option value="Free">Free</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">Min Revenue ($)</label>
            <select value={revenue} onChange={(e) => setRevenue(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none">
              <option value="">No Minimum</option>
              <option value="50">Min $50</option>
              <option value="100">Min $100</option>
              <option value="200">Min $200</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-slate-500 font-bold mb-1 uppercase">Performed Event</label>
            <select value={event} onChange={(e) => setEvent(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none">
              <option value="">Any Event</option>
              <option value="Page View">Page View</option>
              <option value="Signup">Signup</option>
              <option value="Login">Login</option>
              <option value="Purchase">Purchase</option>
              <option value="Errors">Errors</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List heat-table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        {isLoading ? (
          <div className="h-48 flex items-center justify-center">
            <span className="w-8 h-8 rounded-full border-4 border-slate-800 border-t-brand-500 animate-spin"></span>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Segment Count: <strong>{data?.users?.length || 0} users matched</strong></span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="py-2.5 px-3 uppercase tracking-wider font-bold">User</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-bold text-center">Age / Gender</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-bold">Location</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-bold text-center">Language</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-bold text-center">Specs</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-bold text-center">Plan</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-bold text-right">LTV Revenue</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-bold text-right">Total Events</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/40">
                  {data?.users?.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-900/10 transition-colors">
                      <td className="py-3 px-3">
                        <span className="text-white font-semibold block">{u.full_name || 'Anonymous'}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">{u.email}</span>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-300 font-medium">
                        {u.age}y / {u.gender}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {u.city}, {u.country}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-accent-cyan font-mono">
                        {u.language}
                      </td>
                      <td className="py-3 px-3 text-center text-[10px] text-slate-500">
                        {u.device} / {u.browser}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.plan === 'Enterprise' ? 'bg-accent-violet/10 text-accent-violet border border-accent-violet/20' :
                          u.plan === 'Pro' ? 'bg-brand-500/10 text-brand-500 border border-brand-500/20' :
                          'bg-slate-800 text-slate-400 border border-slate-700/50'
                        }`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-accent-emerald font-bold font-mono">
                        ${u.revenue.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right text-white font-semibold font-mono">
                        {u.events_count}
                      </td>
                    </tr>
                  ))}
                  {data?.users?.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                        No users match the selected segmentation parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- AI VIEW ---
const AIView: React.FC = () => {
  const { data: churnData } = usePredictChurn();
  const { data: forecastData } = useRevenueForecast();
  const { data: insightsData } = useAiInsights();
  const { data: clusteringData } = useAiUserClustering();
  const { data: recommendationsData } = useAiFeatureRecommendations();
  const askMutation = useAskAiMutation();

  const [inputVal, setInputVal] = useState('');
  const [qaThread, setQaThread] = useState<Array<{ q: string; a: string }>>([
    { q: 'Why did conversion drop?', a: 'Based on the evaluation of tracked events in the database, checkout conversion dropped by 15.2% due to a critical payment bug where Mobile Safari users abandoned payment at the checkout event. Meanwhile, overall conversion revenue increased because referral traffic grew.' }
  ]);

  const handleAsk = () => {
    if (!inputVal.trim()) return;
    const userQ = inputVal;
    setInputVal('');
    
    askMutation.mutate(userQ, {
      onSuccess: (res) => {
        setQaThread(prev => [...prev, { q: userQ, a: res.answer }]);
      }
    });
  };

  const nextWeekMrr = forecastData?.full_series?.[6]?.amount || 14690;
  const nextMonthMrr = forecastData?.full_series?.[9]?.amount || 16010;
  const nextQuarterMrr = 14250 + (forecastData?.slope || 440) * 12;

  return (
    <div className="space-y-8">
      {/* 1. Forecasting & Growth Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-up">
        {/* Prophet Line Chart */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-355 uppercase tracking-wider mb-1">Prophet MRR Forecasting</h3>
            <p className="text-[10px] text-slate-500 uppercase mb-6">Facebook Prophet Time Series projections</p>
          </div>
          <div className="h-60">
            {forecastData && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData.full_series}>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={(props: any) => {
                    const isFore = props.payload.type === 'Forecast';
                    return <circle cx={props.cx} cy={props.cy} r={4} fill={isFore ? "#f59e0b" : "#10b981"} stroke="none" />;
                  }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Forecast cards */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider mb-1">MRR Forecast Targets</h3>
            <p className="text-[10px] text-slate-500 uppercase mb-4">Projected financial horizons</p>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Next Week</span>
                <span className="text-base font-bold text-white font-mono">${nextWeekMrr.toLocaleString()}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-cyan/15 text-accent-cyan">+3.1%</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Next Month</span>
                <span className="text-base font-bold text-white font-mono">${nextMonthMrr.toLocaleString()}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-400">+12.4%</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Next Quarter</span>
                <span className="text-base font-bold text-white font-mono">${nextQuarterMrr.toLocaleString()}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-emerald/15 text-accent-emerald">+37.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. User Churn & User Clustering Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Churn Risk Calculator (XGBoost) */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">XGBoost Churn Risk Calculator</h3>
            <p className="text-xs text-slate-450 mt-0.5">Calculates churn probability based on event velocity and inactive days.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="py-2.5 px-3 uppercase tracking-wider font-bold">User ID</th>
                  <th className="py-2.5 px-3 uppercase tracking-wider font-bold text-center">Days Inactive</th>
                  <th className="py-2.5 px-3 uppercase tracking-wider font-bold text-center">Risk level</th>
                  <th className="py-2.5 px-3 uppercase tracking-wider font-bold text-right">Probability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/40">
                {churnData?.predictions?.map((pred: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-900/10">
                    <td className="py-3 px-3">
                      <span className="text-white font-semibold block">{pred.user_id}</span>
                      <span className="text-[10px] text-slate-505 block">{pred.recommendation}</span>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-400 font-medium font-mono">{pred.days_inactive} days</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pred.risk_level === 'High Risk' ? 'bg-accent-rose/10 text-accent-rose' :
                        pred.risk_level === 'Moderate Risk' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-accent-emerald/10 text-accent-emerald'
                      }`}>
                        {pred.risk_level}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold font-mono text-white">
                      {pred.churn_probability}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Clustering Breakdown */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">AI User Clustering</h3>
            <p className="text-xs text-slate-450 mt-0.5">Identifies product user profiles utilizing unsupervised k-means metrics.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="py-2.5 px-3 uppercase tracking-wider font-bold">User ID</th>
                  <th className="py-2.5 px-3 uppercase tracking-wider font-bold text-center">Cohort Cluster</th>
                  <th className="py-2.5 px-3 uppercase tracking-wider font-bold text-right">Event Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/40">
                {clusteringData?.clusters?.slice(0, 5).map((cl: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-900/10">
                    <td className="py-3 px-3">
                      <span className="text-white font-semibold block">{cl.user_id}</span>
                      <span className="text-[10px] text-slate-500 block">{cl.description}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cl.cluster === 'Power Users' ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/20' :
                        cl.cluster === 'Premium' ? 'bg-accent-violet/15 text-accent-violet border border-accent-violet/20' :
                        cl.cluster === 'New Users' ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20' :
                        'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}>
                        {cl.cluster}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold font-mono text-white">
                      {cl.event_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Feature Recommendations & Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommendations */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">AI Feature Recommendations</h3>
            <p className="text-xs text-slate-450 mt-0.5">Prioritize, remove, or improve active features based on telemetry signals.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendationsData?.recommendations?.map((rec: any) => (
              <div key={rec.id} className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex flex-col justify-between space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    rec.action.includes('Remove') ? 'bg-accent-rose/10 text-accent-rose' :
                    rec.action.includes('Improve') ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-accent-cyan/10 text-accent-cyan'
                  }`}>
                    {rec.action}
                  </span>
                  <span className={`text-[9px] font-bold ${
                    rec.priority === 'High' ? 'text-accent-rose' : 'text-slate-500'
                  }`}>{rec.priority} Priority</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">{rec.feature}</h4>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{rec.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight Diagnostics */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">AI Diagnostics</h3>
            <p className="text-xs text-slate-450 mt-0.5">Automated signal anomaly analysis</p>
          </div>
          <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1">
            {insightsData?.insights.map((ins: any) => (
              <div key={ins.id} className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                <div className="flex justify-between items-center mb-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    ins.type === 'anomaly' ? 'bg-accent-rose/10 text-accent-rose' :
                    ins.type === 'alert' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-accent-cyan/10 text-accent-cyan'
                  }`}>
                    {ins.type}
                  </span>
                  <span className="text-[9px] font-bold text-slate-505">{ins.severity} Severity</span>
                </div>
                <h4 className="font-bold text-white text-xs">{ins.title}</h4>
                <p className="text-slate-400 mt-1">{ins.detail}</p>
                <div className="mt-2 text-[10px] text-slate-505 font-semibold">{ins.impact}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. NLP Assistant (Root Cause Analyser) */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">NLP Analytical Assistant</h3>
          <p className="text-xs text-slate-450 mt-0.5">Ask questions about conversions, churn, or revenue forecasts to trace root causes.</p>
        </div>
        
        <div className="space-y-4 max-h-60 overflow-y-auto mb-4 p-4 bg-slate-950/60 rounded-xl border border-slate-850">
          {qaThread.map((chat, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-right">
                <span className="inline-block bg-brand-600 px-3.5 py-2 rounded-xl text-xs text-white shadow-md">{chat.q}</span>
              </div>
              <div className="text-left flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-[10px] font-bold text-brand-400">AI</div>
                <span className="inline-block bg-slate-900 border border-slate-850 px-3.5 py-2 rounded-xl text-xs text-slate-350 leading-relaxed shadow-sm max-w-[85%]">{chat.a}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask: 'Why did conversion drop?' or request MRR forecasts..."
            className="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-medium"
          />
          <button
            onClick={handleAsk}
            className="bg-brand-500 hover:bg-brand-600 text-white text-xs px-5 py-2.5 rounded-lg font-bold transition-all shadow-md shrink-0"
          >
            Ask AI
          </button>
        </div>
      </div>
    </div>
  );
};
const HeatmapsView: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [playLogs, setPlayLogs] = useState<string[]>([]);
  const [heatmapMode, setHeatmapMode] = useState<'clicks' | 'movements' | 'scroll' | 'attention' | 'dead_clicks'>('clicks');
  const [mousePos, setMousePos] = useState({ x: 100, y: 100 });
  const [clickRipple, setClickRipple] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [scrollTop, setScrollTop] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('/pricing');
  const timerRef = useRef<any | null>(null);

  const toggleReplay = () => {
    if (isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      setPlayProgress(0);
      setPlayLogs(['Replay started - User entered page: /landing']);
      setMousePos({ x: 60, y: 50 });
      setScrollTop(0);
      setCurrentUrl('/landing');

      timerRef.current = setInterval(() => {
        setPlayProgress((prev) => {
          if (prev >= 100) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsPlaying(false);
            return 100;
          }
          const next = prev + 5;
          
          // Animate mouse moves, scrolls, and clicks dynamically!
          if (next === 10) {
            setMousePos({ x: 180, y: 70 });
            setPlayLogs((l) => ['[Mouse move] x: 180, y: 70', ...l]);
          }
          if (next === 20) {
            setMousePos({ x: 260, y: 90 });
            setPlayLogs((l) => ['[Mouse click] Triggered elements: pricing-plan-card', ...l]);
            setClickRipple({ x: 260, y: 90, active: true });
            setTimeout(() => setClickRipple(r => ({ ...r, active: false })), 600);
          }
          if (next === 30) {
            setScrollTop(40);
            setPlayLogs((l) => ['[Scroll depth] Scrolled down 40px', ...l]);
          }
          if (next === 45) {
            setMousePos({ x: 120, y: 220 });
            setPlayLogs((l) => ['[Navigation] Switched URL to /checkout', ...l]);
            setCurrentUrl('/checkout');
          }
          if (next === 60) {
            setMousePos({ x: 220, y: 240 });
            setPlayLogs((l) => ['[Mouse click] Clicked checkout input: card_number', ...l]);
            setClickRipple({ x: 220, y: 240, active: true });
            setTimeout(() => setClickRipple(r => ({ ...r, active: false })), 600);
          }
          if (next === 75) {
            setScrollTop(100);
            setPlayLogs((l) => ['[Scroll depth] Scrolled down 100px (Footer reached)', ...l]);
          }
          if (next === 90) {
            setMousePos({ x: 310, y: 110 });
            setPlayLogs((l) => ['[Navigation] Load success confirmation page', ...l]);
            setCurrentUrl('/success');
            setClickRipple({ x: 310, y: 110, active: true });
            setTimeout(() => setClickRipple(r => ({ ...r, active: false })), 600);
          }

          return next;
        });
      }, 500);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 1. Visual Overlay Heatmap Container */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl relative flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">User Activity Heatmap</h3>
            <p className="text-[10px] text-slate-500 uppercase">Overlaying custom activity maps</p>
          </div>
          <select
            value={heatmapMode}
            onChange={(e) => setHeatmapMode(e.target.value as any)}
            className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
          >
            <option value="clicks">Clicks Heatmap</option>
            <option value="movements">Mouse Movements</option>
            <option value="scroll">Scroll Depth</option>
            <option value="attention">Attention spots</option>
            <option value="dead_clicks">Dead Clicks Alert</option>
          </select>
        </div>

        <div className="border border-slate-850 rounded-xl p-4 bg-slate-950/60 relative overflow-hidden h-[340px]">
          {/* Mock Dashboard view wireframe */}
          <div 
            className="w-full h-full flex flex-col justify-between p-4 border border-slate-800/40 rounded-lg transition-transform duration-500"
            style={{ transform: `translateY(-${scrollTop * 0.5}px)` }}
          >
            <div className="flex justify-between border-b border-slate-800/40 pb-2">
              <span className="text-[10px] text-slate-500 font-bold font-mono">{currentUrl}</span>
              <span className="w-12 h-4 bg-slate-800/40 rounded"></span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-16 bg-slate-850/40 rounded border border-slate-800/20 flex items-center justify-center text-[10px] text-slate-650">Card A</div>
              <div className="h-16 bg-slate-850/40 rounded border border-slate-800/20 flex items-center justify-center text-[10px] text-slate-650">Card B</div>
              <div className="h-16 bg-slate-850/40 rounded border border-slate-800/20 flex items-center justify-center text-[10px] text-slate-650">Card C</div>
            </div>
            <div className="h-20 bg-slate-850/40 rounded border border-slate-800/20 flex items-center justify-center text-[10px] text-slate-650">Funnels matrix charts block</div>
            <div className="h-12 bg-slate-900 border border-slate-800/30 rounded flex items-center justify-center text-[9px] text-slate-600">Footer margins retention</div>
          </div>

          {/* Dynamic mode visual overlays */}
          {heatmapMode === 'clicks' && (
            <>
              {/* Hotspots */}
              <div className="absolute top-[80px] left-[150px] w-12 h-12 rounded-full bg-accent-rose/40 blur-xl animate-pulse"></div>
              <div className="absolute top-[90px] left-[160px] w-6 h-6 rounded-full bg-accent-rose/60 blur-md"></div>
              <div className="absolute top-[160px] left-[260px] w-10 h-10 rounded-full bg-accent-cyan/40 blur-xl animate-pulse"></div>
              <div className="absolute top-[165px] left-[265px] w-4 h-4 rounded-full bg-accent-cyan/60 blur-md"></div>
            </>
          )}

          {heatmapMode === 'movements' && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d="M 60 50 Q 180 70 260 90 T 120 220 T 220 240 T 310 110"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="animate-dash"
              />
              <circle cx="60" cy="50" r="4" fill="#06b6d4" />
              <circle cx="180" cy="70" r="4" fill="#6366f1" />
              <circle cx="260" cy="90" r="4" fill="#6366f1" />
              <circle cx="120" cy="220" r="4" fill="#6366f1" />
              <circle cx="220" cy="240" r="4" fill="#6366f1" />
              <circle cx="310" cy="110" r="4" fill="#10b981" />
            </svg>
          )}

          {heatmapMode === 'scroll' && (
            <div className="absolute inset-0 bg-gradient-to-b from-accent-rose/25 via-emerald-500/15 to-brand-500/25 pointer-events-none flex flex-col justify-between text-[10px] font-bold p-3">
              <span className="text-accent-rose">Red: 100% (Above the fold attention)</span>
              <span className="text-emerald-400 text-center">Green: 65% (Middle page scroll depth)</span>
              <span className="text-brand-400 text-right">Blue: 25% (Bottom fold footer reach)</span>
            </div>
          )}

          {heatmapMode === 'attention' && (
            <>
              {/* Highlight attention zones */}
              <div className="absolute top-[140px] left-[60px] w-32 h-16 rounded bg-brand-500/25 blur-lg border border-brand-500/40"></div>
              <div className="absolute top-[210px] left-[120px] w-24 h-12 rounded bg-accent-violet/20 blur-md border border-accent-violet/30"></div>
            </>
          )}

          {heatmapMode === 'dead_clicks' && (
            <>
              {/* Dead clicks: gray caution tags */}
              <div className="absolute top-[40px] left-[20px] flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[9px] font-bold text-slate-400">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-ping"></span>
                <span>Dead Click x:20 y:40</span>
              </div>
              <div className="absolute top-[280px] left-[320px] flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[9px] font-bold text-slate-400">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-ping"></span>
                <span>Dead Click x:320 y:280</span>
              </div>
            </>
          )}

          {/* Running Mouse Simulation pointer inside Viewport */}
          {isPlaying && (
            <>
              <div
                className="absolute w-3.5 h-3.5 bg-white border border-slate-900 rounded-full pointer-events-none z-50 flex items-center justify-center transition-all duration-300"
                style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
              >
                {/* Visual red clicking ripple dot */}
                <span className="w-1.5 h-1.5 bg-accent-rose rounded-full"></span>
              </div>
              {clickRipple.active && (
                <div
                  className="absolute border-2 border-accent-rose rounded-full w-8 h-8 pointer-events-none z-45 animate-ping -translate-x-2.5 -translate-y-2.5"
                  style={{ left: `${clickRipple.x}px`, top: `${clickRipple.y}px` }}
                ></div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 2. Interactive Session Replay Logs console */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider mb-2">Interactive Session Replay</h3>
          <p className="text-xs text-slate-400 mb-6 font-medium">Replay clicks, scrolls, and navigations recorded by the client SDK.</p>
        </div>
        
        <div className="flex-1 bg-slate-950 rounded-lg border border-slate-850 p-4 font-mono text-xs text-slate-300 min-h-[160px] max-h-[220px] overflow-y-auto space-y-2">
          {playLogs.length === 0 && <span className="text-slate-650 italic">Click Play to begin the recorded session replay.</span>}
          {playLogs.map((log, i) => (
            <div key={i} className="pb-1.5 border-b border-slate-900/40 text-slate-400">
              {log}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={toggleReplay}
            className={`font-semibold px-4 py-2 rounded-lg text-xs transition-all ${
              isPlaying ? 'bg-accent-rose hover:bg-accent-rose/85 text-white' : 'bg-brand-500 hover:bg-brand-600 text-white'
            }`}
          >
            {isPlaying ? 'Pause Replay' : 'Play Session'}
          </button>
          <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-accent-cyan h-full transition-all duration-300" style={{ width: `${playProgress}%` }}></div>
          </div>
          <span className="text-[10px] text-slate-400 font-bold font-mono">{playProgress}%</span>
        </div>
      </div>
    </div>
  );
};

// --- PORTFOLIO CENTER ---
const PortfolioView: React.FC<{ selectedDoc: string | null; setSelectedDoc: (id: string | null) => void }> = ({ selectedDoc, setSelectedDoc }) => {
  const { data: docs } = useDocsList();
  
  // Find current doc path
  const currentDoc = docs?.find(d => d.id === selectedDoc);
  const { data: markdown } = useDocContent(currentDoc ? currentDoc.path : null);

  useEffect(() => {
    if (docs && docs.length > 0 && !selectedDoc) {
      setSelectedDoc(docs[0].id);
    }
  }, [docs, selectedDoc]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar files */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 shadow-xl space-y-2">
        <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-4 px-2">PM Documents</h3>
        {docs?.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setSelectedDoc(doc.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              selectedDoc === doc.id ? 'bg-brand-500/10 text-white border-l-2 border-brand-500 pl-4' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            {doc.title.replace(' (', '\n(')}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-xl p-8 shadow-xl max-h-[600px] overflow-y-auto">
        {markdown ? (
          <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed font-sans space-y-4">
            {markdown.split('\n').map((line: string, i: number) => {
              if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-white border-b border-slate-800 pb-2 mt-4">{line.substring(2)}</h1>;
              if (line.startsWith('## ')) return <h2 key={i} className="text-base font-bold text-white mt-6">{line.substring(3)}</h2>;
              if (line.startsWith('### ')) return <h3 key={i} className="text-xs font-bold text-slate-200 mt-4 uppercase tracking-wider">{line.substring(4)}</h3>;
              if (line.startsWith('- ')) return <li key={i} className="list-disc list-inside ml-2">{line.substring(2)}</li>;
              return <p key={i}>{line}</p>;
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
};

// --- DEVELOPER DOCS ---
const APIExplorerView: React.FC<{ apiKey: string }> = ({ apiKey }) => {
  const [activeCategory, setActiveCategory] = useState('rest'); // 'rest', 'analytics', 'webhook', 'admin', 'sdk'
  const [activeEndpoint, setActiveEndpoint] = useState('login');

  const categories = [
    { id: 'rest', name: 'REST APIs' },
    { id: 'analytics', name: 'Analytics APIs' },
    { id: 'webhook', name: 'Webhook APIs' },
    { id: 'admin', name: 'Admin APIs' },
    { id: 'sdk', name: 'SDK APIs' }
  ];

  const endpoints: Record<string, Array<{ id: string; method: string; path: string; desc: string; curl: string }>> = {
    rest: [
      {
        id: 'login',
        method: 'POST',
        path: '/api/v1/auth/login',
        desc: 'Authenticate user and retrieve access & refresh JWT tokens.',
        curl: `curl -X POST http://localhost:8000/api/v1/auth/login \\\n  -H "Content-Type: application/json" \\\n  -d '{"email": "demo@insightx.ai", "password": "demo123"}'`
      },
      {
        id: 'signup',
        method: 'POST',
        path: '/api/v1/auth/signup',
        desc: 'Register a new customer profile and trigger verification.',
        curl: `curl -X POST http://localhost:8000/api/v1/auth/signup \\\n  -H "Content-Type: application/json" \\\n  -d '{"email": "user@acme.com", "password": "secure123", "full_name": "John Doe"}'`
      }
    ],
    analytics: [
      {
        id: 'dashboard',
        method: 'GET',
        path: '/api/v1/analytics/dashboard',
        desc: 'Retrieve core performance metrics: daily/monthly users, retention rates, sessions counts.',
        curl: `curl -X GET http://localhost:8000/api/v1/analytics/dashboard \\\n  -H "Authorization: Bearer <JWT_TOKEN>"`
      },
      {
        id: 'funnels',
        method: 'GET',
        path: '/api/v1/analytics/funnels',
        desc: 'Calculate sequential step conversions, dropout parameters, and completions details.',
        curl: `curl -X GET http://localhost:8000/api/v1/analytics/funnels \\\n  -H "Authorization: Bearer <JWT_TOKEN>"`
      }
    ],
    webhook: [
      {
        id: 'report_trigger',
        method: 'POST',
        path: '/api/v1/reports/:id/trigger',
        desc: 'Execute immediate generation and outbound email dispatch of a report.',
        curl: `curl -X POST http://localhost:8000/api/v1/reports/<REPORT_ID>/trigger \\\n  -H "Authorization: Bearer <JWT_TOKEN>"`
      },
      {
        id: 'alert_test',
        method: 'POST',
        path: '/api/v1/alerts/channels/:id/test',
        desc: 'Trigger a real outbound POST webhook payload test (Slack/Discord/Teams).',
        curl: `curl -X POST http://localhost:8000/api/v1/alerts/channels/<CHANNEL_ID>/test \\\n  -H "Authorization: Bearer <JWT_TOKEN>"`
      }
    ],
    admin: [
      {
        id: 'users',
        method: 'GET',
        path: '/api/v1/admin/users',
        desc: 'Fetch a list of all workspace users, role definitions, and MFA statuses.',
        curl: `curl -X GET http://localhost:8000/api/v1/admin/users \\\n  -H "Authorization: Bearer <JWT_TOKEN>"`
      },
      {
        id: 'logs',
        method: 'GET',
        path: '/api/v1/admin/logs',
        desc: 'Fetch global audit logs for workspace changes and system updates.',
        curl: `curl -X GET http://localhost:8000/api/v1/admin/logs \\\n  -H "Authorization: Bearer <JWT_TOKEN>"`
      }
    ],
    sdk: [
      {
        id: 'web_sdk',
        method: 'JS SDK',
        path: 'insightx-web.js',
        desc: 'Integrate the autocapture telemetry SDK directly on client HTML pages.',
        curl: `<!-- Copy in head tag -->\n<script src="http://localhost:8000/public/insightx-sdk.js"><\/script>\n<script>\n  InsightX.init("${apiKey}");\n  InsightX.track("Button Clicked", { label: "Checkout" });\n<\/script>`
      }
    ]
  };

  const activeList = endpoints[activeCategory] || [];
  const selectedEndpoint = activeList.find(e => e.id === activeEndpoint) || activeList[0] || { method: '', path: '', desc: '', curl: '' };

  useEffect(() => {
    if (activeList.length > 0) {
      setActiveEndpoint(activeList[0].id);
    }
  }, [activeCategory]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Category selector */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 shadow-xl space-y-2">
        <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-4 px-2">API Documentation</h3>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === c.id ? 'bg-brand-500/10 text-brand-300 border-l-2 border-brand-500 pl-4' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Endpoint list */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 shadow-xl space-y-2">
        <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-4 px-2">Endpoints / Snippets</h3>
        {activeList.map(e => (
          <button
            key={e.id}
            onClick={() => setActiveEndpoint(e.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all ${
              activeEndpoint === e.id ? 'bg-slate-950 border border-slate-800 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-850/40'
            }`}
          >
            <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mr-2 ${
              e.method === 'GET' ? 'bg-accent-cyan/10 text-accent-cyan' :
              e.method === 'POST' ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-slate-800 text-slate-300'
            }`}>{e.method}</span>
            <span className="font-mono text-[10px] truncate block mt-1">{e.path}</span>
          </button>
        ))}
      </div>

      {/* Details */}
      <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wider">Method: {selectedEndpoint.method}</span>
          <h3 className="text-base font-mono font-bold text-white mt-1 mb-2 break-all">{selectedEndpoint.path}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{selectedEndpoint.desc}</p>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Execution / Integration Snippet</label>
          <pre className="bg-slate-950 p-4 rounded-lg text-xs font-mono border border-slate-850 text-brand-100 overflow-x-auto leading-relaxed">
            {selectedEndpoint.curl}
          </pre>
        </div>
      </div>
    </div>
  );
};

// --- SETTINGS & BILLING VIEW ---
const SettingsView: React.FC<{ apiKey: string; setApiKey: (key: string) => void }> = ({ apiKey, setApiKey }) => {
  const [orgName, setOrgName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Viewer');
  const [projectName, setProjectName] = useState('');
  const [orgs, setOrgs] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaSecret, setMfaSecret] = useState('');
  const [billingPlan, setBillingPlan] = useState('Free');

  const { data: invoicesData } = useOrganizationInvoices(selectedOrgId);
  const updateBilling = useUpdateOrganizationBilling();

  const loadOrgs = async () => {
    try {
      const res = await api.get('/api/v1/organizations');
      if (res.data.success) {
        setOrgs(res.data.organizations);
        if (res.data.organizations.length > 0 && !selectedOrgId) {
          setSelectedOrgId(res.data.organizations[0].id);
          setBillingPlan(res.data.organizations[0].billing_plan);
        }
      }
    } catch (e) {}
  };

  const loadMembers = async () => {
    if (!selectedOrgId) return;
    try {
      const res = await api.get(`/api/v1/organizations/members?organization_id=${selectedOrgId}`);
      if (res.data.success) {
        setMembers(res.data.members);
        setPendingInvites(res.data.pending_invites);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadOrgs();
  }, []);

  useEffect(() => {
    loadMembers();
  }, [selectedOrgId]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    try {
      const res = await api.post('/api/v1/organizations', { name: orgName });
      if (res.data.success) {
        setOrgName('');
        loadOrgs();
      }
    } catch (e) {}
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !selectedOrgId) return;
    try {
      const res = await api.post('/api/v1/organizations/invite', {
        organization_id: selectedOrgId,
        email: inviteEmail,
        role: inviteRole
      });
      if (res.data.success) {
        setInviteEmail('');
        loadMembers();
      }
    } catch (e) {}
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !selectedOrgId) return;
    try {
      const res = await api.post('/api/v1/projects', {
        name: projectName,
        organization_id: selectedOrgId
      });
      if (res.data.success) {
        setProjectName('');
        setApiKey(res.data.project.api_key);
        alert(`Project created successfully! New API Key generated: ${res.data.project.api_key}. SDK playground updated.`);
      }
    } catch (e) {}
  };

  const handleMfaToggle = async () => {
    try {
      if (mfaEnabled) {
        const res = await api.post('/api/v1/auth/mfa/disable');
        if (res.data.success) {
          setMfaEnabled(false);
          setMfaSecret('');
        }
      } else {
        const res = await api.post('/api/v1/auth/mfa/enable');
        if (res.data.success) {
          setMfaEnabled(true);
          setMfaSecret(res.data.mfa_secret);
        }
      }
    } catch (e) {}
  };

  const handleUpgradePlan = async (plan: string) => {
    if (!selectedOrgId) return;
    try {
      await updateBilling.mutateAsync({ orgId: selectedOrgId, billing_plan: plan });
      setBillingPlan(plan);
      alert(`Workspace successfully migrated to the ${plan} tier!`);
    } catch (e) {
      alert('Failed to upgrade billing plan.');
    }
  };

  const invoices = invoicesData?.invoices || [];

  // Calculate usage parameters
  const getUsageLimit = () => {
    if (billingPlan === 'Free') return 10000;
    if (billingPlan === 'Pro') return 500000;
    return 'Unlimited';
  };
  const limit = getUsageLimit();
  const currentUsage = 4232;
  const usagePercentage = typeof limit === 'number' ? Math.min(100, (currentUsage / limit) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* 1. Workspace (Org) Creation & Billing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Workspaces (Organizations)</h3>
          
          <form onSubmit={handleCreateOrg} className="flex gap-2">
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Enter Acme Workspace name..."
              className="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
            />
            <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white text-xs px-4 py-1.5 rounded-lg font-semibold shrink-0">
              Create
            </button>
          </form>

          <div className="space-y-2 max-h-36 overflow-y-auto">
            {orgs.map((o) => (
              <button
                key={o.id}
                onClick={() => { setSelectedOrgId(o.id); setBillingPlan(o.billing_plan); }}
                className={`w-full flex justify-between items-center p-3 rounded-lg text-xs transition-all ${
                  selectedOrgId === o.id ? 'bg-brand-500/10 border border-brand-500/30' : 'bg-slate-950 border border-slate-900'
                }`}
              >
                <span className="text-white font-semibold">{o.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">{o.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Plan Upgrade and Quotas */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Billing Tiers & Quotas</h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage plan subscription levels and check limits.</p>
            </div>
            <strong className="text-white bg-brand-500/10 px-3 py-1 rounded text-xs uppercase font-bold text-brand-400 border border-brand-500/20">{billingPlan} Plan</strong>
          </div>

          {/* Usage progress tracking */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-850 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Event Ingestion Usage</span>
              <span>{currentUsage.toLocaleString()} / {typeof limit === 'number' ? limit.toLocaleString() : 'Unlimited'} events</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800 overflow-hidden">
              <div
                className="bg-brand-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${typeof limit === 'number' ? usagePercentage : 0}%` }}
              ></div>
            </div>
            <span className="block text-[10px] text-slate-500">{typeof limit === 'number' ? `Usage resetting in 26 days. (${usagePercentage.toFixed(1)}% consumed)` : 'Unlimited ingestion active.'}</span>
          </div>

          {/* Plan Options Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border flex flex-col justify-between ${billingPlan === 'Free' ? 'border-brand-500/40 bg-brand-500/5' : 'border-slate-850 bg-slate-950/40'}`}>
              <div>
                <h4 className="font-bold text-xs text-white">Free Plan</h4>
                <p className="text-[10px] text-slate-500 mt-1">Up to 10k events/mo. Core metrics and standard funnels calculations.</p>
              </div>
              <button
                disabled={billingPlan === 'Free'}
                onClick={() => handleUpgradePlan('Free')}
                className="mt-4 w-full bg-slate-900 hover:bg-slate-850 text-slate-300 text-[10px] py-1.5 rounded font-bold transition-all border border-slate-800 disabled:opacity-50"
              >
                {billingPlan === 'Free' ? 'Active' : 'Downgrade'}
              </button>
            </div>

            <div className={`p-4 rounded-lg border flex flex-col justify-between ${billingPlan === 'Pro' ? 'border-brand-500/40 bg-brand-500/5' : 'border-slate-850 bg-slate-950/40'}`}>
              <div>
                <h4 className="font-bold text-xs text-white">Pro Plan ($99/mo)</h4>
                <p className="text-[10px] text-slate-500 mt-1">Up to 500k events/mo. A/B testing splits and scheduled report automations.</p>
              </div>
              <button
                disabled={billingPlan === 'Pro'}
                onClick={() => handleUpgradePlan('Pro')}
                className="mt-4 w-full bg-brand-500 hover:bg-brand-600 text-white text-[10px] py-1.5 rounded font-bold transition-all disabled:opacity-50"
              >
                {billingPlan === 'Pro' ? 'Active' : 'Upgrade to Pro'}
              </button>
            </div>

            <div className={`p-4 rounded-lg border flex flex-col justify-between ${billingPlan === 'Enterprise' ? 'border-brand-500/40 bg-brand-500/5' : 'border-slate-850 bg-slate-950/40'}`}>
              <div>
                <h4 className="font-bold text-xs text-white">Enterprise</h4>
                <p className="text-[10px] text-slate-500 mt-1">Unlimited ingestion. Dedicated AI clusters and live Teams/Slack outbound hooks.</p>
              </div>
              <button
                disabled={billingPlan === 'Enterprise'}
                onClick={() => handleUpgradePlan('Enterprise')}
                className="mt-4 w-full bg-slate-900 hover:bg-slate-850 text-slate-300 text-[10px] py-1.5 rounded font-bold transition-all border border-slate-800 disabled:opacity-50"
              >
                {billingPlan === 'Enterprise' ? 'Active' : 'Upgrade Enterprise'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices and Active Keys */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workspace Projects */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Workspace Projects</h3>
          <p className="text-xs text-slate-400">Create independent data streams and generate telemetry token API keys.</p>
          
          <form onSubmit={handleCreateProject} className="flex gap-2">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="E.g. Mobile iOS Client..."
              className="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
            />
            <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white text-xs px-3 py-1.5 rounded font-semibold shrink-0">
              Create Key
            </button>
          </form>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-850">
            <strong className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Active Telemetry API Key:</strong>
            <span className="text-white font-mono block mt-1.5 break-all bg-slate-900 px-3 py-1.5 rounded text-xs select-all">{apiKey}</span>
          </div>
        </div>

        {/* Invoice list */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Invoices & Invoicing History</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase text-[9px] font-bold">
                  <th className="py-2.5 px-3">Invoice ID</th>
                  <th className="py-2.5 px-3">Billing Date</th>
                  <th className="py-2.5 px-3 text-center">Amount</th>
                  <th className="py-2.5 px-3 text-center">Plan Tier</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-900/10">
                    <td className="py-3 px-3 font-semibold text-white">{inv.id}</td>
                    <td className="py-3 px-3 text-slate-400">{inv.date}</td>
                    <td className="py-3 px-3 text-center text-slate-300 font-semibold">{inv.amount}</td>
                    <td className="py-3 px-3 text-center text-slate-400 capitalize">{inv.plan}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-[9px] px-2 py-0.5 rounded font-bold">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => alert(`Simulated downloading invoice ${inv.id}.pdf successfully.`)}
                        className="text-brand-400 hover:text-brand-300 font-bold text-[10px]"
                      >
                        PDF Statement
                      </button>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-500 italic">No invoicing statements registered.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Team Member Invites and Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Invite Team Members</h3>
          <form onSubmit={handleInvite} className="space-y-3">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Email Address</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@insightx.ai"
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Workspace Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="Administrator">Administrator (Write configs & Billing)</option>
                <option value="Editor">Editor (Build funnels & experiments)</option>
                <option value="Viewer">Viewer (Read analytics dashboards)</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-brand-500 hover:bg-brand-600 text-white text-xs py-2 rounded-lg font-semibold transition-colors">
              Send Invite
            </button>
          </form>
        </div>

        {/* Members list */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Active Workspace Members</h3>
          <div className="space-y-2 max-h-[180px] overflow-y-auto">
            {members.map((m) => (
              <div key={m.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-950/60 border border-slate-850 text-xs">
                <div>
                  <span className="text-white font-semibold block">{m.full_name || m.email}</span>
                  <span className="text-[10px] text-slate-500 block">{m.email}</span>
                </div>
                <span className="text-[10px] bg-slate-850 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-medium">{m.role}</span>
              </div>
            ))}
            {pendingInvites.map((pi, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-slate-950/20 border border-slate-850/50 text-xs border-dashed">
                <div>
                  <span className="text-slate-400 block font-semibold">{pi.email}</span>
                  <span className="text-[10px] text-slate-500 block">Pending verification link</span>
                </div>
                <span className="text-[10px] bg-accent-rose/10 text-accent-rose px-2 py-0.5 rounded font-medium">Pending</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security MFA */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Security & MFA Profile</h3>
        <div className="pt-2 flex justify-between items-center text-xs">
          <div>
            <strong className="text-white block font-medium">Multi-Factor Authentication (MFA)</strong>
            <span className="text-slate-500 text-[10px]">Require 6-digit OTP code on user login sessions.</span>
          </div>
          <button
            onClick={handleMfaToggle}
            className={`font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors ${
              mfaEnabled ? 'bg-accent-rose hover:bg-accent-rose/85 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            {mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
          </button>
        </div>
        {mfaEnabled && mfaSecret && (
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-850 font-mono text-xs text-slate-300">
            <span className="text-accent-cyan font-bold block mb-1">MFA Secret Seed:</span>
            <span>{mfaSecret}</span>
            <span className="block mt-2 text-[10px] text-slate-500">Configure your authenticator app with this secret to generate OTPs. Use code 123456 to log in next time.</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// MODULE 19: ADMIN PANEL VIEW
// ==========================================
const AdminConsoleView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('users'); // 'users', 'projects', 'logs'

  const { data: usersData } = useAdminUsers();
  const { data: projectsData } = useAdminProjects();
  const { data: logsData } = useAdminLogs();
  const updateUserRole = useUpdateUserRole();

  const users = usersData?.users || [];
  const projects = projectsData?.projects || [];
  const logs = logsData?.logs || [];

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'Administrator' ? 'Editor' : currentRole === 'Editor' ? 'Viewer' : 'Administrator';
    try {
      await updateUserRole.mutateAsync({ id: userId, role: nextRole });
    } catch (e) {
      alert('Failed to change user role.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs selector */}
      <div className="flex gap-2.5 border-b border-slate-900 pb-3">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'users' ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          Users & Permissions
        </button>
        <button
          onClick={() => setActiveSubTab('projects')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'projects' ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          Workspace Projects
        </button>
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'logs' ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          System Audit Trail
        </button>
      </div>

      {activeSubTab === 'users' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Users Directory & Permissions</h3>
              <p className="text-xs text-slate-400 mt-0.5">List registered accounts, verify MFA status and allocate access permissions.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase text-[9px] font-bold">
                  <th className="py-2.5 px-3">User Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3 text-center">MFA Active</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Assigned Role</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 text-slate-300">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-900/10">
                    <td className="py-3 px-3 font-semibold text-white">{u.full_name || 'N/A'}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{u.email}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-bold ${
                        u.mfa_enabled === 1 ? 'bg-accent-violet/10 text-accent-violet border border-accent-violet/20' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {u.mfa_enabled === 1 ? 'OTP Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-bold ${
                        u.verified === 1 ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-slate-800 text-slate-550'
                      }`}>
                        {u.verified === 1 ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleRoleChange(u.id, u.role)}
                        className="bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 text-[10px] px-2.5 py-1 rounded"
                      >
                        Cycle Permission Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'projects' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl">
          <div className="mb-6">
            <h3 className="text-base font-bold text-white">Workspace Projects & Tokens</h3>
            <p className="text-xs text-slate-400 mt-0.5">Audit generated project segments and API tokens mapped to telemetry streams.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase text-[9px] font-bold">
                  <th className="py-2.5 px-3">Project Title</th>
                  <th className="py-2.5 px-3">Unique Project ID</th>
                  <th className="py-2.5 px-3">API Telemetry Credentials Key</th>
                  <th className="py-2.5 px-3 text-right">Stream Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 text-slate-300 font-mono text-[11px]">
                {projects.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-900/10">
                    <td className="py-3 px-3 font-semibold text-white font-sans text-xs">{p.name}</td>
                    <td className="py-3 px-3 text-slate-400">{p.id}</td>
                    <td className="py-3 px-3 text-brand-300 break-all select-all">{p.api_key}</td>
                    <td className="py-3 px-3 text-right text-accent-emerald font-bold font-sans text-[10px]">Capturing</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'logs' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl">
          <div className="mb-6">
            <h3 className="text-base font-bold text-white">Workspace Audit Trail Log</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time log tracing of billing mutations, database configurations, and permission cycles.</p>
          </div>

          <div className="overflow-x-auto max-h-[350px] overflow-y-auto pr-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase text-[9px] font-bold sticky top-0 bg-slate-900/90 py-2">
                  <th className="py-2 px-3">Timestamp (UTC)</th>
                  <th className="py-2 px-3">Action Type</th>
                  <th className="py-2 px-3">Actor Email</th>
                  <th className="py-2 px-3">Log Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 text-slate-300 font-mono text-[10px]">
                {logs.map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-900/10">
                    <td className="py-2.5 px-3 text-slate-500">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-slate-850 text-slate-300 border border-slate-800 px-1.5 py-0.5 rounded font-semibold text-[9px]">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans text-xs">{l.user_email}</td>
                    <td className="py-2.5 px-3 text-brand-100 font-sans text-xs">{l.details}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-500 italic">No system audit events recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};


// ==========================================
// MODULE 16: REPORTS & EXPORTS VIEW
// ==========================================
import { 
  useReportsList, 
  useCreateReport, 
  useDeleteReport, 
  useTriggerReport,
  useAlertChannelsList,
  useCreateAlertChannel,
  useDeleteAlertChannel,
  useTestAlertChannel 
} from './api';

const ReportsView: React.FC = () => {
  const { data: repData } = useReportsList();
  const createReport = useCreateReport();
  const deleteReport = useDeleteReport();
  const triggerReport = useTriggerReport();

  const [name, setName] = useState('');
  const [type, setType] = useState('Dashboard');
  const [format, setFormat] = useState('CSV');
  const [schedule, setSchedule] = useState('Daily');
  const [recipients, setRecipients] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [actionStatus, setActionStatus] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      await createReport.mutateAsync({
        name,
        type,
        format,
        schedule,
        email_recipients: recipients,
        project_id: 'proj-default'
      });
      setName('');
      setRecipients('');
      setIsCreating(false);
      setActionStatus('Successfully scheduled report!');
      setTimeout(() => setActionStatus(''), 4000);
    } catch (e) {}
  };

  const handleSendNow = async (id: string) => {
    try {
      const res = await triggerReport.mutateAsync(id);
      setActionStatus(res.message || 'Report generated and emailed successfully!');
      setTimeout(() => setActionStatus(''), 6000);
    } catch (e) {
      setActionStatus('Failed to send report');
      setTimeout(() => setActionStatus(''), 4000);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReport.mutateAsync(id);
    } catch (e) {}
  };

  const handleExport = (exportType: string, exportFormat: string) => {
    const url = `${API_BASE}/api/v1/reports/export?type=${exportType}&format=${exportFormat}`;
    window.open(url, '_blank');
  };

  const reports = repData?.reports || [];

  return (
    <div className="space-y-6">
      {actionStatus && (
        <div className="p-3 bg-brand-500/10 border border-brand-500/25 rounded-lg text-xs font-semibold text-brand-300">
          {actionStatus}
        </div>
      )}

      {/* Dynamic Client Export Utilities */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Instant Data Exports</h3>
          <p className="text-xs text-slate-400 mt-0.5">Download raw telemetry, segment matches, and funnel pipelines in tabular formats.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-xs text-white">User Segment Directory</h4>
              <p className="text-[10px] text-slate-500 mt-1">Export resolved cohort profiles, demographic layers and telemetry values.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleExport('segmentation', 'csv')} className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold py-1.5 rounded text-slate-300">CSV</button>
              <button onClick={() => handleExport('segmentation', 'excel')} className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold py-1.5 rounded text-slate-300">Excel</button>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-855 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-xs text-white">Funnel Pipeline Stages</h4>
              <p className="text-[10px] text-slate-500 mt-1">Export registered sequential conversion funnels, paths and steps reach data.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleExport('funnels', 'csv')} className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold py-1.5 rounded text-slate-300">CSV</button>
              <button onClick={() => handleExport('funnels', 'excel')} className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold py-1.5 rounded text-slate-300">Excel</button>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-855 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-xs text-white">Platform KPIs Summary</h4>
              <p className="text-[10px] text-slate-500 mt-1">Export active real-time dashboard parameters, stickiness and gross values.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleExport('dashboard', 'csv')} className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold py-1.5 rounded text-slate-300">CSV</button>
              <button onClick={() => handleExport('dashboard', 'excel')} className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold py-1.5 rounded text-slate-300">Excel</button>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled report engine */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Scheduled Reports Engine</h3>
            <p className="text-xs text-slate-400 mt-0.5">Automate report compilations and schedule delivery to teams.</p>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-1.5 px-3.5 rounded-lg"
          >
            {isCreating ? 'Cancel' : 'Configure Scheduled Report'}
          </button>
        </div>

        {isCreating && (
          <form onSubmit={handleCreate} className="bg-slate-950 border border-slate-850 p-6 rounded-xl space-y-4 mb-6">
            <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">Schedule Report Configuration</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Report Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Daily Segmentation cohort..."
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Report Data Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="Dashboard">Dashboard Overview</option>
                  <option value="Funnels">Funnels Pipeline</option>
                  <option value="Retention">Retention Cohorts</option>
                  <option value="Segmentation">Segmentation Profiles</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">File Export Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="CSV">Comma Separated (CSV)</option>
                  <option value="Excel">Excel Spreadsheet (XLS)</option>
                  <option value="PDF">Printable Document (PDF)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Execution Frequency</label>
                <select
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="Daily">Daily Execution (09:00 AM UTC)</option>
                  <option value="Weekly">Weekly Execution (Mondays)</option>
                  <option value="Monthly">Monthly Execution (1st of month)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Email Recipients (Comma Separated)</label>
                <input
                  type="text"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="analyst@acme.com, admin@acme.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 rounded text-xs">
              Save Report Schedule
            </button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[9px] font-bold">
                <th className="py-2.5 px-3">Report Name</th>
                <th className="py-2.5 px-3">Data source</th>
                <th className="py-2.5 px-3 text-center">Format</th>
                <th className="py-2.5 px-3 text-center">Schedule</th>
                <th className="py-2.5 px-3">Email targets</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60">
              {reports.map((rep: any) => (
                <tr key={rep.id} className="hover:bg-slate-900/10">
                  <td className="py-3 px-3 font-semibold text-white">{rep.name}</td>
                  <td className="py-3 px-3 text-slate-400">{rep.type}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                      {rep.format}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-400 font-medium">{rep.schedule}</td>
                  <td className="py-3 px-3 text-slate-400 truncate max-w-xs">{rep.email_recipients || 'admin@insightx.com'}</td>
                  <td className="py-3 px-3 text-right space-x-2 shrink-0">
                    <button
                      onClick={() => handleSendNow(rep.id)}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold px-2 py-1 rounded text-accent-cyan"
                    >
                      Trigger Now
                    </button>
                    <button
                      onClick={() => handleDelete(rep.id)}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold px-2 py-1 rounded text-accent-rose"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-500 italic">No scheduled reports active. Create one above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MODULE 17: NOTIFICATIONS / ALERTS VIEW
// ==========================================
const NotificationsView: React.FC = () => {
  const { data: chanData } = useAlertChannelsList();
  const createChannel = useCreateAlertChannel();
  const deleteChannel = useDeleteAlertChannel();
  const testChannel = useTestAlertChannel();

  const [name, setName] = useState('');
  const [type, setType] = useState('Slack');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [actionStatus, setActionStatus] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      const config = type === 'Email' ? { email_address: emailAddress } : { webhook_url: webhookUrl };
      await createChannel.mutateAsync({
        name,
        type,
        config,
        project_id: 'proj-default'
      });
      setName('');
      setWebhookUrl('');
      setEmailAddress('');
      setIsCreating(false);
      setActionStatus('Alert notification channel registered!');
      setTimeout(() => setActionStatus(''), 4000);
    } catch (e) {}
  };

  const handleTest = async (id: string) => {
    try {
      setActionStatus('Firing test notification payload...');
      const res = await testChannel.mutateAsync(id);
      setActionStatus(res.message + ' (' + (res.details || '') + ')');
      setTimeout(() => setActionStatus(''), 6000);
    } catch (e) {
      setActionStatus('Failed to send test alert payload');
      setTimeout(() => setActionStatus(''), 4000);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteChannel.mutateAsync(id);
    } catch (e) {}
  };

  const channels = chanData?.channels || [];

  return (
    <div className="space-y-6">
      {actionStatus && (
        <div className="p-3 bg-brand-500/10 border border-brand-500/25 rounded-lg text-xs font-semibold text-brand-300">
          {actionStatus}
        </div>
      )}

      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Alert Outbound Channels</h3>
            <p className="text-xs text-slate-400 mt-0.5">Integrate Slack, Teams, Discord, Webhooks or Email to receive real-time anomaly indicators.</p>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-1.5 px-3.5 rounded-lg"
          >
            {isCreating ? 'Cancel' : 'Configure Integration Channel'}
          </button>
        </div>

        {isCreating && (
          <form onSubmit={handleCreate} className="bg-slate-950 border border-slate-850 p-6 rounded-xl space-y-4 mb-6">
            <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">New Notification Integration</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Channel Friendly Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g. #marketing-alerts Slack..."
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Integration Service Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="Slack">Slack Webhook</option>
                  <option value="Discord">Discord Webhook</option>
                  <option value="Teams">Microsoft Teams Webhook</option>
                  <option value="Webhook">Custom HTTP Post Webhook</option>
                  <option value="Email">Email Alert</option>
                </select>
              </div>

              {type === 'Email' ? (
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Target Email Address</label>
                  <input
                    type="email"
                    required
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="E.g. alerts@acme.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Webhook URL Endpoint</label>
                  <input
                    type="url"
                    required
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              )}
            </div>

            <button type="submit" className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 rounded text-xs">
              Activate Integration Channel
            </button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[9px] font-bold">
                <th className="py-2.5 px-3">Channel Name</th>
                <th className="py-2.5 px-3">Service</th>
                <th className="py-2.5 px-3">Config endpoint</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60">
              {channels.map((chan: any) => {
                const config = JSON.parse(chan.config || '{}');
                const target = chan.type === 'Email' ? config.email_address : config.webhook_url;
                const isOnline = chan.active === 1;

                return (
                  <tr key={chan.id} className="hover:bg-slate-900/10">
                    <td className="py-3 px-3 font-semibold text-white">{chan.name}</td>
                    <td className="py-3 px-3 text-slate-400">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        chan.type === 'Slack' ? 'bg-accent-violet/10 text-accent-violet' :
                        chan.type === 'Discord' ? 'bg-brand-500/10 text-brand-400' :
                        chan.type === 'Webhook' ? 'bg-accent-cyan/10 text-accent-cyan' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {chan.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 truncate max-w-xs font-mono text-[10px]">{target}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="flex items-center justify-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-accent-emerald' : 'bg-slate-550'}`}></span>
                        <span className="text-[10px] text-slate-550 font-bold">{isOnline ? 'Active' : 'Muted'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-2 shrink-0">
                      <button
                        onClick={() => handleTest(chan.id)}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold px-2.5 py-1 rounded text-brand-400"
                      >
                        Fire Test payload
                      </button>
                      <button
                        onClick={() => handleDelete(chan.id)}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold px-2 py-1 rounded text-accent-rose"
                      >
                        Disconnect
                      </button>
                    </td>
                  </tr>
                );
              })}
              {channels.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-500 italic">No alert notification channels configured yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. Main App Container Layout
// ==========================================
const App: React.FC = () => {
  const [auth, setAuth] = useState<{ token: string; user: AuthUser } | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('ix-pk-demo-project-telemetry-token-key');
  const [logEvents, setLogEvents] = useState<LogEvent[]>([]);

  // Local storage cache hooks
  useEffect(() => {
    const cachedToken = localStorage.getItem('insightx_auth_token');
    const cachedUser = localStorage.getItem('insightx_auth_user');
    if (cachedToken && cachedUser) {
      try {
        setAuth({
          token: cachedToken,
          user: JSON.parse(cachedUser)
        });
      } catch (e) {}
    }
  }, []);

  // Poll for mock logs
  useEffect(() => {
    if (!auth) return;

    const fetchLogs = () => {
      setLogEvents(prev => {
        const names = ['Landing', 'Signup', 'Search', 'Add to Cart', 'Checkout', 'Purchase'];
        const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
        const devices = ['Desktop', 'Mobile', 'Tablet'];
        
        const randomEvent: LogEvent = {
          id: 'ev-' + Math.floor(Math.random() * 100000),
          event_name: names[Math.floor(Math.random() * names.length)],
          timestamp: new Date().toLocaleTimeString(),
          properties: {
            $browser: browsers[Math.floor(Math.random() * browsers.length)],
            $device: devices[Math.floor(Math.random() * devices.length)]
          }
        };
        return [randomEvent, ...prev.slice(0, 19)];
      });
    };

    const interval = setInterval(fetchLogs, 4000);
    return () => clearInterval(interval);
  }, [auth]);

  const handleLoginSuccess = (token: string, user: AuthUser) => {
    localStorage.setItem('insightx_auth_token', token);
    localStorage.setItem('insightx_auth_user', JSON.stringify(user));
    setAuth({ token, user });
  };

  const handleLogout = () => {
    localStorage.removeItem('insightx_auth_token');
    localStorage.removeItem('insightx_auth_user');
    setAuth(null);
  };

  if (!auth) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Background pulses */}
      <div className="absolute w-[45rem] h-[45rem] rounded-full bg-gradient-to-tr from-brand-600/10 to-accent-cyan/5 blur-[140px] -top-80 -left-60 pointer-events-none animate-glow-1"></div>
      <div className="absolute w-[45rem] h-[45rem] rounded-full bg-gradient-to-tr from-accent-violet/5 to-accent-rose/5 blur-[140px] -bottom-40 -right-40 pointer-events-none animate-glow-2"></div>

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/60 backdrop-blur-md border-r border-slate-800 flex flex-col shrink-0 relative z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-brand-500/20">
            IX
          </div>
          <div>
            <h2 className="font-bold text-md leading-tight text-white tracking-wide">InsightX</h2>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald inline-block"></span>
              AI Analytics Engine
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <span className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Workspace</span>
          <SidebarItem label="Live Dashboard" tab="dashboard" active={activeTab} onClick={setActiveTab} icon="dashboard" />
          <SidebarItem label="SDK Integration" tab="sdk" active={activeTab} onClick={setActiveTab} icon="sdk" />
          <SidebarItem label="User Journeys" tab="journeys" active={activeTab} onClick={setActiveTab} icon="lightning" />
          <SidebarItem label="Funnels Analysis" tab="funnels" active={activeTab} onClick={setActiveTab} icon="funnel" />
          <SidebarItem label="Retention Cohorts" tab="retention" active={activeTab} onClick={setActiveTab} icon="retention" />
          <SidebarItem label="A/B Tests & Flags" tab="experiments" active={activeTab} onClick={setActiveTab} icon="experiment" />
          <SidebarItem label="AI Insights" tab="ai" active={activeTab} onClick={setActiveTab} icon="ai" />
          <SidebarItem label="User Segmentation" tab="segmentation" active={activeTab} onClick={setActiveTab} icon="users" />
          <SidebarItem label="Heatmaps & Replay" tab="heatmaps" active={activeTab} onClick={setActiveTab} icon="heatmap" />
          
          <span className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-6 mb-2">Portfolio</span>
          <SidebarItem label="Scheduled Reports" tab="reports" active={activeTab} onClick={setActiveTab} icon="docs" />
          <SidebarItem label="Alert Notifications" tab="notifications" active={activeTab} onClick={setActiveTab} icon="lightning" />
          <SidebarItem label="PM Portfolio Center" tab="portfolio" active={activeTab} onClick={setActiveTab} icon="docs" />
          <SidebarItem label="API Developer Docs" tab="api" active={activeTab} onClick={setActiveTab} icon="api" />
          <SidebarItem label="Settings & Billing" tab="settings" active={activeTab} onClick={setActiveTab} icon="settings" />
          {auth.user.role === 'Administrator' && (
            <SidebarItem label="Admin Console" tab="admin" active={activeTab} onClick={setActiveTab} icon="settings" />
          )}
        </nav>

        {/* Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-brand-100 text-xs uppercase border border-slate-700">
              {auth.user.full_name.substring(0, 2)}
            </div>
            <div className="truncate w-28">
              <h4 className="text-xs font-semibold text-white truncate leading-snug">{auth.user.full_name}</h4>
              <span className="text-[10px] text-slate-400 capitalize">{auth.user.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-accent-rose hover:bg-slate-800 rounded-lg transition-colors" title="Log Out">
            <Icon name="logout" className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-950/20 backdrop-blur-sm relative z-10">
        <header className="h-16 border-b border-slate-900 flex items-center justify-between px-8 bg-slate-900/10 backdrop-blur-sm shrink-0 sticky top-0 z-30">
          <h1 className="text-xl font-bold tracking-wide capitalize text-white flex items-center gap-2">
            {activeTab.replace('_', ' ')}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse"></span>
              Project ID: <strong className="text-white">proj-default</strong>
            </span>
            <span className="text-xs bg-brand-500/10 border border-brand-500/20 text-brand-100 px-3 py-1 rounded-full">
              Plan: Pro
            </span>
          </div>
        </header>

        <div key={activeTab} className="p-8 flex-1 animate-fade-up">
          {activeTab === 'dashboard' && <DashboardView apiKey={apiKey} logEvents={logEvents} />}
          {activeTab === 'sdk' && <SDKPlayground apiKey={apiKey} setLogEvents={setLogEvents} />}
          {activeTab === 'journeys' && <JourneysView />}
          {activeTab === 'funnels' && <FunnelsView />}
          {activeTab === 'retention' && <RetentionView />}
          {activeTab === 'experiments' && <ExperimentsView />}
          {activeTab === 'ai' && <AIView />}
          {activeTab === 'segmentation' && <SegmentationView />}
          {activeTab === 'heatmaps' && <HeatmapsView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'notifications' && <NotificationsView />}
          {activeTab === 'admin' && <AdminConsoleView />}
          {activeTab === 'portfolio' && <PortfolioView selectedDoc={selectedDoc} setSelectedDoc={setSelectedDoc} />}
          {activeTab === 'api' && <APIExplorerView apiKey={apiKey} />}
          {activeTab === 'settings' && <SettingsView apiKey={apiKey} setApiKey={setApiKey} />}
        </div>
      </main>
    </div>
  );
};

export default App;
