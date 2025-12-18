import React, { useState, useEffect } from 'react';
import {
    Briefcase, MapPin, DollarSign, Clock, Users, Search,
    Trash2, MoreHorizontal, FileText, Building, Globe, Download,
    Eye, EyeOff, X, Calendar, ExternalLink, Award, Target, CheckCircle, Star
} from 'lucide-react';
import { Job, JobApplication, Status } from '../types';

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

    // Fetch jobs from API with pagination
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/jobs/jobs-get?page=${page}&limit=10`);
                if (!response.ok) {
                    throw new Error('Failed to fetch jobs');
                }
                const data = await response.json();

                // Transform API data to match Job interface
                const formattedJobs = data.map((job: any) => ({
                    id: job.id,
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    type: job.type,
                    salary: job.salary,
                    industry: job.industry,
                    responsibilities: job.responsibilities,
                    requirements: job.requirements,
                    benefits: job.benefits,
                    url: job.url,
                    postedDate: formatDate(job.postedDate),
                    applicantsCount: job.applicantsCount || 0,
                    status: job.status === 'active' ? Status.ACTIVE : Status.SUSPENDED,
                    logoUrl: job.company.substring(0, 2).toUpperCase(),
                    description: job.description
                }));

                setJobs(prev => page === 1 ? formattedJobs : [...prev, ...formattedJobs]);
                setHasMore(data.length === 10);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [page]);

    // Format date to relative time
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        return `${Math.floor(diffInDays / 30)} months ago`;
    };

    // Toggle Job Status Function with API call
    const toggleJobStatus = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            const response = await fetch(`http://localhost:5000/api/jobs/${id}/toggle-status`, {
                method: 'PATCH'
            });

            if (!response.ok) throw new Error('Failed to update job status');

            setJobs(prevJobs => prevJobs.map(job => {
                if (job.id === id) {
                    return {
                        ...job,
                        status: job.status === Status.ACTIVE ? Status.SUSPENDED : Status.ACTIVE
                    };
                }
                return job;
            }));
        } catch (err) {
            console.error('Error updating job status:', err);
            alert('Failed to update job status. Please try again.');
        }
    };

    // Delete Job Function with API call
    const handleDeleteJob = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
            try {
                const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('Failed to delete job');

                setJobs(prevJobs => prevJobs.filter(job => job.id !== id));
            } catch (err) {
                console.error('Error deleting job:', err);
                alert('Failed to delete job. Please try again.');
            }
        }
    };

    // Load more jobs
    const loadMoreJobs = () => {
        if (hasMore && !loading) {
            setPage(prev => prev + 1);
        }
    };

    // Filtering Logic
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
        const matchesType = typeFilter === 'all' || job.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Jobs & Careers</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage job listings and track candidate applications.</p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/60 dark:border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Jobs</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                                {jobs.filter(j => j.status === Status.ACTIVE).length}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/60 dark:border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Jobs</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                                {jobs.length}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 mt-8">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-3">
                    <select
                        className="px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value={Status.ACTIVE}>Active</option>
                        <option value={Status.SUSPENDED}>Suspended</option>
                    </select>

                    <select
                        className="px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-6 text-center">
                    <p className="text-red-600 dark:text-red-400 font-medium">Error loading jobs: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* CONTENT: JOBS LISTING */}
            {!loading && !error && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map((job) => (
                                <div key={job.id} className="glass-panel p-6 rounded-2xl border border-white/60 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all group relative flex flex-col">
                                    {/* Job card content */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-300 shadow-inner">
                                                {job.logoUrl}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{job.title}</h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                    <Building size={14} />
                                                    <span>{job.company}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => handleDeleteJob(job.id, e)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Delete Job"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                                <MoreHorizontal size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 flex-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <Globe size={16} className="text-blue-500" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <DollarSign size={16} className="text-emerald-500" />
                                            {job.salary}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <Clock size={16} className="text-orange-500" />
                                            {job.type}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <Users size={16} className="text-purple-500" />
                                            {job.applicantsCount} Applicants
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5 mt-auto">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${job.status === Status.ACTIVE
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                                                : 'bg-yellow-50 border-yellow-200 text-yellow-600 dark:bg-yellow-500/10 dark:border-yellow-500/20 dark:text-yellow-400'
                                                }`}>
                                                {job.status}
                                            </span>

                                            <button
                                                onClick={(e) => toggleJobStatus(job.id, e)}
                                                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${job.status === Status.ACTIVE
                                                    ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10'
                                                    : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10'
                                                    }`}
                                            >
                                                {job.status === Status.ACTIVE ? (
                                                    <><EyeOff size={14} /> Take Down</>
                                                ) : (
                                                    <><Eye size={14} /> Make Visible</>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => setSelectedJob(job)}
                                                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </div>

                                        <div className="text-xs text-slate-400 font-medium">
                                            Posted {job.postedDate}
                                        </div>
                                    </div>

                                    {/* Decorative Background Blur */}
                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center py-12">
                                <p className="text-slate-500 dark:text-slate-400">No jobs found matching your search criteria.</p>
                            </div>
                        )}
                    </div>

                    {/* Load More Button */}
                    {hasMore && filteredJobs.length > 0 && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={loadMoreJobs}
                                disabled={loading}
                                className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Loading...' : 'Load More Jobs'}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ENHANCED JOB DETAIL POPUP MODAL */}
            {selectedJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl transition-all" onClick={() => setSelectedJob(null)}></div>

                    <div className="relative w-full max-w-5xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200/50 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up ring-1 ring-black/5">

                        {/* Enhanced Modal Header */}
                        <div className="relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20"></div>
                            <div className="absolute inset-0 opacity-30">
                                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                                <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-400 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"></div>
                            </div>

                            <div className="relative p-8 border-b border-slate-200/50 dark:border-white/10">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-300 shadow-lg">
                                                {selectedJob.logoUrl}
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-1.5 rounded-lg shadow-lg">
                                                <Star size={16} fill="white" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">
                                                    {selectedJob.title}
                                                </h2>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedJob.status === Status.ACTIVE
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                                                    }`}>
                                                    {selectedJob.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                                                <div className="flex items-center gap-2">
                                                    <Building size={16} className="text-blue-500" />
                                                    <span className="font-medium">{selectedJob.company}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={16} className="text-purple-500" />
                                                    <span>{selectedJob.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedJob(null)}
                                        className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all shadow-lg"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                                        <Clock size={18} className="text-blue-500" />
                                        <span className="font-medium text-blue-700 dark:text-blue-300">{selectedJob.type}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                                        <DollarSign size={18} className="text-emerald-500" />
                                        <span className="font-medium text-emerald-700 dark:text-emerald-300">{selectedJob.salary}</span>
                                    </div>
                                    {selectedJob.industry && (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl border border-purple-100 dark:border-purple-500/20">
                                            <Award size={18} className="text-purple-500" />
                                            <span className="font-medium text-purple-700 dark:text-purple-300">{selectedJob.industry}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
                                        <Calendar size={18} className="text-amber-500" />
                                        <span className="font-medium text-amber-700 dark:text-amber-300">Posted {selectedJob.postedDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-8 space-y-10">
                                {/* Job Description Section */}
                                <div className="relative">
                                    <div className="absolute -top-6 left-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                                        <FileText size={24} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 ml-16">Job Description</h3>
                                    <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-sm">
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {selectedJob.description || 'No description available for this position.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Responsibilities Section */}
                                {selectedJob.responsibilities && (
                                    <div className="relative">
                                        <div className="absolute -top-6 left-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <Target size={24} className="text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 ml-16">Key Responsibilities</h3>
                                        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-sm">
                                            <div className="space-y-3">
                                                {(Array.isArray(selectedJob.responsibilities)
                                                    ? selectedJob.responsibilities
                                                    : selectedJob.responsibilities.split ? selectedJob.responsibilities.split('\n') : []).map((item, index) => (
                                                        <div key={index} className="flex items-start gap-3">
                                                            <CheckCircle size={20} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                                            <p className="text-slate-600 dark:text-slate-300">{item}</p>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Requirements Section */}
                                {selectedJob.requirements && (
                                    <div className="relative">
                                        <div className="absolute -top-6 left-0 w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <Award size={24} className="text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 ml-16">Requirements & Qualifications</h3>
                                        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-sm">
                                            <div className="space-y-3">
                                                {(Array.isArray(selectedJob.requirements)
                                                    ? selectedJob.requirements
                                                    : selectedJob.requirements.split ? selectedJob.requirements.split('\n') : []).map((item, index) => (
                                                        <div key={index} className="flex items-start gap-3">
                                                            <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                                                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                                            </div>
                                                            <p className="text-slate-600 dark:text-slate-300">{item}</p>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Benefits Section */}
                                {selectedJob.benefits && (
                                    <div className="relative">
                                        <div className="absolute -top-6 left-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <Star size={24} className="text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 ml-16">Perks & Benefits</h3>
                                        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-sm">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {(Array.isArray(selectedJob.benefits)
                                                    ? selectedJob.benefits
                                                    : selectedJob.benefits.split ? selectedJob.benefits.split('\n') : []).map((item, index) => (
                                                        <div key={index} className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                                                            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                                                                <CheckCircle size={16} className="text-purple-500" />
                                                            </div>
                                                            <span className="text-slate-700 dark:text-slate-300 font-medium">{item}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* URL Section */}
                                {selectedJob.url && (
                                    <div className="relative">
                                        <div className="absolute -top-6 left-0 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <ExternalLink size={24} className="text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 ml-16">Original Job Posting</h3>
                                        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-sm">
                                            <a
                                                href={selectedJob.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors group"
                                            >
                                                <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                                                <span className="break-all">{selectedJob.url}</span>
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Enhanced Footer */}
                        <div className="p-6 border-t border-slate-200/50 dark:border-white/10 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                        <Users size={18} />
                                        <span>{selectedJob.applicantsCount} Applicants</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                        <Calendar size={18} />
                                        <span>Posted {selectedJob.postedDate}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedJob(null)}
                                        className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium shadow-sm"
                                    >
                                        Close
                                    </button>

                                    <a
                                        href={selectedJob.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                                    >
                                        <ExternalLink size={18} />
                                        View Original Posting
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Jobs;