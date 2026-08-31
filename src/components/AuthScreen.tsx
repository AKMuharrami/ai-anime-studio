import React, { useState } from 'react';
import { Mail, Lock, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setMessage("Verification code sent to your email.");
      setMode('verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setMessage("Email verified successfully! Please log in.");
      setMode('login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.error?.includes('verify')) {
          setMode('verify');
          throw new Error("Please verify your email first (check your inbox for OTP).");
        }
        throw new Error(data.error);
      }
      
      localStorage.setItem('ais_token', data.token);
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-rose-500 selection:text-white">
      
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-rose-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20 mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Verify Email'}
          </h1>
          <p className="text-sm text-slate-400">
            {mode === 'login' 
              ? 'Enter your credentials to access the studio.' 
              : mode === 'register' 
              ? 'Join the worldwide anime & manga creator community.' 
              : 'Enter the 6-digit OTP sent to your email.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-sm font-medium text-center">
            {message}
          </div>
        )}

        {mode === 'verify' ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">One-Time Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
                  placeholder="123456"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
                  placeholder="artist@studio.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-900/20 disabled:opacity-50 mt-2"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Access Studio' : 'Create Account'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-slate-800 pt-6">
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors font-medium"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up for global access." 
              : "Already have an account? Sign in."}
          </button>
        </div>
      </div>
    </div>
  );
};
