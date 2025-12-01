
import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft, ArrowRight, KeyRound, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'login') {
      if (email && password) {
          setIsLoading(true);
          // Simulate network login
          setTimeout(() => {
              setIsLoading(false);
              onLogin();
          }, 2000);
      }
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        alert('Password reset instructions sent to ' + email);
        handleViewChange('login');
      }, 1500);
    }
  };

  const handleViewChange = (newView: 'login' | 'forgot') => {
      setIsAnimating(true);
      setTimeout(() => {
          setView(newView);
          setIsAnimating(false);
      }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617] relative overflow-hidden font-sans selection:bg-yellow-500/30">
      
      {/* Inline Styles for Custom 3D Animations */}
      <style>{`
        @keyframes spin3d {
          0% { transform: rotateX(60deg) rotateZ(0deg); }
          100% { transform: rotateX(60deg) rotateZ(360deg); }
        }
        .lalibela-3d {
          transform-style: preserve-3d;
          animation: spin3d 20s linear infinite;
        }
        .layer {
          position: absolute;
          inset: 0;
          transform: translateZ(var(--z));
          opacity: var(--opacity);
        }
      `}</style>

      {/* --- BACKGROUND: ETHIOPIAN HERITAGE --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
          
          {/* 1. Mesob Weave Pattern Overlay (Subtle Texture) */}
          <div className="absolute inset-0 opacity-[0.03]" 
               style={{ 
                   backgroundImage: `
                        linear-gradient(135deg, #eab308 25%, transparent 25%), 
                        linear-gradient(225deg, #eab308 25%, transparent 25%), 
                        linear-gradient(45deg, #eab308 25%, transparent 25%), 
                        linear-gradient(315deg, #eab308 25%, transparent 25%)
                   `,
                   backgroundPosition: '10px 0, 10px 0, 0 0, 0 0',
                   backgroundSize: '40px 40px',
                   backgroundRepeat: 'repeat'
               }}>
          </div>

          {/* 2. Large Rotating Mesob Geometry (Center Background) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] opacity-10">
             <div className="absolute inset-0 border-[40px] border-dashed border-yellow-600/20 rounded-full animate-[spin_60s_linear_infinite]"></div>
             <div className="absolute inset-[100px] border-[20px] border-dotted border-red-600/20 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
             <div className="absolute inset-[200px] border-[10px] border-double border-emerald-600/20 rounded-full animate-[spin_30s_linear_infinite]"></div>
             <div className="absolute inset-[350px] rounded-full bg-gradient-to-br from-red-900 via-yellow-900 to-emerald-900 blur-3xl opacity-50 animate-pulse"></div>
          </div>

          {/* 3. Axum Obelisk (Bottom Left) - Stately and tall */}
          <div className="absolute bottom-0 left-[2%] w-[120px] h-[400px] opacity-30 pointer-events-none z-0 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
             <svg viewBox="0 0 100 400" className="w-full h-full fill-slate-800 stroke-slate-600 stroke-1">
                {/* Base */}
                <path d="M 10 390 L 90 390 L 85 380 L 15 380 Z" />
                {/* Main Shaft */}
                <path d="M 15 380 L 25 20 L 75 20 L 85 380 Z" />
                {/* Top Rounded Part */}
                <path d="M 25 20 C 25 0 75 0 75 20 Z" />
                {/* Detailed Stories/Windows */}
                {[...Array(10)].map((_, i) => (
                    <g key={i}>
                        <rect x="35" y={40 + i * 32} width="30" height="20" rx="1" className="fill-slate-900" />
                        <circle cx="50" cy={50 + i * 32} r="3" className="fill-slate-700" />
                    </g>
                ))}
                {/* Top Circle */}
                <circle cx="50" cy="25" r="6" className="fill-yellow-600/50" />
             </svg>
          </div>

          {/* 4. 3D Spinning Lalibela (Bet Giyorgis) - Top Right */}
          <div className="absolute top-[15%] right-[10%] w-[200px] h-[200px] perspective-[1000px] pointer-events-none">
             <div className="lalibela-3d w-full h-full relative">
                {/* We create depth by stacking multiple SVG layers with different Z-index translates */}
                {[...Array(10)].map((_, i) => (
                    <div 
                        key={i} 
                        className="layer" 
                        style={{ 
                            '--z': `${i * 4}px`, 
                            '--opacity': i === 9 ? 0.8 : 0.3 
                        } as React.CSSProperties}
                    >
                        <svg viewBox="0 0 200 200" className={`w-full h-full ${i === 9 ? 'fill-none stroke-yellow-500 stroke-2 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'fill-amber-900/40'}`}>
                            {/* The Iconic Cross Shape */}
                            <path d="M 70 20 L 130 20 L 130 70 L 180 70 L 180 130 L 130 130 L 130 180 L 70 180 L 70 130 L 20 130 L 20 70 L 70 70 Z" />
                            {/* Inner Detail (Roof Lines) only on top layer */}
                            {i === 9 && (
                                <path d="M 85 35 L 115 35 L 115 85 L 165 85 L 165 115 L 115 115 L 115 165 L 85 165 L 85 115 L 35 115 L 35 85 L 85 85 Z" className="stroke-yellow-500/50 fill-none" />
                            )}
                        </svg>
                    </div>
                ))}
                {/* Ground Hole Outline */}
                <div className="layer" style={{ '--z': '-20px', '--opacity': 0.1 } as React.CSSProperties}>
                     <svg viewBox="0 0 200 200" className="w-full h-full fill-black">
                        <rect x="10" y="10" width="180" height="180" rx="10" />
                     </svg>
                </div>
             </div>
          </div>

          {/* 5. Jebena (Coffee Pot) Silhouette with Steam (Bottom Right) */}
          <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] opacity-20 pointer-events-none z-0">
             <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl text-black fill-current">
                <path d="M100 170 C 70 170, 50 150, 50 125 C 50 105, 60 90, 85 85 L 85 40 L 80 35 L 120 35 L 115 40 L 115 85 C 140 90, 150 105, 150 125 C 150 150, 130 170, 100 170 Z" />
                <path d="M115 50 Q 155 60, 145 110" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                <path d="M60 100 Q 30 90, 25 60" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
             </svg>
             
             <div className="absolute top-[10%] left-[10%] w-full h-full">
                <div className="absolute top-[20px] left-[40px] w-4 h-4 bg-white/20 rounded-full blur-md animate-[blob_3s_infinite] opacity-0" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-[10px] left-[50px] w-6 h-6 bg-white/10 rounded-full blur-lg animate-[blob_4s_infinite] opacity-0" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-[0px] left-[30px] w-5 h-5 bg-white/15 rounded-full blur-md animate-[blob_5s_infinite] opacity-0" style={{ animationDelay: '2s' }}></div>
             </div>
          </div>

          {/* 6. Floating Adey Abeba (Bidens macroptera) Flowers */}
          {[...Array(15)].map((_, i) => (
              <div 
                key={i}
                className="absolute animate-blob"
                style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${15 + Math.random() * 10}s`,
                    opacity: 0.4
                }}
              >
                  <svg width="40" height="40" viewBox="0 0 100 100" className="animate-[spin_12s_linear_infinite]">
                      {[...Array(8)].map((_, j) => (
                          <ellipse 
                            key={j}
                            cx="50" cy="20" rx="8" ry="20" 
                            fill="#facc15" 
                            transform={`rotate(${j * 45} 50 50)`}
                            className="opacity-90"
                          />
                      ))}
                      <circle cx="50" cy="50" r="12" fill="#ea580c" />
                  </svg>
              </div>
          ))}
      </div>

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
                                onChange={(e) => setEmail(e.target.value)}
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
                                    onChange={(e) => setPassword(e.target.value)}
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
