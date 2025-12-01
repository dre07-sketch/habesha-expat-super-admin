
import React, { useState } from 'react';
import { Calendar, MapPin, ChevronRight, X, Users, Image as ImageIcon, Search, Download, Plus, Ticket, TrendingUp, Clock, MoreVertical } from 'lucide-react';
import { Event, Status, EventParticipant } from '../types';

const MOCK_EVENTS: Event[] = [
    { 
        id: '1', 
        title: 'Habesha Tech Summit 2025', 
        date: '2025-03-15', 
        location: 'Skylight Hotel, Addis Ababa', 
        status: Status.ACTIVE, 
        registeredCount: 342,
        expectedAttendees: 500,
        description: 'The biggest gathering of tech enthusiasts, developers, and startups in the Horn of Africa. Join us for a day of networking, keynote speeches, and workshops.',
        imageUrl: 'https://picsum.photos/seed/techsummit/600/300'
    },
    { 
        id: '2', 
        title: 'Diaspora Coffee Morning', 
        date: '2025-02-10', 
        location: 'Virtual (Zoom)', 
        status: Status.ACTIVE, 
        registeredCount: 85,
        expectedAttendees: 100,
        description: 'A casual virtual meetup for the diaspora community to connect, share stories, and enjoy Ethiopian coffee culture from home.',
        imageUrl: 'https://picsum.photos/seed/coffee/600/300'
    },
    { 
        id: '3', 
        title: 'Cultural Art Showcase', 
        date: '2025-04-20', 
        location: 'National Theatre', 
        status: Status.PENDING, 
        registeredCount: 45,
        expectedAttendees: 250,
        description: 'Celebrating contemporary art from Ethiopia and Eritrea. Featuring works from 20 upcoming artists.',
        imageUrl: 'https://picsum.photos/seed/art/600/300'
    },
    { 
        id: '4', 
        title: 'Music Festival: Enkutatash', 
        date: '2025-09-11', 
        location: 'Ghion Hotel Gardens', 
        status: Status.ACTIVE, 
        registeredCount: 1200,
        expectedAttendees: 5000,
        description: 'Celebrate the New Year with live performances from top artists, traditional food, and cultural dance.',
        imageUrl: 'https://picsum.photos/seed/musicfest/600/300'
    },
];

const MOCK_PARTICIPANTS: EventParticipant[] = [
    { id: '1', name: 'Solomon D.', email: 'solomon@test.com', ticketType: 'VIP', status: 'Confirmed' },
    { id: '2', name: 'Hana A.', email: 'hana@test.com', ticketType: 'General', status: 'Confirmed' },
    { id: '3', name: 'Mike T.', email: 'mike@test.com', ticketType: 'General', status: 'Pending' },
    { id: '4', name: 'Sara B.', email: 'sara@test.com', ticketType: 'VIP', status: 'Confirmed' },
    { id: '5', name: 'Robel K.', email: 'robel@test.com', ticketType: 'General', status: 'Confirmed' },
    { id: '6', name: 'Yodit L.', email: 'yodit@test.com', ticketType: 'General', status: 'Confirmed' },
    { id: '7', name: 'Dawit M.', email: 'dawit@test.com', ticketType: 'VIP', status: 'Pending' },
];

