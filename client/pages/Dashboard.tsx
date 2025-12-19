import React, { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
    AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    Users, FileText, Mic, Video, Calendar,
    Globe, MessageSquare, Mail, MapPin, Star,
    Briefcase, TrendingUp, Building2, ArrowRight,
    Activity, Zap, Award, Crown, Sparkles
} from 'lucide-react';
import { CITY_COORDINATES, COUNTRY_FLAGS } from '../cityCoordinates';

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const LOCATION_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#64748b', '#ef4444'];
    const [dashboardData, setDashboardData] = useState({
        summary: {} as any,
        growth: [] as any[],
        membership: {} as any,
        engagement: {} as any,
        business: {} as any,
        locations: [] as any[]
    });

    const [activeMetrics, setActiveMetrics] = useState(['users', 'articles', 'businesses']);

    const toggleMetric = (metric: string) => {
        if (activeMetrics.includes(metric)) {
            if (activeMetrics.length > 1) {
                setActiveMetrics(activeMetrics.filter(m => m !== metric));
            }
        } else {
            setActiveMetrics([...activeMetrics, metric]);
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                const [summaryRes, growthRes, membershipRes, engagementRes, businessRes, locationsRes] = await Promise.all([
                    fetch('http://localhost:5000/api/dashboard/summary'),
                    fetch('http://localhost:5000/api/dashboard/growth'),
                    fetch('http://localhost:5000/api/dashboard/membership'),
                    fetch('http://localhost:5000/api/dashboard/engagement'),
                    fetch('http://localhost:5000/api/dashboard/business'),
                    fetch('http://localhost:5000/api/dashboard/locations/top')
                ]);

                const [summary, growth, membership, engagement, business, locations] = await Promise.all([
                    summaryRes.json(),
                    growthRes.json(),
                    membershipRes.json(),
                    engagementRes.json(),
                    businessRes.json(),
                    locationsRes.json()
                ]);

                if (!summary.success || !growth.success || !membership.success ||
                    !engagement.success || !business.success || !locations.success) {
                    throw new Error('One or more API requests failed');
                }

                setDashboardData({
                    summary: summary.data,
                    growth: growth.data,
                    membership: membership.data,
                    engagement: engagement.data,
                    business: business.data,
                    locations: locations.data
                });

                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data');
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 animate-spin"></div>
                        <Activity className="absolute inset-0 m-auto text-blue-600 dark:text-blue-400" size={32} />
                    </div>
                    <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">Loading analytics...</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Fetching real-time data</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 p-10 rounded-3xl max-w-md border-2 border-red-200 dark:border-red-800 shadow-2xl">
                    <div className="w-20 h-20 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
                        <Zap className="text-white" size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-red-700 dark:text-red-300 mb-3">Connection Error</h2>
                    <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    const getCoordinates = (locationName: string) => {
        if (!locationName) return { top: '50%', left: '50%' };
        if (CITY_COORDINATES[locationName]) return CITY_COORDINATES[locationName];
        const key = Object.keys(CITY_COORDINATES).find(k => locationName.includes(k) || k.includes(locationName));
        if (key) return CITY_COORDINATES[key];
        return { top: '50%', left: '50%' };
    };

    const getFlag = (locationName: string) => {
        if (!locationName) return '🌐';
        if (COUNTRY_FLAGS[locationName]) return COUNTRY_FLAGS[locationName];
        const key = Object.keys(COUNTRY_FLAGS).find(k => locationName.includes(k) || k.includes(locationName));
        return key ? COUNTRY_FLAGS[key] : '🌐';
    };

    const LOCATION_DATA = dashboardData.locations.map(location => ({
        name: location.location,
        value: location.count,
        flag: getFlag(location.location),
        growth: '+12%',
        coordinates: getCoordinates(location.location)
    }));

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    {
                        label: 'Total Users',
                        value: dashboardData.summary.users?.toLocaleString() || '0',
                        badge: '+12%',
                        icon: Users,
                        gradient: 'from-blue-500 to-cyan-500',
                        shadowColor: 'shadow-blue-500/20',
                        progress: 65
                    },
                    {
                        label: 'Businesses',
                        value: dashboardData.summary.businesses?.toLocaleString() || '0',
                        badge: '+18%',
                        icon: Building2,
                        gradient: 'from-emerald-500 to-teal-500',
                        shadowColor: 'shadow-emerald-500/20',
                        progress: 45
                    },
                    {
                        label: 'Jobs Posted',
                        value: dashboardData.summary.jobs?.toLocaleString() || '0',
                        badge: '+5',
                        icon: Briefcase,
                        gradient: 'from-amber-500 to-orange-500',
                        shadowColor: 'shadow-amber-500/20',
                        progress: 20
                    },
                    {
                        label: 'Total Podcasts',
                        value: dashboardData.summary.podcasts?.toLocaleString() || '0',
                        badge: '+8%',
                        icon: Mic,
                        gradient: 'from-rose-500 to-pink-500',
                        shadowColor: 'shadow-rose-500/20',
                        progress: 60
                    },
                    {
                        label: 'Total Videos',
                        value: dashboardData.summary.videos?.toLocaleString() || '0',
                        badge: '+15%',
                        icon: Video,
                        gradient: 'from-sky-500 to-blue-500',
                        shadowColor: 'shadow-sky-500/20',
                        progress: 45
                    },
                    {
                        label: 'Articles',
                        value: dashboardData.summary.articles?.toLocaleString() || '0',
                        badge: '+24%',
                        icon: FileText,
                        gradient: 'from-blue-600 to-cyan-600',
                        shadowColor: 'shadow-blue-500/20',
                        progress: 78
                    },
                    {
                        label: 'Events',
                        value: dashboardData.summary.events?.toLocaleString() || '0',
                        badge: '+2',
                        icon: Calendar,
                        gradient: 'from-teal-500 to-emerald-500',
                        shadowColor: 'shadow-teal-500/20',
                        progress: 80
                    },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="group relative bg-white dark:bg-slate-800/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-700/50 hover:border-transparent overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-xl ${stat.shadowColor}`}>
                                    <stat.icon size={24} className="text-white" />
                                </div>
                                <span className={`text-xs font-black px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20`}>
                                    {stat.badge}
                                </span>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4">{stat.value}</h3>
                            </div>
                            <div className="relative w-full bg-slate-100 dark:bg-slate-700/50 h-2 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full bg-gradient-to-r ${stat.gradient} transform origin-left transition-transform duration-1000 ease-out`}
                                    style={{ width: `${stat.progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative bg-white dark:bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mr-4 shadow-lg shadow-blue-500/20">
                                <TrendingUp className="text-white" size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Monthly Growth Trends</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Track performance across all metrics</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: 'users', label: 'Users', gradient: 'from-blue-500 to-cyan-500' },
                                { key: 'articles', label: 'Articles', gradient: 'from-blue-600 to-cyan-600' },
                                { key: 'businesses', label: 'Businesses', gradient: 'from-slate-600 to-slate-500' },
                                { key: 'videos', label: 'Videos', gradient: 'from-emerald-500 to-teal-500' },
                                { key: 'podcasts', label: 'Podcasts', gradient: 'from-rose-500 to-pink-500' }
                            ].map((metric) => (
                                <button
                                    key={metric.key}
                                    className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${activeMetrics.includes(metric.key)
                                        ? `bg-gradient-to-r ${metric.gradient} text-white shadow-lg`
                                        : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    onClick={() => toggleMetric(metric.key)}
                                >
                                    <div className={`w-2 h-2 rounded-full mr-2 ${activeMetrics.includes(metric.key) ? 'bg-white' : `bg-gradient-to-r ${metric.gradient}`}`}></div>
                                    {metric.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[340px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dashboardData.growth} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorBusinesses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPodcasts" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e2e8f0"
                                    className="dark:stroke-slate-700/50"
                                />
                                <RechartsTooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 shadow-2xl">
                                                    <p className="font-bold text-white mb-3 text-lg">{label}</p>
                                                    <div className="space-y-2">
                                                        {payload.map((entry, index) => (
                                                            <div key={index} className="flex justify-between items-center gap-6">
                                                                <span className="text-slate-400 capitalize text-sm">{entry.dataKey}:</span>
                                                                <span className="text-white font-bold text-sm">{entry.value?.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                    cursor={{ stroke: '#64748b', strokeWidth: 2, strokeDasharray: '5 5' }}
                                />

                                {activeMetrics.includes('users') && (
                                    <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
                                )}
                                {activeMetrics.includes('articles') && (
                                    <Area type="monotone" dataKey="articles" stroke="#2563eb" fillOpacity={1} fill="url(#colorArticles)" strokeWidth={3} />
                                )}
                                {activeMetrics.includes('businesses') && (
                                    <Area type="monotone" dataKey="businesses" stroke="#64748b" fillOpacity={1} fill="url(#colorBusinesses)" strokeWidth={3} />
                                )}
                                {activeMetrics.includes('videos') && (
                                    <Area type="monotone" dataKey="videos" stroke="#10b981" fillOpacity={1} fill="url(#colorVideos)" strokeWidth={3} />
                                )}
                                {activeMetrics.includes('podcasts') && (
                                    <Area type="monotone" dataKey="podcasts" stroke="#f43f5e" fillOpacity={1} fill="url(#colorPodcasts)" strokeWidth={3} />
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
                        {[
                            { label: 'Users', value: dashboardData.summary.users?.toLocaleString() || '0', change: '+12%', gradient: 'from-blue-500 to-cyan-500' },
                            { label: 'Articles', value: dashboardData.summary.articles?.toLocaleString() || '0', change: '+24%', gradient: 'from-blue-600 to-cyan-600' },
                            { label: 'Businesses', value: dashboardData.summary.businesses?.toLocaleString() || '0', change: '+18%', gradient: 'from-slate-600 to-slate-500' },
                            { label: 'Videos', value: dashboardData.summary.videos?.toLocaleString() || '0', change: '+15%', gradient: 'from-emerald-500 to-teal-500' },
                            { label: 'Podcasts', value: dashboardData.summary.podcasts?.toLocaleString() || '0', change: '+8%', gradient: 'from-rose-500 to-pink-500' }
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="group bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-xl"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${stat.gradient}`}></div>
                                    <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${stat.change.startsWith('+')
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                        }`}>
                                        {stat.change}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</div>
                                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="relative bg-white dark:bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mr-4 shadow-lg shadow-blue-500/20">
                                    <Globe className="text-white" size={24} />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Content Engagement</h2>
                            </div>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
                                <ArrowRight size={20} className="text-slate-400 hover:text-blue-500" />
                            </button>
                        </div>

                        <div className="space-y-6 mb-10">
                            {[
                                {
                                    label: 'Articles',
                                    icon: FileText,
                                    views: `${dashboardData.engagement.totals?.total_comments?.toLocaleString() || 0} comments`,
                                    pct: 78,
                                    gradient: 'from-blue-600 to-cyan-600'
                                },
                                {
                                    label: 'Videos',
                                    icon: Video,
                                    views: `${dashboardData.engagement.topVideos?.reduce((sum: number, video: any) => sum + (video.views || 0), 0)?.toLocaleString() || 0} views`,
                                    pct: 85,
                                    gradient: 'from-sky-500 to-blue-500'
                                },
                                {
                                    label: 'Podcasts',
                                    icon: Mic,
                                    views: `${dashboardData.summary.podcasts?.toLocaleString() || 0} episodes`,
                                    pct: 72,
                                    gradient: 'from-rose-500 to-pink-500'
                                },
                                {
                                    label: 'Events',
                                    icon: Calendar,
                                    views: `${dashboardData.summary.events?.toLocaleString() || 0} events`,
                                    pct: 91,
                                    gradient: 'from-teal-400 to-emerald-500'
                                },
                                {
                                    label: 'Directory',
                                    icon: MapPin,
                                    views: `${dashboardData.business.total_businesses?.toLocaleString() || 0} businesses`,
                                    pct: 68,
                                    gradient: 'from-amber-500 to-orange-500'
                                },
                            ].map((item, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center font-semibold text-slate-700 dark:text-slate-200">
                                            <div className={`p-2 rounded-xl bg-gradient-to-br ${item.gradient} mr-3 shadow-md`}>
                                                <item.icon size={16} className="text-white" />
                                            </div>
                                            {item.label}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-slate-500 dark:text-slate-400 text-sm">{item.views}</span>
                                            <span className="font-black text-blue-600 dark:text-blue-400 text-lg">{item.pct}%</span>
                                        </div>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${item.gradient} transform origin-left transition-all duration-1000`}
                                            style={{ width: `${item.pct}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                {
                                    icon: FileText,
                                    label: 'Total Articles',
                                    value: dashboardData.summary.articles?.toLocaleString() || 0,
                                    change: '+24',
                                    gradient: 'from-blue-500 to-cyan-500'
                                },
                                {
                                    icon: MessageSquare,
                                    label: 'Total Comments',
                                    value: dashboardData.engagement.totals?.total_comments?.toLocaleString() || 0,
                                    change: '+142',
                                    gradient: 'from-emerald-500 to-teal-500'
                                },
                                {
                                    icon: Mail,
                                    label: 'Subscribers',
                                    value: dashboardData.summary.subscribers?.toLocaleString() || 0,
                                    change: '+324',
                                    gradient: 'from-slate-600 to-slate-500'
                                },
                            ].map((card, i) => (
                                <div
                                    key={i}
                                    className="group bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/80 dark:to-slate-800/80 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className={`p-2.5 w-fit rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg mb-4`}>
                                        <card.icon size={20} className="text-white" />
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{card.label}</div>
                                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{card.value}</div>
                                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">{card.change}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative bg-slate-900 dark:bg-slate-950 text-white p-8 rounded-3xl border border-slate-800 dark:border-slate-700 overflow-hidden shadow-xl">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mr-4 shadow-lg shadow-blue-500/20">
                                    <MapPin className="text-white" size={24} />
                                </div>
                                <h2 className="text-xl font-black text-white">Business Analytics</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                            {[
                                {
                                    label: 'TOTAL BUSINESSES',
                                    value: dashboardData.business.total_businesses || 0,
                                    change: '-2',
                                    gradient: 'from-blue-500 to-cyan-500'
                                },
                                {
                                    label: 'REVIEWS',
                                    value: dashboardData.business.reviews?.total_reviews || 0,
                                    change: '+7',
                                    gradient: 'from-blue-500 to-cyan-500'
                                },
                                {
                                    label: 'AVG RATING',
                                    value: dashboardData.business.reviews?.avg_rating || '0.0',
                                    change: '+0.2',
                                    gradient: 'from-blue-500 to-cyan-500'
                                },
                            ].map((card, i) => (
                                <div
                                    key={i}
                                    className="relative bg-slate-800 dark:bg-slate-900 p-5 rounded-2xl border border-slate-700 text-white overflow-hidden group hover:shadow-2xl transition-all duration-300"
                                >
                                    <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
                                    <div className="relative z-10">
                                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">{card.label}</div>
                                        <div className="text-3xl font-black text-white mb-2">{card.value}</div>
                                        <div className={`text-sm font-bold ${card.change.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                                            {card.change}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">POPULAR CATEGORIES</h3>
                        <div className="space-y-5">
                            {dashboardData.business.categories?.map((cat: any, i: number) => {
                                const change = cat.percentage_change || 12;
                                const isPositive = change >= 0;

                                return (
                                    <div key={i} className="group">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center">
                                                <div className="p-2 rounded-xl bg-slate-700 mr-3 shadow-md">
                                                    <Briefcase size={14} className="text-white" />
                                                </div>
                                                <div className="text-sm font-bold text-white">{cat.category}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-black text-white text-lg">{cat.count}</span>
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${isPositive
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                    }`}>
                                                    {isPositive ? '+' : ''}{change}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                                                    style={{ width: '100%' }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-white p-10 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl min-h-[550px] flex flex-col">
                <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-center bg-no-repeat pointer-events-none dark:invert"></div>

                <div className="absolute inset-0 pointer-events-none">
                    <span className="absolute top-[30%] left-[20%] w-4 h-4 bg-cyan-500 rounded-full animate-ping shadow-[0_0_20px_rgba(34,211,238,0.6)]"></span>
                    <span className="absolute top-[30%] left-[20%] w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_30px_rgba(34,211,238,0.8)]"></span>

                    <span className="absolute top-[25%] left-[48%] w-3 h-3 bg-blue-500 rounded-full animate-ping delay-300 shadow-[0_0_20px_rgba(59,130,246,0.6)]"></span>
                    <span className="absolute top-[25%] left-[48%] w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.8)]"></span>

                    <span className="absolute top-[45%] left-[53%] w-5 h-5 bg-amber-500 rounded-full animate-ping delay-500 shadow-[0_0_20px_rgba(245,158,11,0.6)]"></span>
                    <span className="absolute top-[45%] left-[53%] w-5 h-5 bg-amber-500 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.8)]"></span>

                    <span className="absolute top-[30%] left-[70%] w-3 h-3 bg-emerald-500 rounded-full animate-ping delay-1000 shadow-[0_0_20px_rgba(16,185,129,0.6)]"></span>
                    <span className="absolute top-[30%] left-[70%] w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.8)]"></span>
                </div>

                <div className="relative z-10 flex justify-between items-center mb-10">
                    <div>
                        <div className="flex items-center mb-3">
                            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl mr-4 shadow-lg shadow-cyan-500/20">
                                <Globe size={28} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Global Community</h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-300 text-sm ml-16">Real-time user activity across the world</p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/10 backdrop-blur-xl px-5 py-3 rounded-full border border-slate-200 dark:border-white/20">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Live</span>
                    </div>
                </div>

                <div className="absolute left-10 top-32 z-20 w-80 bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200 dark:border-white/20 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-left-8 duration-700">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Top Active Regions</h3>
                        <Globe size={16} className="opacity-70 text-slate-600 dark:text-white" />
                    </div>

                    <div className="space-y-5">
                        {LOCATION_DATA.slice(0, 5).map((loc, i) => (
                            <div key={i} className="group">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center font-semibold text-slate-800 dark:text-white">
                                        <span className="mr-3 text-xl">{loc.flag}</span>
                                        <span className="text-sm">{loc.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-black text-lg text-slate-900 dark:text-white">{loc.value.toLocaleString()}</span>
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/30">{loc.growth}</span>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${i === 0 ? 'from-cyan-500 to-blue-500' : i === 1 ? 'from-blue-500 to-cyan-500' : 'from-emerald-500 to-teal-500'} transition-all duration-1000`}
                                        style={{ width: `${(loc.value / Math.max(...LOCATION_DATA.map(l => l.value))) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 text-center">
                        <button className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-white transition-colors font-bold uppercase tracking-wider flex items-center justify-center w-full group">
                            View Full Report
                            <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Reduced User Demographics Section */}
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full blur-3xl" />

                <div className="relative z-10 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl blur-xl opacity-70 animate-pulse" />
                                    <div className="relative p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-xl">
                                        <Users size={24} className="text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                        User Demographics
                                    </h2>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                                        Global distribution and membership insights
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-5 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                                        <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                                    </div>
                                    <div>
                                        <span className="text-xs uppercase font-black text-slate-500 dark:text-slate-400 tracking-widest block">Total Users</span>
                                        <span className="text-xl font-black text-slate-900 dark:text-white">
                                            {dashboardData.membership.total?.toLocaleString() || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 px-5 py-3 rounded-xl shadow-xl hover:shadow-xl transition-all">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="text-white" size={18} />
                                    <div>
                                        <span className="text-xs uppercase font-black text-blue-100 tracking-widest block">Active Regions</span>
                                        <span className="text-xl font-black text-white">
                                            {dashboardData.membership.trends?.active_regions || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-6">
                        <div className="xl:col-span-2 relative group">
                            <div className="absolute -inset-3 bg-gradient-to-r from-blue-400/30 via-cyan-400/30 to-teal-400/30 rounded-[28px] blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-0 group-hover:opacity-100" />

                            <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[24px] p-6 border-2 border-white/50 dark:border-slate-700/50 shadow-xl">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-xl" />
                                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
                                            <Globe className="text-blue-600 dark:text-cyan-400" size={28} />
                                        </div>
                                    </div>
                                </div>

                                <div className="relative h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={dashboardData.membership.distribution || []}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={85}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                                cornerRadius={8}
                                            >
                                                {(dashboardData.membership.distribution || []).map((entry: any, index: number) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={LOCATION_COLORS[index % LOCATION_COLORS.length]}
                                                        className="hover:opacity-80 transition-opacity cursor-pointer drop-shadow-lg"
                                                    />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="bg-slate-900/95 backdrop-blur-2xl border-2 border-slate-700/50 text-white p-4 rounded-xl shadow-xl">
                                                                <div className="font-black text-lg mb-2 text-cyan-400">{data.name}</div>
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center justify-between gap-6">
                                                                        <span className="text-sm text-slate-300">Users:</span>
                                                                        <span className="font-mono font-black text-lg">{data.value?.toLocaleString()}</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between gap-6">
                                                                        <span className="text-sm text-slate-300">Share:</span>
                                                                        <span className="font-mono font-black text-lg text-cyan-400">{data.percentage}%</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-xl" />
                                            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-900">
                                                <div className="text-center">
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Regions</div>
                                                    <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                                        {dashboardData.membership.trends?.active_regions || 0}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-center gap-4 flex-wrap">
                                        {(dashboardData.membership.distribution || []).slice(0, 3).map((item: any, index: number) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full shadow-lg"
                                                    style={{ backgroundColor: LOCATION_COLORS[index % LOCATION_COLORS.length] }}
                                                />
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="xl:col-span-3 flex flex-col justify-center space-y-3">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-base font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                                    Top Active Regions
                                </h3>
                            </div>

                            {(dashboardData.membership.distribution || []).slice(0, 5).map((item: any, index: number) => (
                                <div
                                    key={index}
                                    className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl p-4 border-2 border-white/50 dark:border-slate-800/50 hover:border-blue-300 dark:hover:border-blue-700 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                                        style={{
                                            backgroundImage: `linear-gradient(to right, ${LOCATION_COLORS[index % LOCATION_COLORS.length]}, ${LOCATION_COLORS[(index + 1) % LOCATION_COLORS.length]})`
                                        }}
                                    />

                                    <div className="absolute top-0 right-0 text-[60px] font-black opacity-5 leading-none -mt-4 -mr-2 group-hover:scale-110 transition-transform duration-500">
                                        {index + 1}
                                    </div>

                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="relative w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black text-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                                                style={{
                                                    background: `linear-gradient(135deg, ${LOCATION_COLORS[index % LOCATION_COLORS.length]}, ${LOCATION_COLORS[(index + 1) % LOCATION_COLORS.length]})`
                                                }}
                                            >
                                                <div className="absolute inset-0 rounded-xl blur-lg opacity-50"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${LOCATION_COLORS[index % LOCATION_COLORS.length]}, ${LOCATION_COLORS[(index + 1) % LOCATION_COLORS.length]})`
                                                    }}
                                                />
                                                <span className="relative">{index + 1}</span>
                                            </div>
                                            <div>
                                                <div className="font-black text-lg text-slate-900 dark:text-white mb-1">{item.name}</div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={12} className="text-slate-400" />
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Active Users</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-2xl text-slate-900 dark:text-white mb-1 group-hover:scale-110 transition-transform duration-300">
                                                {item.value?.toLocaleString()}
                                            </div>
                                            <div className="flex items-center gap-2 justify-end">
                                                <div
                                                    className="text-xs font-black px-3 py-1 rounded-lg shadow-md"
                                                    style={{
                                                        background: `${LOCATION_COLORS[index % LOCATION_COLORS.length]}20`,
                                                        color: LOCATION_COLORS[index % LOCATION_COLORS.length],
                                                        border: `2px solid ${LOCATION_COLORS[index % LOCATION_COLORS.length]}40`
                                                    }}
                                                >
                                                    {item.percentage}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r opacity-60 rounded-b-xl transition-all duration-1000 group-hover:opacity-100 group-hover:h-2"
                                        style={{
                                            width: `${item.percentage}%`,
                                            background: `linear-gradient(to right, ${LOCATION_COLORS[index % LOCATION_COLORS.length]}, ${LOCATION_COLORS[(index + 1) % LOCATION_COLORS.length]})`
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Award className="text-blue-600 dark:text-cyan-400" size={20} />
                                Membership Tiers
                            </h3>
                            <button className="text-sm font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 group">
                                View Details
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-white/50 dark:border-slate-800/50 hover:border-blue-300 dark:hover:border-cyan-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />

                                <div className="relative z-10 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                                            <div className="relative p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                                                <Users size={20} className="text-white" />
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-blue-600 dark:text-cyan-400 uppercase tracking-widest bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                                            Basic
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-3">
                                        <div className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Free Users</div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                                {dashboardData.membership.roles?.free?.toLocaleString() || 0}
                                            </span>
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">members</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border-2 border-emerald-500/20">
                                        <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                            {dashboardData.membership.trends?.free_growth || '+5%'} growth
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white border-2 border-blue-500/50 hover:border-cyan-400 shadow-xl hover:shadow-cyan-500/50 transition-all duration-300 hover:-translate-y-1 hover:scale-105">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-cyan-400/30 to-blue-400/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr from-blue-500/30 to-cyan-500/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 group-hover:h-1.5 transition-all duration-500" />

                                <div className="relative z-10 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-xl blur-lg opacity-80 animate-pulse" />
                                            <div className="relative p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-xl border-2 border-cyan-300/50">
                                                <Crown size={20} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-3 py-1 rounded-lg border border-cyan-400/50">
                                            <Sparkles size={14} className="text-cyan-300" />
                                            <span className="text-xs font-black text-cyan-300 uppercase tracking-widest">
                                                Premium
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-3">
                                        <div className="text-xs text-cyan-200 font-bold uppercase tracking-wider">Active Members</div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-white drop-shadow-xl">
                                                {dashboardData.membership.roles?.member?.toLocaleString() || 0}
                                            </span>
                                            <span className="text-xs font-bold text-cyan-200">members</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-xl border-2 border-cyan-400/50 backdrop-blur-sm">
                                        <TrendingUp size={16} className="text-cyan-300" />
                                        <span className="text-xs font-black text-cyan-100">
                                            {dashboardData.membership.trends?.member_growth || '+12%'} revenue
                                        </span>
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/50 to-transparent" />
                            </div>

                            <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-white/50 dark:border-slate-800/50 hover:border-amber-300 dark:hover:border-amber-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-400/20 to-amber-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />

                                <div className="relative z-10 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                                            <div className="relative p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                                                <Award size={20} className="text-white" />
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-lg">
                                            Creator
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-3">
                                        <div className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Verified Authors</div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                                {dashboardData.membership.roles?.author?.toLocaleString() || 0}
                                            </span>
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">creators</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border-2 border-amber-500/20">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]" />
                                        <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                                            {dashboardData.membership.trends?.author_growth || '+3%'} new this month
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;