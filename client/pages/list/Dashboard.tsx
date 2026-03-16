import React, { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
    AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    Users, FileText, Mic, Video, Calendar,
    Globe, MessageSquare, Mail, MapPin, Star,
    Briefcase, TrendingUp, Building2, ArrowRight,
    Activity, Zap, Award, Crown, Sparkles, Target,
    Shield, Heart, Link as LinkIcon
} from 'lucide-react';
import { CITY_COORDINATES, COUNTRY_FLAGS } from '../../cityCoordinates';

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeMetrics, setActiveMetrics] = useState(['users', 'articles']);
    const [dashboardData, setDashboardData] = useState({
        summary: {} as any,
        growth: [] as any[],
        membership: {} as any,
        engagement: {} as any,
        business: {} as any,
        locations: [] as any[]
    });

    const LOCATION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b', '#ef4444'];

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

                const fetchSafe = async (url: string) => {
                    try {
                        const res = await fetch(url, { headers });
                        if (!res.ok) return { success: false, data: {} };
                        return await res.json();
                    } catch (e) {
                        return { success: false, data: {} };
                    }
                };

                const [summary, growth, membership, engagement, business, locations] = await Promise.all([
                    fetchSafe('http://localhost:5000/api/dashboard/summary'),
                    fetchSafe('http://localhost:5000/api/dashboard/growth'),
                    fetchSafe('http://localhost:5000/api/dashboard/membership'),
                    fetchSafe('http://localhost:5000/api/dashboard/engagement'),
                    fetchSafe('http://localhost:5000/api/dashboard/business'),
                    fetchSafe('http://localhost:5000/api/dashboard/locations/top')
                ]);

                setDashboardData({
                    summary: summary.data || {},
                    growth: Array.isArray(growth.data) ? growth.data : [],
                    membership: membership.data || {},
                    engagement: engagement.data || {},
                    business: business.data || {},
                    locations: Array.isArray(locations.data) ? locations.data : []
                });
                setLoading(false);
            } catch (err) {
                setError('Failed to reach analytics server');
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const toggleMetric = (metric: string) => {
        if (activeMetrics.includes(metric)) {
            if (activeMetrics.length > 1) setActiveMetrics(activeMetrics.filter(m => m !== metric));
        } else {
            setActiveMetrics([...activeMetrics, metric]);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] w-full">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                    <div className="absolute inset-4 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin-slow" />
                    <Activity className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={32} />
                </div>
                <p className="mt-8 text-xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent animate-pulse uppercase tracking-widest">
                    Initializing Neural Core...
                </p>
                <div className="mt-2 w-48 h-1 overflow-hidden bg-slate-200 dark:bg-slate-800 rounded-full">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-progress" />
                </div>
            </div>
        );
    }

    const summaryStats = [
        { label: 'Users', value: dashboardData.summary.users || 0, icon: Users, color: 'blue', growth: '+12%', progress: 85 },
        { label: 'Businesses', value: dashboardData.summary.businesses || 0, icon: Building2, color: 'emerald', growth: '+18%', progress: 62 },
        { label: 'Jobs', value: dashboardData.summary.jobs || 0, icon: Briefcase, color: 'orange', growth: '+5%', progress: 41 },
        { label: 'Podcasts', value: dashboardData.summary.podcasts || 0, icon: Mic, color: 'rose', growth: '+8%', progress: 34 },
        { label: 'Videos', value: dashboardData.summary.videos || 0, icon: Video, color: 'sky', growth: '+15%', progress: 56 },
        { label: 'Articles', value: dashboardData.summary.articles || 0, icon: FileText, color: 'cyan', growth: '+24%', progress: 91 },
        { label: 'Events', value: dashboardData.summary.events || 0, icon: Calendar, color: 'indigo', growth: '+2%', progress: 18 },
    ];

    const growthMetrics = [
        { key: 'users', label: 'Users', color: '#3b82f6', icon: Users },
        { key: 'articles', label: 'Articles', color: '#06b6d4', icon: FileText },
        { key: 'businesses', label: 'Businesses', color: '#10b981', icon: Building2 },
        { key: 'videos', label: 'Videos', color: '#ef4444', icon: Video },
        { key: 'podcasts', label: 'Podcasts', color: '#f59e0b', icon: Mic },
    ];

    const getFlag = (name: string) => COUNTRY_FLAGS[name] || '🌐';

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-1000 slide-in-from-bottom-4">
            {/* Header / Stats Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3">
                {summaryStats.map((stat, i) => (
                    <div key={i} className="group relative bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl p-3.5 rounded-2xl border border-white dark:border-slate-800 shadow-lg hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-1">
                        <div className={`absolute top-0 right-0 w-16 h-16 bg-${stat.color}-500/5 rounded-full blur-xl group-hover:bg-${stat.color}-500/10 transition-colors`} />
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-center mb-3">
                                <div className={`p-2 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={18} />
                                </div>
                                <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                                    {stat.growth}
                                </span>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</h4>
                                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 truncate tracking-tight">
                                    {stat.value.toLocaleString()}
                                </div>
                            </div>
                            <div className="mt-3 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full bg-${stat.color}-500 rounded-full transition-all duration-1000 delay-300`}
                                    style={{ width: `${stat.progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Intelligence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Growth Chart */}
                <div className="lg:col-span-8 bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white dark:border-slate-800 shadow-xl overflow-hidden group">
                    <div className="p-6 pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/40">
                                <TrendingUp size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Growth Intelligence</h2>
                                <p className="text-xs text-slate-400">Advanced multi-metric scaling analysis</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                            {growthMetrics.map((m) => (
                                <button
                                    key={m.key}
                                    onClick={() => toggleMetric(m.key)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                                        activeMetrics.includes(m.key)
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                    }`}
                                >
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[320px] w-full mt-6 px-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dashboardData.growth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    {growthMetrics.map(m => (
                                        <linearGradient key={m.key} id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={m.color} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={m.color} stopOpacity={0} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                                <XAxis 
                                    dataKey="name" 
                                    className="text-[10px] font-bold text-slate-400"
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis 
                                    className="text-[10px] font-bold text-slate-400"
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
                                />
                                <RechartsTooltip 
                                    content={({ active, payload }) => {
                                        if (active && payload?.length) {
                                            return (
                                                <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700 p-4 rounded-2xl shadow-2xl">
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{payload[0].payload.name}</p>
                                                    <div className="space-y-2">
                                                        {payload.map((p, idx) => (
                                                            <div key={idx} className="flex items-center justify-between gap-8">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                                                    <span className="text-xs font-bold text-white capitalize">{p.name}</span>
                                                                </div>
                                                                <span className="text-xs font-black text-white">{p.value?.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                {growthMetrics.map(m => activeMetrics.includes(m.key) && (
                                    <Area
                                        key={m.key}
                                        type="monotone"
                                        dataKey={m.key}
                                        stroke={m.color}
                                        strokeWidth={3}
                                        fill={`url(#grad-${m.key})`}
                                        animationDuration={1500}
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Community Map View */}
                <div className="lg:col-span-4 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-center bg-no-repeat opacity-20 group-hover:scale-110 transition-transform duration-[10s] mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                    
                    <div className="relative z-10 p-6 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-cyan-500 rounded-2xl shadow-lg shadow-cyan-500/40">
                                    <Globe size={24} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Live Community</h2>
                                    <p className="text-xs text-cyan-400">Real-time global activity</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            {dashboardData.locations.slice(0, 5).map((loc, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-white/20 transition-all hover:bg-white/10">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{getFlag(loc.location)}</span>
                                        <div>
                                            <p className="text-sm font-bold text-white">{loc.location || 'Unknown'}</p>
                                            <div className="flex items-center gap-1">
                                                <Users size={10} className="text-slate-400" />
                                                <span className="text-[10px] text-slate-400">{loc.count} active</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-black text-cyan-400">+12.4%</div>
                                        <div className="flex gap-0.5 mt-1 justify-end">
                                            {[...Array(5)].map((_, idx) => (
                                                <div key={idx} className={`w-1 h-3 rounded-full ${idx < 4 - i ? 'bg-cyan-500' : 'bg-slate-700'}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="mt-6 w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl text-sm font-black text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all group flex items-center justify-center gap-2">
                            EXPLORE FULL MAP
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Insight Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Content Engagement Card */}
                <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white dark:border-slate-800 shadow-xl p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-rose-600 rounded-2xl shadow-lg shadow-rose-500/40">
                                <Zap size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Engagement Ecosystem</h2>
                                <p className="text-xs text-slate-400">Content retention and interaction flow</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="flex -space-x-2">
                                {[1,2,3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800" />
                                ))}
                            </div>
                            <span className="text-[10px] font-black text-slate-500">+142k+ online</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { 
                              label: 'Articles', icon: FileText, color: 'blue', 
                              views: dashboardData.engagement.totals?.total_article_views || 0,
                              likes: dashboardData.engagement.totals?.article_likes || 0,
                              comments: dashboardData.engagement.totals?.article_comments || 0,
                              progress: 85
                            },
                            { 
                              label: 'Videos', icon: Video, color: 'sky', 
                              views: dashboardData.engagement.totals?.total_video_views || 0,
                              likes: dashboardData.engagement.totals?.video_likes || 0,
                              comments: dashboardData.engagement.totals?.video_comments || 0,
                              progress: 64
                            },
                            { 
                              label: 'Podcasts', icon: Mic, color: 'rose', 
                              views: dashboardData.engagement.totals?.total_podcasts || 0,
                              likes: dashboardData.engagement.totals?.podcast_likes || 0,
                              comments: dashboardData.engagement.totals?.podcast_comments || 0,
                              progress: 42
                            },
                            { 
                              label: 'Directory', icon: MapPin, color: 'amber', 
                              views: dashboardData.engagement.totals?.total_businesses || 0,
                              likes: dashboardData.business.reviews?.total_reviews || 0,
                              comments: 0, 
                              progress: 71
                            }
                        ].map((item, i) => (
                            <div key={i} className="group p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl bg-${item.color}-500/10 text-${item.color}-600 dark:text-${item.color}-400`}>
                                            <item.icon size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white">{item.label}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Historical Engagement</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                            <Globe size={12} className="text-blue-500" />
                                            <span className="text-[11px] font-black text-slate-700 dark:text-slate-200">{item.views?.toLocaleString()}</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase">Views</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                            <Heart size={12} className="text-rose-500" />
                                            <span className="text-[11px] font-black text-slate-700 dark:text-slate-200">{item.likes?.toLocaleString()}</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase">Likes</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                            <MessageSquare size={12} className="text-emerald-500" />
                                            <span className="text-[11px] font-black text-slate-700 dark:text-slate-200">{item.comments?.toLocaleString()}</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase">Comments</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full bg-${item.color}-500 rounded-full transition-all duration-1000 delay-300`}
                                        style={{ width: `${item.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Business Analytics Insights */}
                <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white dark:border-slate-800 shadow-xl p-6 transition-all flex flex-col max-h-[600px]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-600 rounded-2xl shadow-lg shadow-amber-500/40">
                                <Award size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Business Analytics</h2>
                                <p className="text-xs text-slate-400">Merchant ecosystem and sector performance</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-900/40 rounded-3xl border border-slate-200/50 dark:border-slate-800">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-md">
                                    <Star className="text-amber-500 animate-pulse" size={20} fill="#f59e0b" />
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-emerald-500">+14%</div>
                                    <div className="text-[8px] text-slate-400 uppercase font-black">Quality index</div>
                                </div>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-4">{dashboardData.business.reviews?.avg_rating || '0.0'}</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Global average rating</p>
                        </div>

                        <div className="p-5 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl border border-blue-500/20 shadow-xl shadow-blue-600/10">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-md">
                                    <Building2 className="text-white" size={20} />
                                </div>
                                <Sparkles className="text-cyan-200 animate-bounce-slow" size={20} />
                            </div>
                            <h3 className="text-3xl font-black text-white mt-4">{dashboardData.business.total_businesses || 0}</h3>
                            <p className="text-xs text-blue-100 font-bold uppercase tracking-widest mt-1">Verified partners</p>
                        </div>
                    </div>

                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Market Sector Breakdown</h4>
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {dashboardData.business.categories?.map((cat: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800 hover:scale-[1.01] transition-transform">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-lg text-lg">
                                        {['🍔', '🏥', '☕', '👗', '🚗', '🛠️', '🎓', '🛡️'][i % 8]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white capitalize">{cat.category}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{cat.count} verified listings</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-900 dark:text-white">
                                            {cat.percentage_change >= 0 ? '+' : ''}{cat.percentage_change}%
                                        </p>
                                        <div className="w-16 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                                            <div 
                                                className={`h-full ${cat.percentage_change >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                                                style={{ width: `${Math.min(100, Math.abs(cat.percentage_change))}%` }} 
                                            />
                                        </div>
                                    </div>
                                    <ArrowRight size={16} className="text-slate-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
