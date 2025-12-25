import React, { useState, useEffect } from 'react';
import {
    ShieldCheck, Search, RefreshCw, Database,
    ExternalLink, Clock, ChevronRight, Terminal,
    Cpu, Globe, UserCheck
} from 'lucide-react';

const AuditLogDashboard = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:5000/api/audit/audit-logs-get', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const json = await response.json();
            if (json.success) {
                setLogs(json.data);
            } else {
                throw new Error(json.message || 'Failed to fetch logs');
            }
        } catch (err) {
            console.error("Error loading logs", err);
            setError(err.message || "Failed to load logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, []);

    const getActionStyle = (action) => {
        const a = action.toLowerCase();
        if (a.includes('delete')) return 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20';
        if (a.includes('create')) return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20';
        if (a.includes('update')) return 'bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20';
        return 'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20';
    };

    const filteredLogs = logs.filter(log =>
        log.admin_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen text-slate-900 dark:text-slate-200 font-sans p-4 md:p-8">
            {/* Background Glow Orbs (Visual Polish) */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-600/10 blur-[120px] rounded-full -z-10" />

            {/* Header */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg border border-indigo-200 dark:border-indigo-500/30">
                            <ShieldCheck className="text-indigo-600 dark:text-indigo-400" size={24} />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">System Audit Logs</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm ml-12">Security monitoring and administrative forensic trace</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Filter logs..."
                            className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 w-72 transition-all backdrop-blur-md text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="p-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all backdrop-blur-md shadow-sm dark:shadow-xl"
                    >
                        <RefreshCw size={20} className={`text-slate-500 dark:text-slate-400 ${loading ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400">
                    <p className="font-medium">Error: {error}</p>
                </div>
            )}

            {/* Main Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Table Panel */}
                <div className="lg:col-span-8">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <RefreshCw className="animate-spin text-indigo-600 dark:text-indigo-400" size={40} />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <Database className="text-slate-400 dark:text-slate-600 mb-4" size={48} />
                            <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-lg">No Audit Logs Found</h3>
                            <p className="text-slate-500 text-sm mt-2">There are no audit logs to display at this time.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto text-sm">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-transparent">
                                        <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Administrator</th>
                                        <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Action</th>
                                        <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Target Metadata</th>
                                        <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                                    {filteredLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            onClick={() => setSelectedLog(log)}
                                            className={`hover:bg-indigo-50 dark:hover:bg-indigo-500/5 cursor-pointer transition-all group ${selectedLog?.id === log.id ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                                                        {log.admin_name?.charAt(0) || 'A'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-white transition-colors">{log.admin_name || 'Unknown'}</p>
                                                        <p className="text-[11px] text-slate-500 font-mono tracking-tighter uppercase">{log.admin_role || 'admin'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wide ${getActionStyle(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                                                        <Database size={13} className="text-slate-400 dark:text-slate-500" /> {log.target_type}
                                                    </span>
                                                    <span className="text-[11px] text-slate-500 font-mono mt-0.5">#{log.target_id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                                                    <Clock size={14} className="opacity-50" />
                                                    <span className="text-xs whitespace-nowrap">{new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                    <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-indigo-500 dark:text-indigo-400" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Sidebar Panel */}
                <div className="lg:col-span-4 space-y-6">
                    {selectedLog ? (
                        <div className="bg-white dark:bg-slate-900/60 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-xl dark:shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Terminal size={20} className="text-indigo-600 dark:text-indigo-400" /> Event Details
                                </h2>
                                <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white transition-colors text-xl">✕</button>
                            </div>

                            <div className="space-y-5">
                                {/* Meta Info */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Origin IP</p>
                                        <p className="text-sm font-mono text-indigo-600 dark:text-indigo-300 flex items-center gap-2"><Globe size={14} /> {selectedLog.ip_address}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Event ID</p>
                                        <p className="text-sm font-mono text-indigo-600 dark:text-indigo-300 flex items-center gap-2"><Cpu size={14} /> {selectedLog.id}</p>
                                    </div>
                                </div>

                                {/* Admin Info */}
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Administrator</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">{selectedLog.admin_name}</p>
                                    <p className="text-xs text-slate-500 font-mono mt-1">{selectedLog.admin_email}</p>
                                </div>

                                {/* User Agent */}
                              

                                {/* JSON Data */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Payload Data</p>
                                        <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/30">JSON</span>
                                    </div>
                                    <pre className="bg-slate-950 text-indigo-200/80 p-4 rounded-xl text-xs overflow-x-auto font-mono border border-slate-800 shadow-inner">
                                        {JSON.stringify(selectedLog.details, null, 2)}
                                    </pre>
                                </div>

                                
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-sm">
                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 ring-8 ring-slate-100 dark:ring-slate-900/50">
                                <ExternalLink className="text-slate-400 dark:text-slate-600" size={28} />
                            </div>
                            <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-lg">No Log Selected</h3>
                            <p className="text-slate-500 text-sm mt-2 max-w-[200px]">Select a record from the activity feed to inspect detailed metadata.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditLogDashboard;