
import React, { useState } from 'react';
import { Download, Trash2, Eye, ExternalLink, X, Monitor, Clock, Link as LinkIcon, FileImage, Ban, Search } from 'lucide-react';
import { Subscriber, Advertisement, Status } from '../types';

// Mock Data
const MOCK_SUBSCRIBERS: Subscriber[] = [
    { id: '1', email: 'david.b@example.com', subscribedAt: '2023-10-01', status: 'Subscribed' },
    { id: '2', email: 'sarah.j@example.com', subscribedAt: '2023-10-05', status: 'Subscribed' },
    { id: '3', email: 'contact@business.com', subscribedAt: '2023-09-15', status: 'Unsubscribed' },
    { id: '4', email: 'mike.ross@law.com', subscribedAt: '2023-11-12', status: 'Subscribed' },
    { id: '5', email: 'rachel.green@fashion.com', subscribedAt: '2023-11-15', status: 'Subscribed' },
];

const MOCK_ADS: Advertisement[] = [
    { 
        id: '1', 
        title: 'Holiday Savings Special',
        clientName: 'Zemen Bank', 
        imageUrl: 'https://picsum.photos/seed/bank/600/200', 
        link: 'https://zemenbank.com/promo', 
        impressions: 14500, 
        clicks: 320, 
        status: Status.ACTIVE,
        type: 'Image',
        placement: 'Homepage Hero',
        duration: 4,
        durationUnit: 'Weeks'
    },
    { 
        id: '2', 
        title: 'ShebaMiles Rewards',
        clientName: 'Ethiopian Airlines', 
        imageUrl: 'https://picsum.photos/seed/ethiopian/600/200', 
        link: 'https://ethiopianairlines.com', 
        impressions: 50000, 
        clicks: 1200, 
        status: Status.ACTIVE,
        type: 'Video',
        placement: 'Sidebar',
        duration: 1,
        durationUnit: 'Years'
    },
    { 
        id: '3', 
        title: 'Weekend Getaway',
        clientName: 'Kuriftu Resort', 
        imageUrl: 'https://picsum.photos/seed/resort/600/200', 
        link: 'https://kurifturesorts.com', 
        impressions: 8900, 
        clicks: 150, 
        status: Status.PENDING,
        type: 'Image',
        placement: 'Article Footer',
        duration: 14,
        durationUnit: 'Days'
    },
];

const Marketing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'newsletter' | 'ads'>('newsletter');
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleTabChange = (tab: 'newsletter' | 'ads') => {
      setActiveTab(tab);
      setSearchTerm(''); // Reset search when switching tabs
  };

  // Filter Subscribers
  const filteredSubscribers = MOCK_SUBSCRIBERS.filter(sub => 
      sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter Ads
  const filteredAds = MOCK_ADS.filter(ad => 
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ad.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Marketing & Advertising</h1>
            <div className="flex bg-white dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                <button 
                    onClick={() => handleTabChange('newsletter')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'newsletter' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                >
                    Newsletter
                </button>
                <button 
                    onClick={() => handleTabChange('ads')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'ads' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                >
                    Advertisements
                </button>
            </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab === 'newsletter' ? 'subscribers' : 'campaigns'}...`} 
              className="pl-10 pr-4 py-2.5 rounded-xl w-full text-sm bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {activeTab === 'newsletter' ? (
            <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Total Subscribers</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">14,203</p>
                    </div>
                    <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Open Rate</p>
                        <p className="text-2xl font-bold text-emerald-500 mt-1">24.8%</p>
                    </div>
                    <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center">
                         <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:underline">
                            <Download size={20} /> Export List (CSV)
                         </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                <th className="p-4">Email</th>
                                <th className="p-4">Subscribed Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-sm">
                            {filteredSubscribers.length > 0 ? (
                                filteredSubscribers.map(sub => (
                                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-medium text-slate-800 dark:text-white">{sub.email}</td>
                                        <td className="p-4 text-slate-500 dark:text-slate-400">{sub.subscribedAt}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${sub.status === 'Subscribed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-500/10 text-slate-500'}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                                        No subscribers found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <div className="space-y-4 animate-fade-in">
                 <div className="grid grid-cols-1 gap-4">
                    {filteredAds.length > 0 ? (
                        filteredAds.map(ad => (
                            <div 
                                key={ad.id} 
                                onClick={() => setSelectedAd(ad)}
                                className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-6 items-center cursor-pointer hover:border-blue-500/50 transition-all group"
                            >
                                <div className="w-full md:w-48 h-24 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
                                    <img src={ad.imageUrl} alt={ad.clientName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">{ad.title}</h3>
                                    <p className="text-sm text-slate-500">{ad.clientName}</p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-2">
                                        <span className="flex items-center gap-1"><Eye size={14}/> {ad.impressions.toLocaleString()}</span>
                                        <span className="flex items-center gap-1"><ExternalLink size={14}/> {ad.clicks.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        ad.status === Status.ACTIVE ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                                    }`}>
                                        {ad.status}
                                    </span>
                                    <span className="text-xs text-slate-400">Click for details</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                            <p className="text-slate-500 dark:text-slate-400">No advertisements found matching "{searchTerm}"</p>
                        </div>
                    )}
                 </div>
            </div>
        )}

        {/* Ad Details Modal */}
        {selectedAd && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-white/20 dark:bg-slate-900/80 transition-all" onClick={() => setSelectedAd(null)}></div>
                
                <div className="relative w-full max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-0 animate-fade-in ring-1 ring-black/5 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Ad Details</h2>
                        <button onClick={() => setSelectedAd(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                        
                        {/* Title */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ad Title</label>
                            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                <p className="font-bold text-slate-800 dark:text-white">{selectedAd.title}</p>
                                <p className="text-xs text-slate-500">{selectedAd.clientName}</p>
                            </div>
                        </div>

                        {/* Type & Placement */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Type</label>
                                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-200">
                                    <FileImage size={18} className="text-blue-500" />
                                    <span className="font-medium">{selectedAd.type}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Placement</label>
                                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-200">
                                    <Monitor size={18} className="text-purple-500" />
                                    <span className="font-medium">{selectedAd.placement}</span>
                                </div>
                            </div>
                        </div>

                        {/* URL */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ad URL</label>
                            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 text-blue-600 dark:text-blue-400">
                                <LinkIcon size={16} />
                                <a href={selectedAd.link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline truncate">
                                    {selectedAd.link}
                                </a>
                            </div>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Campaign Duration</label>
                            <div className="flex gap-2">
                                <div className="flex-1 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 flex items-center gap-2">
                                    <Clock size={18} className="text-orange-500" />
                                    <span className="font-bold text-slate-800 dark:text-white">{selectedAd.duration}</span>
                                </div>
                                <div className="flex-1 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 flex items-center justify-center">
                                    <span className="font-medium text-slate-600 dark:text-slate-300">{selectedAd.durationUnit}</span>
                                </div>
                            </div>
                        </div>

                         {/* Media File */}
                         <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Media File</label>
                            <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10">
                                <img src={selectedAd.imageUrl} alt="Ad Creative" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex justify-end">
                        <button 
                            className="w-full py-3 rounded-xl bg-white dark:bg-white/5 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 shadow-sm"
                            onClick={() => alert('Campaign Deactivated')}
                        >
                            <Ban size={18} /> Deactivate Campaign
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Marketing;
