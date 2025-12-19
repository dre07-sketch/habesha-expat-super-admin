import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Lock, ArrowRight } from 'lucide-react';

interface ResetPasswordProps {
    email?: string;
    onSuccess?: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ email: propEmail, onSuccess }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Get the email passed from props or the OTP Verification screen
    const email = propEmail || location.state?.email;

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State for inputs
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Redirect to login if someone tries to access this page directly without an email
    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    // Canvas Ref & Effect (Unchanged from your code)
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const particles: any[] = [];
        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                dx: (Math.random() - 0.5) * 0.3,
                dy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 2,
                alpha: Math.random() * 0.5 + 0.1,
            });
        }
        const animate = () => {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`;
                ctx.fill();
            });
        };
        animate();
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Client-side Validation
        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            // 2. Call the API
            const response = await fetch('http://localhost:5000/api/forget-password/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    if (onSuccess) onSuccess();
                    else navigate('/login');
                }, 3000);
            } else {
                setError(data.message || "Failed to update password");
            }
        } catch (err) {
            console.error(err);
            setError("Server connection failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617] relative overflow-hidden font-sans selection:bg-yellow-500/30">
            {/* Background Elements matching Login.tsx */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(135deg, #eab308 25%, transparent 25%), linear-gradient(225deg, #eab308 25%, transparent 25%), linear-gradient(45deg, #eab308 25%, transparent 25%), linear-gradient(315deg, #eab308 25%, transparent 25%)`,
                        backgroundPosition: '10px 0, 10px 0, 0 0, 0 0',
                        backgroundSize: '40px 40px',
                        backgroundRepeat: 'repeat'
                    }}>
                </div>
            </div>

            <div className="relative z-10 w-full max-w-[420px] mx-auto p-4">
                <div className="relative bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_0_60px_-15px_rgba(234,179,8,0.15)] overflow-hidden">
                    {/* Top Gradient Border */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-600 via-yellow-500 to-red-600 opacity-100 w-full shadow-[0_0_15px_rgba(234,179,8,0.4)]"></div>

                    <div className="p-8 md:p-12 relative">

                        {success ? (
                            <div className="text-center animate-fade-in py-8">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500 drop-shadow-md" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Access Restored</h3>
                                <p className="text-slate-400 text-sm mb-6">Your password has been successfully updated.</p>
                                <div className="flex items-center justify-center gap-2 text-xs text-yellow-500 uppercase tracking-widest font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                    Redirecting to portal...
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fade-in-up">

                                <div className="mb-10 text-center relative z-20">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-950 border border-white/10 mb-6 shadow-2xl relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent"></div>
                                        <Lock className="w-8 h-8 text-yellow-500 drop-shadow-md" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">New Credentials</h2>
                                    <p className="text-slate-400 text-sm font-light">
                                        Create a secure password for <br /> <span className='text-yellow-500 font-medium'>{email}</span>
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                    <div className="space-y-2 group">
                                        <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-400 transition-colors pointer-events-none">
                                                <Lock className="w-5 h-5" strokeWidth={1.5} />
                                            </div>
                                            <input
                                                type="password"
                                                placeholder="New Password (min 8 chars)"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-black/40 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all shadow-inner"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 group">
                                        <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-400 transition-colors pointer-events-none">
                                                <Lock className="w-5 h-5" strokeWidth={1.5} />
                                            </div>
                                            <input
                                                type="password"
                                                placeholder="Confirm Password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-black/40 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all shadow-inner"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="text-center text-red-400 text-sm bg-red-900/20 py-2 px-4 rounded-lg border border-red-800/30">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full relative overflow-hidden bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-900/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed group mt-4"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Updating...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                Update Password
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                    {/* Card Footer */}
                    <div className="bg-slate-950/50 py-4 text-center border-t border-white/5 backdrop-blur-md">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
                            Habesha Expat <span className="w-1 h-1 rounded-full bg-slate-600"></span> © 2025
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};