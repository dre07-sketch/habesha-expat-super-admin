import React, { useState, useEffect } from 'react';
import {
    Download, Trash2, Eye, ExternalLink, X, Monitor,
    Clock, Link as LinkIcon, FileImage, Ban, Search,
    Mail, ChevronRight, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/ad-news'; // Adjust to your server port

const Marketing: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'subscribers' | 'ads' | 'history'>('subscribers');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Data States
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [ads, setAds] = useState<any[]>([]);
    const [newsletters, setNewsletters] = useState<any[]>([]);

    // UI States
    const [selectedAd, setSelectedAd] = useState<any | null>(null);
    const [selectedNewsletter, setSelectedNewsletter] = useState<any | null>(null);

    // 1. Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

            const [subsRes, adsRes, newsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/subscribers-get`, { headers }),
                fetch(`${API_BASE_URL}/ads-get`, { headers }),
                fetch(`${API_BASE_URL}/newsletters-get`, { headers })
            ]);

            const subsData = await subsRes.json();
            const adsData = await adsRes.json();
            const newsData = await newsRes.json();

            setSubscribers(Array.isArray(subsData) ? subsData : []);
            setAds(Array.isArray(adsData) ? adsData : []);
            setNewsletters(Array.isArray(newsData) ? newsData : []);
        } catch (error) {
            console.error("Failed to fetch marketing data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 2. Action Handlers
    const handleToggleAdStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_BASE_URL}/ads/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setAds(ads.map(ad => ad.id === id ? { ...ad, status: newStatus } : ad));
                setSelectedAd(null);
            }
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleDeleteAd = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this campaign?")) return;
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`${API_BASE_URL}/ads/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAds(ads.filter(ad => ad.id !== id));
            setSelectedAd(null);
        } catch (err) {
            alert("Failed to delete ad");
        }
    };

    // 3. Filtering
    const filteredSubscribers = subscribers.filter(s => s.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredAds = ads.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredHistory = newsletters.filter(n => n.subject.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center text-slate-500">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p>Loading marketing data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Marketing & Advertising</h1>
                <div className="flex bg-white dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                    {(['subscribers', 'ads', 'history'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                        >
                            {tab === 'history' ? 'Sent History' : tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    className="pl-10 pr-4 py-2.5 rounded-xl w-full text-sm bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* SUBSCRIBERS TAB */}
            {activeTab === 'subscribers' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10">
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Total Audience</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{subscribers.length.toLocaleString()}</p>
                        </div>

                    </div>

                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    <th className="p-4">Subscriber</th>
                                    <th className="p-4">Plan</th>
                                    <th className="p-4">Joined Date</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-sm">
                                {filteredSubscribers.map(sub => (
                                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-slate-800 dark:text-white">{sub.name || 'Anonymous'}</div>
                                            <div className="text-xs text-slate-500">{sub.email}</div>
                                        </td>
                                        <td className="p-4 text-slate-500 dark:text-slate-400 capitalize">{sub.plan}</td>
                                        <td className="p-4 text-slate-500 dark:text-slate-400">{new Date(sub.joinedDate).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-500'}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ADS TAB */}
            {activeTab === 'ads' && (
                <div className="space-y-4 animate-fade-in">
                    {filteredAds.map(ad => (
                        <div key={ad.id} onClick={() => setSelectedAd(ad)} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-6 items-center cursor-pointer hover:border-blue-500/50 transition-all group">
                            <div className="w-full md:w-48 h-24 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
                                <img src={ad.mediaFile} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800 dark:text-white text-lg">{ad.title}</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-widest">{ad.type} • {ad.placement}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ad.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                                    {ad.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* SENT HISTORY TAB */}
            {activeTab === 'history' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    {filteredHistory.map(news => (
                        <div
                            key={news.id}
                            onClick={() => setSelectedNewsletter(news)}
                            className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:border-blue-500 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                                    <Mail size={20} />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(news.sentDate).toDateString()}</p>
                                    <p className="text-xs text-emerald-500 font-bold">{news.openRate}% Open Rate</p>
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-500 transition-colors line-clamp-1">{news.subject}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">{news.content}</p>
                            <div className="flex items-center text-blue-600 text-xs font-bold uppercase tracking-wider">
                                Preview Newsletter <ChevronRight size={14} className="ml-1" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- MODALS --- */}

            {/* NEWSLETTER PREVIEW (Your Cool Layout) */}
            {selectedNewsletter && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedNewsletter(null)}></div>
                    <div className="relative w-full max-w-6xl bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-5 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex flex-col justify-center shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">SENT TO {selectedNewsletter.recipientCount} SUBSCRIBERS</span>
                                    </div>
                                    <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight line-clamp-1">{selectedNewsletter.subject}</h2>
                                </div>
                                <button onClick={() => setSelectedNewsletter(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                                    <X className="text-slate-500" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 w-full bg-slate-200 dark:bg-slate-950/50 overflow-hidden flex flex-col">
                            <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-center shrink-0">
                                <div className="w-full max-w-4xl flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 px-6 py-1 rounded-md text-xs text-slate-400 font-mono flex items-center shadow-sm border border-slate-200 dark:border-slate-700">
                                        <span className="text-emerald-500 mr-2">🔒</span> habeshaexpat.com/newsletter/{selectedNewsletter.id}
                                    </div>
                                    <div className="w-8"></div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 lg:p-10 flex justify-center">
                                <div className="bg-white dark:bg-slate-800 w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-700 h-fit">
                                    {selectedNewsletter.image && (
                                        <div className="w-full h-72 sm:h-96 overflow-hidden relative group">
                                            <img src={selectedNewsletter.image} alt="Header" className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    <div className="px-8 py-10 sm:px-16 sm:py-14 text-center">
                                        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-6 leading-tight">{selectedNewsletter.subject}</h1>
                                        <div className="text-left text-slate-700 dark:text-slate-300">
                                            {selectedNewsletter.content?.split('\n').map((para: string, i: number) => (
                                                <p key={i} className="mb-6 font-serif text-lg leading-relaxed">{para}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AD DETAIL MODAL */}
            {selectedAd && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80" onClick={() => setSelectedAd(null)}></div>
                    <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-0 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Ad Campaign</h2>
                            <button onClick={() => setSelectedAd(null)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <img src={selectedAd.mediaFile} className="w-full h-44 object-cover rounded-xl shadow-md" alt="" />
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Title</label>
                                <p className="font-bold text-slate-800 dark:text-white text-lg">{selectedAd.title}</p>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-500/5 rounded-xl text-blue-600">
                                <LinkIcon size={16} />
                                <a href={selectedAd.url} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline truncate">{selectedAd.url}</a>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Duration</label>
                                    <span className="font-bold dark:text-white">{selectedAd.durationDays} Days</span>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Status</label>
                                    <span className={`font-bold capitalize ${selectedAd.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`}>{selectedAd.status}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex gap-3">
                            <button
                                onClick={() => handleToggleAdStatus(selectedAd.id, selectedAd.status)}
                                className={`flex-1 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ${selectedAd.status === 'active'
                                    ? 'bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200'
                                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40'
                                    }`}
                            >
                                {selectedAd.status === 'active' ? <><Ban size={18} /> Deactivate Campaign</> : <><CheckCircle2 size={18} /> Activate Campaign</>}
                            </button>
                            <button
                                onClick={() => handleDeleteAd(selectedAd.id)}
                                className="p-3 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500/20 transition-all"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marketing;