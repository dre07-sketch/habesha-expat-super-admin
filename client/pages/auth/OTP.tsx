import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '../../UIComponents';

interface OTPProps {
    onVerified?: () => void;
}

export const OTP: React.FC<OTPProps> = ({ onVerified }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [hash, setHash] = useState('');

    useEffect(() => {
        const storedEmail = localStorage.getItem('otpEmail');
        const storedHash = localStorage.getItem('otpHash');

        if (storedEmail && storedHash) {
            setEmail(storedEmail);
            setHash(storedHash);
        } else {
            // Check if we just navigated from forgot-password logic
            // (Optional: add better handling here)
            // navigate('/forgot-password'); 
            // Commenting out redirect for now to allow viewing the page if state is somehow lost but user is testing, 
            // but ideally we should redirect.
            // Let's actually redirect if missing, to be safe.
            // navigate('/forgot-password');
        }
    }, [navigate]);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(30);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Initialize countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setResendCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Particle System Effect (unchanged)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: { x: number; y: number; dx: number; dy: number; size: number; alpha: number }[] = [];
        for (let i = 0; i < 50; i++) {
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

    // Input Focus Logic (unchanged)
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;
        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
        if (element.value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
        // Clear error when user starts typing
        if (error) setError(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (index > 0 && otp[index] === '') {
                inputRefs.current[index - 1]?.focus();
            }
            if (otp[index] !== '') {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpValue = otp.join('');

        if (otpValue.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Updated API endpoint to match the server
            const response = await fetch('http://localhost:5000/api/forget-password/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    otp: otpValue,
                    hash
                }),
            });

            const data = await response.json();

            if (response.ok && data.verified) {
                if (onVerified) {
                    onVerified();
                } else {
                    navigate('/reset-password', { state: { email } });
                }
            } else {
                setError(data.message || 'Invalid verification code');
            }
        } catch (err) {
            console.error('API Error:', err);
            if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                setError('Unable to connect to the server. Please check your connection.');
            } else {
                setError('Network error. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCountdown > 0) return;

        setResendLoading(true);
        setError(null);

        try {
            // Updated resend endpoint to match the server (send-otp is used for both initial and resend)
            const response = await fetch('http://localhost:5000/api/forget-password/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setResendCountdown(30);
                setOtp(['', '', '', '', '', '']);
                // Focus first input
                if (inputRefs.current[0]) {
                    inputRefs.current[0].focus();
                }
                // Update hash if provided in response
                if (data.hash) {
                    setHash(data.hash);
                    localStorage.setItem('otpHash', data.hash);
                }
            } else {
                setError(data.message || 'Failed to resend code');
            }
        } catch (err: any) {
            console.error('Resend Error:', err);
            if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                setError('Unable to connect to the server. Please check your connection.');
            } else {
                setError('Network error. Please try again.');
            }
        } finally {
            setResendLoading(false);
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

            <div className="relative w-full max-w-[420px] perspective-1000 z-10">
                <div className="relative bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_0_60px_-15px_rgba(234,179,8,0.15)] overflow-hidden">
                    {/* Top Gradient Border */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-600 via-yellow-500 to-red-600 opacity-100 w-full shadow-[0_0_15px_rgba(234,179,8,0.4)]"></div>

                    <div className="p-8 md:p-12 relative">
                        <button
                            onClick={() => navigate('/login')} // Simplified to go back to main login
                            className="flex items-center text-xs font-medium text-slate-500 hover:text-white transition-colors mb-8 group uppercase tracking-wider relative z-20"
                        >
                            <ArrowLeft className="w-3 h-3 mr-1 group-hover:-translate-x-1 transition-transform" />
                            Back to Login
                        </button>

                        <div className="mb-10 text-center relative z-20">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-950 border border-white/10 mb-6 shadow-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent"></div>
                                <ShieldCheck className="w-10 h-10 text-yellow-500 drop-shadow-md animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Security Check</h2>
                            <p className="text-slate-400 text-sm">
                                Enter the 6-digit code sent to<br />
                                <span className="text-yellow-500 font-medium">{email}</span>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8 relative z-20">
                            <div className="flex justify-center gap-2 md:gap-3 mx-auto">
                                {otp.map((data, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="text"
                                        maxLength={1}
                                        value={data}
                                        onChange={e => handleChange(e.target, index)}
                                        onKeyDown={e => handleKeyDown(e, index)}
                                        className={`w-11 h-14 md:w-12 md:h-16 bg-black/40 border rounded-xl text-center text-xl md:text-2xl font-bold text-white transition-all duration-200 shadow-inner
                                            ${data
                                                ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)] scale-105'
                                                : 'border-slate-700 hover:border-slate-600'
                                            } focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 focus:outline-none`}
                                    />
                                ))}
                            </div>

                            {error && (
                                <div className="text-center text-red-400 text-sm bg-red-900/20 py-2 px-4 rounded-lg border border-red-800/30">
                                    {error}
                                </div>
                            )}

                            <div className="text-center space-y-6">
                                <button
                                    type="submit"
                                    disabled={otp.join('').length !== 6 || loading}
                                    className="w-full relative overflow-hidden bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-900/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Verifying...' : 'Verify Identity'}
                                </button>

                                <p className="text-xs text-slate-500">
                                    Didn't receive code?{' '}
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resendCountdown > 0 || resendLoading}
                                        className="text-yellow-500 hover:text-yellow-400 font-medium hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {resendLoading ? 'Sending...' : resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
                                    </button>
                                </p>
                            </div>
                        </form>
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