const EventsManager: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCloseDetails = () => {
    setSelectedEvent(null);
    setShowParticipants(false);
  };

  const getMonthAndDay = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
        month: date.toLocaleString('default', { month: 'short' }),
        day: date.getDate()
    };
  };

  const filteredEvents = MOCK_EVENTS.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Events</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Manage conferences, meetups, and cultural gatherings.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64 group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search events..." 
                        className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
                    <Plus size={18} /> Create Event
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            
            {/* LEFT COLUMN: EVENTS LIST */}
            <div className="xl:col-span-3 space-y-4">
                {filteredEvents.map(event => {
                    const { month, day } = getMonthAndDay(event.date);
                    const progress = Math.min(((event.registeredCount || 0) / (event.expectedAttendees || 1)) * 100, 100);
                    
                    return (
                        <div 
                            key={event.id} 
                            onClick={() => setSelectedEvent(event)}
                            className="group relative bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-blue-500/30 dark:hover:border-blue-500/30 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col md:flex-row gap-6 items-center"
                        >
                            {/* Date Badge */}
                            <div className="hidden md:flex flex-col items-center justify-center w-16 h-16 shrink-0 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 text-center group-hover:bg-white dark:group-hover:bg-blue-600 group-hover:text-blue-600 dark:group-hover:text-white transition-colors shadow-inner">
                                <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">{month}</span>
                                <span className="text-xl font-black leading-none">{day}</span>
                            </div>

                            {/* Image Thumbnail */}
                            <div className="w-full md:w-32 h-32 md:h-20 rounded-2xl overflow-hidden shrink-0 relative shadow-sm">
                                 <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                                 <img 
                                    src={event.imageUrl} 
                                    alt={event.title} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                />
                                {/* Mobile Date Overlay */}
                                <div className="md:hidden absolute top-2 right-2 bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-bold px-2 py-1 rounded-lg z-20">
                                    {month} {day}
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`w-2 h-2 rounded-full ${event.status === Status.ACTIVE ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${event.status === Status.ACTIVE ? 'text-emerald-600 dark:text-emerald-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                        {event.status}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {event.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    <MapPin size={14} />
                                    <span className="truncate">{event.location}</span>
                                </div>
                            </div>

                            {/* Progress & Stats */}
                            <div className="w-full md:w-48 shrink-0 pl-0 md:pl-6 md:border-l border-slate-100 dark:border-white/5">
                                 <div className="flex justify-between items-end mb-2">
                                     <div>
                                         <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Capacity</p>
                                         <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                             <span className="text-blue-600 dark:text-blue-400">{event.registeredCount}</span> 
                                             <span className="text-slate-400 mx-1">/</span> 
                                             {event.expectedAttendees}
                                         </p>
                                     </div>
                                     <span className="text-xs font-bold text-slate-500">{Math.round(progress)}%</span>
                                 </div>
                                 <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                     <div 
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                 </div>
                            </div>

                            {/* Arrow Action */}
                            <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    );
                })}

                {/* Add New Event Row */}
                <button className="w-full group relative bg-slate-50 dark:bg-white/5 p-4 rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Plus size={18} />
                     </div>
                     <span className="font-bold text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Schedule New Event</span>
                </button>
            </div>

            {/* RIGHT COLUMN: STATS SIDEBAR */}
            <div className="space-y-6">
                
                {/* Primary Stats Card */}
                <div className="rounded-[2rem] p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/20 transition-colors"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6 opacity-90">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Ticket size={20} />
                            </div>
                            <span className="text-sm font-medium tracking-wide">Total Sales</span>
                        </div>
                        
                        <div className="flex items-baseline gap-2 mb-2">
                            <h3 className="text-5xl font-bold tracking-tight">1,672</h3>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold border border-white/10">
                            <TrendingUp size={12} /> +12% this month
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-blue-200 text-xs mb-1">Revenue</p>
                                <p className="text-xl font-bold">$42.5k</p>
                            </div>
                            <div>
                                <p className="text-blue-200 text-xs mb-1">Check-ins</p>
                                <p className="text-xl font-bold">89%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Quick Stats */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 dark:text-white">Quick Stats</h3>
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                            <MoreVertical size={16} className="text-slate-400" />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Next Event</p>
                                <p className="font-bold text-slate-800 dark:text-white">3 Days Left</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Speakers</p>
                                <p className="font-bold text-slate-800 dark:text-white">24 Speakers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Event Details Read-Only Modal */}
        {selectedEvent && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-white/20 dark:bg-slate-900/80 transition-all backdrop-blur-sm" onClick={handleCloseDetails}></div>
                
                {/* Main Detail Modal */}
                <div className={`relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-white/50 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in ring-1 ring-black/5 transition-transform duration-300 ${showParticipants ? 'scale-95 opacity-50 pointer-events-none' : 'scale-100 opacity-100'}`}>
                     
                     {/* Immersive Header Image */}
                     <div className="relative h-64 w-full">
                         <img src={selectedEvent.imageUrl} className="w-full h-full object-cover" alt="Cover" />
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                         
                         <button onClick={handleCloseDetails} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-white hover:text-red-500 transition-all border border-white/10">
                            <X size={20} />
                         </button>

                         <div className="absolute bottom-6 left-8 right-8">
                             <div className="flex items-center gap-3 mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${
                                    selectedEvent.status === Status.ACTIVE 
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                }`}>
                                    {selectedEvent.status}
                                </span>
                                <span className="text-slate-300 text-sm flex items-center gap-1.5 font-medium bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                    <Calendar size={14} /> {selectedEvent.date}
                                </span>
                             </div>
                             <h2 className="text-4xl font-bold text-white leading-tight shadow-sm">{selectedEvent.title}</h2>
                         </div>
                     </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Left Content (2/3) */}
                            <div className="lg:col-span-2 space-y-8">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">About Event</h3>
                                    <p className="text-slate-600 dark:text-slate-300 leading-loose text-lg">
                                        {selectedEvent.description || "No description provided."}
                                    </p>
                                </div>

                                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-4">
                                     <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
                                         <MapPin size={24} />
                                     </div>
                                     <div>
                                         <h4 className="font-bold text-slate-800 dark:text-white mb-1">Location</h4>
                                         <p className="text-slate-600 dark:text-slate-300">{selectedEvent.location}</p>
                                         <button className="text-blue-500 text-sm font-bold mt-2 hover:underline">View on Maps</button>
                                     </div>
                                </div>
                            </div>

                            {/* Right Stats (1/3) */}
                            <div className="space-y-6">
                                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-center">
                                    <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-2">Registration Status</h3>
                                    
                                    <div className="relative w-40 h-40 mx-auto mb-4 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="8" />
                                            <circle 
                                                cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-blue-500" strokeWidth="8" 
                                                strokeDasharray="283"
                                                strokeDashoffset={283 - (283 * ((selectedEvent.registeredCount || 0) / (selectedEvent.expectedAttendees || 1)))} 
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-bold text-slate-800 dark:text-white">{selectedEvent.registeredCount}</span>
                                            <span className="text-xs text-slate-500">of {selectedEvent.expectedAttendees}</span>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setShowParticipants(true)}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                    >
                                        Manage Participants
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Participants Overlay Modal */}
                {showParticipants && (
                    <div className="absolute inset-0 z-[110] flex items-center justify-center p-4 animate-fade-in">
                         <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[650px] ring-1 ring-black/5">
                             {/* Participant Header */}
                            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Participants</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage attendees for {selectedEvent.title}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors" title="Export CSV">
                                        <Download size={18} />
                                    </button>
                                    <button 
                                        onClick={() => setShowParticipants(false)} 
                                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Toolbar */}
                            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex gap-3 bg-white dark:bg-slate-900">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Search name or email..." 
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-100 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-black/20 focus:border-blue-500 outline-none transition-all text-slate-800 dark:text-white"
                                    />
                                </div>
                                <select className="px-4 py-2 rounded-xl text-sm bg-slate-100 dark:bg-white/5 border-transparent focus:border-blue-500 outline-none text-slate-800 dark:text-white cursor-pointer font-medium">
                                    <option>All Tickets</option>
                                    <option>VIP</option>
                                    <option>General</option>
                                </select>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-white dark:bg-slate-900">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-white/5 text-xs uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider sticky top-0 z-10 backdrop-blur-sm">
                                        <tr>
                                            <th className="px-6 py-4">Attendee</th>
                                            <th className="px-6 py-4">Ticket Type</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {MOCK_PARTICIPANTS.map((p) => (
                                            <tr key={p.id} className="hover:bg-blue-50/50 dark:hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                                            {p.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 dark:text-white">{p.name}</p>
                                                            <p className="text-xs text-slate-500">{p.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${p.ticketType === 'VIP' ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20' : 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-white/5 dark:text-slate-400 dark:border-white/10'}`}>
                                                        {p.ticketType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                     <span className={`flex items-center gap-1.5 text-xs font-bold ${p.status === 'Confirmed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'Confirmed' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="text-slate-400 hover:text-blue-500 transition-colors p-1">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                         </div>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default EventsManager;
