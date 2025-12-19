import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OTP } from './OTP';
import { ResetPassword } from './ResetPassword';
import { Mail, Lock, ArrowLeft, ArrowRight, KeyRound, Loader2, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'forgot' | 'otp' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (view === 'login') {
      if (!email || !password) {
        setError("Email and password are required");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/login/login-super-admins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        // Store token in localStorage
        localStorage.setItem('authToken', data.token);

        // Call onLogin with token and user data
        onLogin(data.token, data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Forgot password flow
      if (!email) {
        setError("Email is required");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/forget-password/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store email and hash for OTP page
          localStorage.setItem('otpEmail', email);
          if (data.hash) {
            localStorage.setItem('otpHash', data.hash);
          }
          // Switch view to OTP component
          setView('otp');
        } else {
          setError(data.message || 'Failed to send verification code');
        }
      } catch (err) {
        setError('Failed to send reset instructions');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleViewChange = (newView: 'login' | 'forgot') => {
    setError(null);
    setIsAnimating(true);
    setTimeout(() => {
      setView(newView);
      setIsAnimating(false);
    }, 400);
  };

  if (view === 'otp') {
    return <OTP onVerified={() => setView('reset')} />;
  }

  if (view === 'reset') {
    return <ResetPassword email={email} onSuccess={() => setView('login')} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617] relative overflow-hidden font-sans selection:bg-yellow-500/30">
      {/* ... (background elements remain unchanged) ... */}

      {/* --- PREMIUM GLASS CARD --- */}
      <div className="relative w-full max-w-[420px] perspective-1000 z-10">
        <div
          className={`relative bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_0_60px_-15px_rgba(234,179,8,0.15)] overflow-hidden transition-all duration-500 ease-in-out transform ${isAnimating ? 'rotate-y-12 opacity-0 translate-x-10 scale-95' : 'rotate-y-0 opacity-100 translate-x-0 scale-100'}`}
        >
          {/* Top Gradient Border (Green, Yellow, Red) */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-600 via-yellow-500 to-red-600 opacity-100 w-full shadow-[0_0_15px_rgba(234,179,8,0.4)]"></div>

          <div className="p-8 md:p-12 relative">

            {/* Logo Area */}
            <div className="flex justify-center mb-10">
              <div className="relative group cursor-default">
                {/* Glowing Ring mimicking Mesob shape */}
                <div className="absolute inset-[-6px] rounded-full border-2 border-yellow-500/20 border-dashed animate-[spin_20s_linear_infinite]"></div>

                <div className="relative w-24 h-24 bg-slate-950 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden">
                  {view === 'login' ? (
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 tracking-tighter font-serif">H</span>
                    </div>
                  ) : (
                    <KeyRound size={36} className="text-yellow-400 animate-pulse" />
                  )}
                  {/* Gloss Shine */}
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Text Headers */}
            <div className="text-center mb-8 space-y-2">
              <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">
                {view === 'login' ? 'Habesha Expat' : 'Recovery'}
              </h2>
              <p className="text-slate-400 text-sm font-medium flex justify-center items-center gap-2">
                {view === 'login' ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Super Admin Portal
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  </>
                ) : (
                  'Enter your email to reset access'
                )}
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-3 bg-red-900/30 border border-red-700/50 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email Input */}
              <div className="group">
                <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-400 transition-colors">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full bg-black/40 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder:text-slate-600 shadow-inner text-sm font-medium"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    required
                  />
                </div>
              </div>

              {/* Password Input (Login Only) */}
              {view === 'login' && (
                <div className="group">
                  <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-400 transition-colors">
                      <Lock size={20} />
                    </div>
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full bg-black/40 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder:text-slate-600 shadow-inner text-sm font-medium"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                      }}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Links Row */}
              {view === 'login' && (
                <div className="flex items-center justify-between text-xs font-medium text-slate-400 px-1">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition-colors">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-yellow-500 focus:ring-offset-0 focus:ring-yellow-500/30 accent-yellow-500" />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleViewChange('forgot')}
                    className="text-yellow-500 hover:text-yellow-400 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Main Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-900/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 group border border-white/10 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

                <div className="flex items-center justify-center gap-2 relative z-10 text-slate-900">
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin text-slate-900" />
                  ) : view === 'login' ? (
                    <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                  ) : (
                    <>Send Reset Link <Mail size={18} /></>
                  )}
                </div>
              </button>
            </form>

            {/* Back Button */}
            {view === 'forgot' && (
              <button
                onClick={() => handleViewChange('login')}
                className="mt-8 w-full flex items-center justify-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
              </button>
            )}
          </div>

          {/* Card Footer */}
          <div className="bg-slate-950/50 py-4 text-center border-t border-white/5 backdrop-blur-md rounded-b-[2rem]">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
              Habesha Expat <span className="w-1 h-1 rounded-full bg-slate-600"></span> © 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;