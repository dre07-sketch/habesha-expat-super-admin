import React, { useState } from 'react';
import { X, MapPin, Star, User, ShieldCheck, Mail, Phone, Globe, Navigation, Tag } from 'lucide-react';
import { ContentItem, ContentType, Status } from '../types';

interface BusinessModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: ContentItem | null;
    reviews?: ContentItem[];
}

const BusinessModal: React.FC<BusinessModalProps> = ({ isOpen, onClose, item, reviews = [] }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

    if (!isOpen || !item || item.type !== ContentType.BUSINESS) return null;

    const thumbnailUrl = item.thumbnailUrl || item.thumbnail_url || `https://picsum.photos/seed/${item.id}/400/300`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-white/20 dark:bg-black/50 transition-all duration-300 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${item.type === ContentType.BUSINESS ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-slate-100'
                            }`}>
                            {item.title.substring(0, 1)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">{item.title}</h2>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                <MapPin size={14} /> {item.location || item.address || 'Location N/A'}
                            </p>
                            {item.category && (
                                <div className="mt-1 flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md w-fit">
                                    <Tag size={12} /> {item.category}
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-all duration-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 dark:border-white/5 px-6">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'details' ? 'border-blue-500 text-blue-600 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Business Details
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'reviews' ? 'border-blue-500 text-blue-600 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Reviews <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full text-[10px]">{reviews.length}</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30 dark:bg-black/20">
                    {activeTab === 'details' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/10">
                                    <img src={thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                        <p className="text-xs text-slate-400 font-bold uppercase">Status</p>
                                        <p className={`text-sm font-bold ${item.status === 'visible' || item.status === 'active' ? 'text-emerald-500' : 'text-slate-500'}`}>{item.status}</p>
                                    </div>
                                    <div className="flex-1 p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                        <p className="text-xs text-slate-400 font-bold uppercase">Rating</p>
                                        <p className="text-sm font-bold text-yellow-500 flex items-center gap-1">
                                            <Star size={14} fill="currentColor" />
                                            {reviews.length > 0
                                                ? (reviews.reduce((acc, review) => acc + (Number(review.rating) || 0), 0) / reviews.length).toFixed(1)
                                                : (item.rating || 'N/A')}
                                            {reviews.length > 0 && <span className="text-slate-400 text-xs font-normal">({reviews.length})</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">About</h3>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                                        {item.description || 'No description available for this business.'}
                                    </p>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20">
                                    <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                                        <ShieldCheck size={18} /> Verification
                                    </h4>
                                    <p className="text-xs text-blue-800 dark:text-blue-300">
                                        This business is verified.
                                    </p>
                                </div>

                                {/* Contact & Location Info */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Contact Information</h4>

                                    <div className="flex flex-col gap-3">
                                        {item.author && (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-slate-500">
                                                    <Mail size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Email</p>
                                                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{item.author}</p>
                                                </div>
                                            </div>
                                        )}

                                        {item.phone && (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-slate-500">
                                                    <Phone size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Phone</p>
                                                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{item.phone}</p>
                                                </div>
                                            </div>
                                        )}

                                        {item.website_url && (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-slate-500">
                                                    <Globe size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Website</p>
                                                    <a href={item.website_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline truncate block">
                                                        {item.website_url}
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {(item.address || item.map_pin) && (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-slate-500">
                                                    <Navigation size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Address</p>
                                                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate mb-1">{item.address || 'Address available on map'}</p>
                                                    {item.map_pin && (
                                                        <a href={item.map_pin} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1">
                                                            View on Map <MapPin size={10} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="space-y-4">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div key={review.id} className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold">
                                                {review.author ? review.author.charAt(0).toUpperCase() : <User size={20} />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white text-sm">{review.author || 'Anonymous User'}</p>
                                                        <p className="text-xs text-slate-400">{new Date(review.date).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={14}
                                                                className={i < (review.rating || 0) ? "text-yellow-400 fill-current" : "text-slate-300 dark:text-slate-700"}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-slate-400">
                                    <p>No reviews found for this business.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusinessModal;
