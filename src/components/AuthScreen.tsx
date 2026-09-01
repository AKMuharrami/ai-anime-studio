import React, { useState } from 'react';
import { Mail, Lock, KeyRound, ArrowRight, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (token: string, user: any) => void;
  onClose?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service & Shariah Compliance Policy to register.");
      return;
    }
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
      
      if (data.otpCode) {
        setMessage(`Account created! Fallback Verification Code: ${data.otpCode}`);
        setOtp(data.otpCode);
      } else {
        setMessage("Verification code sent to your email.");
      }
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
      
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-500 hover:text-slate-300 transition-colors h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-sm font-bold font-mono"
            aria-label="Close"
          >
            ✕
          </button>
        )}
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
              ? 'Join the worldwide anime & manga creator community with Shariah-compliant standards.' 
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

            {mode === 'register' && (
              <div className="flex items-start gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={agreedToTerms} 
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-950 text-rose-600 focus:ring-rose-500 cursor-pointer" 
                  required
                />
                <label htmlFor="terms" className="text-xs text-slate-400 leading-relaxed">
                  I agree to the <button type="button" onClick={() => setShowTermsModal(true)} className="text-rose-400 hover:underline font-semibold">Terms of Service & Content Policy</button> governing content moderation.
                </label>
              </div>
            )}

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

      {/* TERMS OF SERVICE & POLICY MODAL */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-8 overflow-hidden backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-400 border border-rose-500/30">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-['Cinzel',serif]">Terms of Service & Content Policy</h2>
                  <p className="text-xs text-slate-400">Effective Date: 2026 • Creator Community Guidelines & Pricing</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Agreement
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300 leading-relaxed bg-slate-950 font-sans">
              <div className="space-y-3">
                <h3 className="text-base font-bold text-rose-400 font-mono uppercase tracking-wider">1. Acceptance of Terms</h3>
                <p>
                  By creating an account and accessing this Studio platform, you agree to be bound by these Terms of Service, our privacy policies, and our strict Content & Modesty Guidelines.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-rose-400 font-mono uppercase tracking-wider">2. Modesty & Content Guidelines</h3>
                <p>
                  Our platform is dedicated to wholesome, high-craft storytelling, cinematic anime, and authentic Gekiga manga. To maintain a respectful creative environment, the following standards are strictly enforced:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  <li><strong className="text-white">Prohibited Immodesty (Degenerate Content):</strong> Any attempt to generate nakedness, exposed breasts, cleavage, toplessness, explicit sexualization, form-fitting/tight clothing designed for allure, loli/lolicon, or provocative/seductive positioning is strictly prohibited.</li>
                  <li><strong className="text-white">Allowed Dramatic Conflict:</strong> Narrative elements such as combat, dramatic violence, killing, blood, and traditional storytelling conflict are fully permitted as part of character arcs and plot progression. Furthermore, vice depictions such as villainous gambling, tavern drinking, or antagonist corruption are permitted for storytelling depth and cannot be used as false censorship triggers.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-rose-400 font-mono uppercase tracking-wider">3. Fees, Subscriptions & Generation Credits</h3>
                <p>
                  Platform access and AI generation workloads operate on a credit and subscription model:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  <li><strong className="text-white">Subscription Tiers:</strong> Monthly and annual creator plans grant recurring generation credits for scripts, voiceovers, character turnaround sheets, and manga panels.</li>
                  <li><strong className="text-white">Credit Top-Ups:</strong> Additional generation credits can be purchased on-demand via secure checkout. Unused credits roll over according to active subscription terms.</li>
                  <li><strong className="text-white">Refund Policy:</strong> All subscription fees and credit token purchases are final and non-refundable once credited or consumed in generation pipelines.</li>
                  <li><strong className="text-cyan-300">Multi-Character Panel Disclaimers:</strong> AI generative diffusion models rendering 2 or 3 characters in a single manga panel utilize spatial stage anchoring to enforce visual consistency. Due to generative AI space-binding characteristics, rendering multi-character panels may require 2 or more generation attempts (re-renders or re-rolls) to achieve complete pose separation and eliminate feature blending. All generation credits consumed during panel re-renders are non-refundable.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-rose-400 font-mono uppercase tracking-wider">4. Three-Strike Warning & Permanent Ban System</h3>
                <p>
                  The platform utilizes an automated Content Compliance Guard that scans prompts before rendering. 
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  <li><strong className="text-yellow-400">First & Second Offense:</strong> The prompt is immediately cancelled, and an official warning notice is issued detailing the violation.</li>
                  <li><strong className="text-red-400">Third Offense (Permanent Ban):</strong> Upon recording three (3) policy violations, the account is permanently suspended and banned from accessing studio services or vaults.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-rose-400 font-mono uppercase tracking-wider">5. User Vaults & Intellectual Property</h3>
                <p>
                  Users retain intellectual property rights over their generated screenplays, story arcs, character designs, and manga panels stored within their personal database vaults. The platform provides secure cloud archiving and retrieval across active projects.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <span className="text-xs text-slate-400">Review carefully before accepting.</span>
              <button
                onClick={() => {
                  setAgreedToTerms(true);
                  setShowTermsModal(false);
                }}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-rose-600/30"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>I Agree to Terms</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
