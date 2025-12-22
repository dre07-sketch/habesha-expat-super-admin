import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Calendar, Clock, Users, DollarSign, Trash2, User, Ticket, Eye, EyeOff, CheckCircle, Circle, Search, Loader2, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';

import { Event } from '../types';

// 1. Define your API Base URL
const API_BASE_URL = 'http://localhost:5000/api/events';

const Events: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'guests'>('details');
    const [searchTerm, setSearchTerm] = useState('');

    // Helper function to format date and time
    const formatDateTime = (dateString: string, timeString?: string) => {
        if (!dateString) return 'Date TBD';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';

        // Format date part
        const dateOptions: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const formattedDate = date.toLocaleDateString(undefined, dateOptions);

        // Format time part if available
        if (timeString) {
            const [hours, minutes] = timeString.split(':');
            if (hours && minutes) {
                const timeDate = new Date(date);
                timeDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));

                const timeOptions: Intl.DateTimeFormatOptions = {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                };
                const formattedTime = timeDate.toLocaleTimeString(undefined, timeOptions);
                return `${formattedDate} at ${formattedTime}`;
            }
        }

        return formattedDate;
    };

    // Helper function to format time only
    const formatTime = (timeString?: string) => {
        if (!timeString) return 'TBA';

        const [hours, minutes] = timeString.split(':');
        if (!hours || !minutes) return timeString;

        const date = new Date();
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10));

        return date.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // 2. Helper function to construct the full image URL
    const getImageUrl = (imagePath: string | undefined | null) => {
        if (!imagePath) {
            // Return a default placeholder if no image exists
            return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000';
        }
        // If it's already a full URL (e.g., from Unsplash), return it as is
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        // Otherwise, prepend the API_BASE_URL to the relative path
        // Example: converts "/uploads/123.jpg" to "http://localhost:5000/uploads/123.jpg"
        return `${API_BASE_URL}${imagePath}`;
    };

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/events-get`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch events');

            const data = await response.json();

            const mappedEvents = data.map((evt: any) => ({
                ...evt,
                attendeeList: evt.attendeeList || []
            }));

            setEvents(mappedEvents);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this event?')) return;

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/events-delete/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete event');
            setEvents(events.filter(ev => ev.id !== id));
            if (selectedEvent?.id === id) setSelectedEvent(null);
        } catch (err: any) {
            alert(`Error deleting event: ${err.message}`);
        }
    };

    const handleToggleStatus = async () => {
        if (!selectedEvent) return;
        const newStatus = selectedEvent.status === 'visible' ? 'hidden' : 'visible';

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/events/${selectedEvent.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error('Failed to update status');

            const updatedEvent = { ...selectedEvent, status: newStatus } as Event;
            setSelectedEvent(updatedEvent);
            setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
        } catch (err: any) {
            alert(`Error updating status: ${err.message}`);
        }
    };

    const filteredEvents = events.filter(evt =>
        evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evt.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Community Events</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage meetups, conferences, and gatherings.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 dark:text-white placeholder-slate-400 transition-all shadow-sm"
                        />
                    </div>

                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            )}

            {error && !isLoading && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center mb-6">
                    <AlertCircle size={20} className="mr-2" />
                    <span>{error}</span>
                    <button onClick={fetchEvents} className="ml-auto text-sm font-bold underline hover:no-underline">Retry</button>
                </div>
            )}

            {!isLoading && !error && (
                <div className="space-y-4">
                    {filteredEvents.map((evt) => (
                        <div
                            key={evt.id}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 flex flex-col md:flex-row gap-6 hover:border-blue-500/50 transition-all cursor-pointer group relative overflow-hidden"
                            onClick={() => { setSelectedEvent(evt); setActiveTab('details'); }}
                        >
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${evt.status === 'visible' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>

                            <div className="shrink-0 w-20 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-center">
                                <span className="text-xs font-bold text-red-500 uppercase">{new Date(evt.date).toLocaleString('default', { month: 'short' })}</span>
                                <span className="text-2xl font-bold text-slate-800 dark:text-white">{new Date(evt.date).getDate()}</span>
                                <span className="text-[10px] text-slate-400 font-bold">{new Date(evt.date).getFullYear()}</span>
                            </div>

                            <div className="shrink-0 w-full md:w-48 h-32 rounded-xl overflow-hidden">
                                {/* 3. Use getImageUrl in List View */}
                                <img
                                    src={getImageUrl(evt.image)}
                                    alt={evt.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        // Fallback if image fails to load
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000';
                                    }}
                                />
                            </div>

                            <div className="flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{evt.title}</h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${evt.status === 'visible' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'}`}>
                                        {evt.status}
                                    </span>
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                        <Clock size={14} className="mr-2 text-blue-500" /> {formatTime(evt.time)}
                                    </div>
                                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                        <MapPin size={14} className="mr-2 text-red-500" /> {evt.location}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-700 pt-4 md:pt-0 md:pl-6 w-full md:w-40">
                                <div className="text-right hidden md:block">
                                    <div className="text-xs text-slate-400 uppercase font-bold">Tickets</div>
                                    <div className="text-lg font-bold text-slate-800 dark:text-white">{evt.attendees || 0}</div>
                                </div>
                                <div className="flex justify-end mt-auto">
                                    <button
                                        onClick={(e) => handleDelete(evt.id, e)}
                                        className="p-2.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                                        title="Delete Event"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredEvents.length === 0 && (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            No events found.
                        </div>
                    )}
                </div>
            )}



            <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Event Manager" maxWidth="max-w-5xl">
                {selectedEvent && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden flex flex-col">
                        <div className="relative h-64 w-full shrink-0">
                            {/* 4. Use getImageUrl in Modal View */}
                            <img
                                src={getImageUrl(selectedEvent.image)}
                                alt={selectedEvent.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-90"></div>
                            <div className="absolute bottom-0 left-0 w-full p-8 flex justify-between items-end">
                                <div>
                                    <span className="inline-block bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mb-3 shadow-lg">{selectedEvent.price || 'Free Entry'}</span>
                                    <h2 className="text-4xl font-bold text-white mb-2 leading-tight shadow-black drop-shadow-lg">{selectedEvent.title}</h2>
                                    <div className="flex items-center text-slate-200 text-sm font-medium">
                                        <User size={14} className="mr-1.5" /> Organized by {selectedEvent.organizer || 'Habesha Expat'}
                                    </div>
                                </div>
                                <div className="text-white text-right hidden sm:block">
                                    <div className="text-3xl font-bold">{selectedEvent.attendees || 0}</div>
                                    <div className="text-xs uppercase tracking-wider font-medium opacity-80">Attending</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row min-h-[400px]">
                            <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 p-4">
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setActiveTab('details')}
                                        className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'details' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                    >
                                        <Calendar size={18} className="mr-3" /> Overview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('guests')}
                                        className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'guests' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                    >
                                        <Ticket size={18} className="mr-3" /> Guest List
                                        <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-full">
                                            {selectedEvent.attendeeList?.length || 0}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 p-8 bg-white dark:bg-slate-900">
                                {activeTab === 'details' && (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Date & Time</h4>
                                                <div className="flex items-center text-slate-800 dark:text-white font-medium">
                                                    <Calendar size={18} className="mr-2 text-blue-500" />
                                                    {formatDateTime(selectedEvent.date, selectedEvent.time)}
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Location</h4>
                                                <div className="flex items-center text-slate-800 dark:text-white font-medium">
                                                    <MapPin size={18} className="mr-2 text-red-500" />
                                                    {selectedEvent.location}
                                                </div>
                                                <a href="#" className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1 ml-6 hover:underline">View Map</a>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">About Event</h3>
                                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                                {selectedEvent.description}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'guests' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Registered Attendees</h3>
                                            <button className="text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">Export CSV</button>
                                        </div>
                                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                                <thead className="bg-slate-50 dark:bg-slate-800">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ticket</th>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                                                    {selectedEvent.attendeeList && selectedEvent.attendeeList.length > 0 ? (
                                                        selectedEvent.attendeeList.map((attendee) => (
                                                            <tr key={attendee.id}>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <img className="h-8 w-8 rounded-full" src={attendee.avatar} alt="" />
                                                                        <div className="ml-4">
                                                                            <div className="text-sm font-medium text-slate-900 dark:text-white">{attendee.name}</div>
                                                                            <div className="text-xs text-slate-500 dark:text-slate-400">{attendee.email}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${attendee.ticketType === 'VIP' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'}`}>
                                                                        {attendee.ticketType}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                                    {attendee.purchaseDate}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                                        <CheckCircle size={12} className="mr-1" /> {attendee.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                                                                No tickets sold yet.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800 p-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <div className="flex items-center">
                                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium mr-3">Visibility:</span>
                                <span className={`flex items-center text-sm font-bold px-3 py-1 rounded-full ${selectedEvent.status === 'visible' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                                    {selectedEvent.status === 'visible' ? <Eye size={14} className="mr-1.5" /> : <EyeOff size={14} className="mr-1.5" />}
                                    {selectedEvent.status || 'visible'}
                                </span>
                            </div>
                            <button
                                onClick={handleToggleStatus}
                                className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center ${selectedEvent.status === 'visible' ? 'bg-slate-200 hover:bg-red-100 text-slate-700 hover:text-red-600 dark:bg-slate-700 dark:hover:bg-red-900/20 dark:text-slate-300 dark:hover:text-red-400' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'}`}
                            >
                                {selectedEvent.status === 'visible' ? (
                                    <> <EyeOff size={16} className="mr-2" /> Hide Event </>
                                ) : (
                                    <> <Eye size={16} className="mr-2" /> Make Visible </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Events;