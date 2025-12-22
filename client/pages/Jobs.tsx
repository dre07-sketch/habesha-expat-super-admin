import React, { useState, useEffect } from 'react';
import {
    Briefcase, MapPin, DollarSign, Clock, Users, Search,
    Trash2, MoreHorizontal, FileText, Building, Globe,
    Eye, EyeOff, X, Calendar, ExternalLink, Award, Target, CheckCircle, Star,
    TrendingUp, ShieldCheck, Zap
} from 'lucide-react';
import { Job, Status } from '../types';

const Jobs: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // API: Fetch
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                const response = await fetch(`http://localhost:5000/api/jobs/jobs-get?page=${page}&limit=10`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();

                const formattedJobs = data.map((job: any) => ({
                    ...job,
                    postedDate: formatDate(job.postedDate),
                    status: job.status === 'visible' ? Status.ACTIVE : Status.SUSPENDED,
                    logoUrl: job.company?.substring(0, 2).toUpperCase() || 'JB',
                    applicantsCount: job.applicantsCount || 0,
                }));

                setJobs(prev => page === 1 ? formattedJobs : [...prev, ...formattedJobs]);
                setHasMore(data.length === 10);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [page]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const diffInDays = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        return `${diffInDays} days ago`;
    };

    // API: Toggle Status (PUT /api/jobs/:id/status)
    const toggleJobStatus = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:5000/api/jobs/${id}/status`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed');
            const data = await response.json();
            setJobs(prev => prev.map(j => j.id === id ? { ...j, status: data.status === 'visible' ? Status.ACTIVE : Status.SUSPENDED } : j));
        } catch (err) { alert('Update failed'); }
    };

    // API: Delete (DELETE /api/jobs/job-delete/:id)
    const handleDeleteJob = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Delete this posting?')) {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`http://localhost:5000/api/jobs/job-delete/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) setJobs(prev => prev.filter(j => j.id !== id));
            } catch (err) { alert('Delete failed'); }
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 p-6 bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Recruitment Hub</h1>
                    <p className="text-slate-500 font-medium">Manage visibility and track candidates in real-time.</p>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-blue-500/10 group-hover:scale-110 transition-transform"><Briefcase size={80} /></div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Postings</p>
                    <h3 className="text-4xl font-black mt-2 dark:text-white">{jobs.filter(j => j.status === Status.ACTIVE).length}</h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-purple-500/10 group-hover:scale-110 transition-transform"><Users size={80} /></div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Reach</p>
                    <h3 className="text-4xl font-black mt-2 dark:text-white">{jobs.length}</h3>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredJobs.map((job) => (
                    <div
                        key={job.id}
                        className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-blue-500 transition-all group cursor-pointer"
                        onClick={() => setSelectedJob(job)}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-bold text-blue-600">{job.logoUrl}</div>
                                <div>
                                    <h3 className="font-bold text-lg dark:text-white">{job.title}</h3>
                                    <span className="text-sm text-slate-500">{job.company}</span>
                                </div>
                            </div>
                            <button onClick={(e) => handleDeleteJob(job.id, e)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={20} /></button>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${job.status === Status.ACTIVE ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{job.status}</span>
                            <span className="text-xs text-slate-400 font-medium">Posted {job.postedDate}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* THE AMAZING POPUP */}
            {selectedJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl animate-fade-in" onClick={() => setSelectedJob(null)}></div>

                    {/* Modal Content */}
                    <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">

                        {/* Header Section with Mesh Gradient */}
                        <div className="relative p-8 lg:p-12 border-b border-slate-100 dark:border-white/5">
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-transparent pointer-events-none"></div>

                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                                    <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-blue-500/40">
                                        {selectedJob.logoUrl}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h2 className="text-4xl font-black tracking-tight dark:text-white">{selectedJob.title}</h2>
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${selectedJob.status === Status.ACTIVE ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                                                }`}>
                                                {selectedJob.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-6 text-slate-500 dark:text-slate-400 font-bold">
                                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400"><Building size={20} /> {selectedJob.company}</div>
                                            <div className="flex items-center gap-2"><MapPin size={20} /> {selectedJob.location}</div>
                                            <div className="flex items-center gap-2"><Clock size={20} /> {selectedJob.type}</div>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedJob(null)} className="p-4 bg-slate-100 dark:bg-white/5 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"><X size={24} /></button>
                            </div>

                            {/* Floating Info Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Expected Salary</p>
                                    <p className="font-bold text-lg dark:text-white">{selectedJob.salary}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Total Applicants</p>
                                    <p className="font-bold text-lg dark:text-white">{selectedJob.applicantsCount} Candidates</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Industry</p>
                                    <p className="font-bold text-lg dark:text-white">{selectedJob.industry || 'Tech'}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Visibility Status</p>
                                    <p className="font-bold text-lg dark:text-white">{selectedJob.status === Status.ACTIVE ? 'Live on Site' : 'Archived'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content Scroll Area */}
                        <div className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-hide space-y-16">

                            {/* Description */}
                            <div className="max-w-4xl">
                                <h4 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-blue-600 mb-6">
                                    <Zap size={18} fill="currentColor" /> About the role
                                </h4>
                                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    {selectedJob.description || "We are looking for a visionary to join our growing team. You will be responsible for building next-generation products and contributing to our high-performance culture."}
                                </p>
                            </div>

                            {/* Split Sections */}
                            <div className="grid md:grid-cols-2 gap-16">
                                <section>
                                    <h4 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-emerald-600 mb-6">
                                        <Target size={18} /> Responsibilities
                                    </h4>
                                    <ul className="space-y-4">
                                        {(Array.isArray(selectedJob.responsibilities) ? selectedJob.responsibilities : []).map((item, i) => (
                                            <li key={i} className="flex gap-4 items-start text-slate-600 dark:text-slate-400 group">
                                                <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                                                <span className="font-medium">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section>
                                    <h4 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-purple-600 mb-6">
                                        <ShieldCheck size={18} /> Requirements
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(Array.isArray(selectedJob.requirements) ? selectedJob.requirements : []).map((item, i) => (
                                            <span key={i} className="px-5 py-2.5 bg-slate-100 dark:bg-white/5 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* Bottom Action Bar */}
                        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-8 text-slate-500 font-bold text-sm">
                                <div className="flex items-center gap-2"><TrendingUp size={20} className="text-blue-500" /> High Interest</div>
                                <div className="flex items-center gap-2"><Calendar size={20} /> Posted {selectedJob.postedDate}</div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={(e) => { toggleJobStatus(selectedJob.id, e); setSelectedJob(null); }}
                                    className={`flex-1 md:flex-none px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${selectedJob.status === Status.ACTIVE
                                            ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                        }`}
                                >
                                    {selectedJob.status === Status.ACTIVE ? 'Take Down' : 'Publish Live'}
                                </button>
                                <a
                                    href={selectedJob.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all"
                                >
                                    Source Listing <ExternalLink size={18} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Jobs;