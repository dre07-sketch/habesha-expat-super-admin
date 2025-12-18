
import React, { useState } from 'react';
import { X, MapPin, Calendar, Eye, User, ShieldCheck, Video, Star, MessageSquare, Heart, FileText, Mic, ThumbsUp, Send, Play } from 'lucide-react';
import { ContentItem, ContentType, Status } from '../types';

interface ContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: ContentItem | null;
    reviews?: ContentItem[];
}

// Mock Data Generators for UI demonstration
const MOCK_COMMENTS = [
    { id: 1, user: 'Abebe Bikila', avatar: 'AB', text: 'This is exactly what we needed to hear. Great insights!', date: '2 hrs ago' },
    { id: 2, user: 'Sara Tadesse', avatar: 'ST', text: 'Can you elaborate more on the second point?', date: '5 hrs ago' },
    { id: 3, user: 'Yonas M.', avatar: 'YM', text: 'Amazing production quality.', date: '1 day ago' },
    { id: 4, user: 'Hana P.', avatar: 'HP', text: 'Looking forward to the next episode.', date: '2 days ago' },
];

const MOCK_LIKES = [
    { id: 1, user: 'Solomon D.', avatar: 'SD', role: 'Member' },
    { id: 2, user: 'Tigist A.', avatar: 'TA', role: 'Premium' },
    { id: 3, user: 'Mike Ross', avatar: 'MR', role: 'Member' },
    { id: 4, user: 'Rachel Z.', avatar: 'RZ', role: 'Admin' },
    { id: 5, user: 'Harvey S.', avatar: 'HS', role: 'Premium' },
    { id: 6, user: 'Louis L.', avatar: 'LL', role: 'Member' },
];

const ContentModal: React.FC<ContentModalProps> = ({ isOpen, onClose, item, reviews = [] }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'likes'>('details');
    const [commentsList, setCommentsList] = useState<any[]>([]);
    const [likesList, setLikesList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (isOpen && item) {
            fetchDetails();
        }
    }, [isOpen, item]);

    const fetchDetails = async () => {
        if (!item) return;
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/contents/contents/${item.type}/${item.id}`);
            if (response.ok) {
                const data = await response.json();
                setCommentsList(data.commentsList || []);
                setLikesList(data.likesList || []);
            }
        } catch (error) {
            console.error("Failed to fetch details", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !item) return null;

    const thumbnailUrl = item.thumbnailUrl || item.thumbnail_url;
    const mediaUrl = item.mediaUrl || item.media_url;

    const renderTypeIcon = () => {
        switch (item.type) {
            case ContentType.VIDEO: return <Video size={32} className="text-white" />;
            case ContentType.PODCAST: return <Mic size={32} className="text-white" />;
            case ContentType.ARTICLE: return <FileText size={32} className="text-white" />;
            default: return <Eye size={32} className="text-white" />;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Dimmed Backdrop without blur */}
            <div
                className="absolute inset-0 bg-white/20 dark:bg-black/50 transition-all duration-300"
                onClick={onClose}
            ></div>

            {/* Glass Card */}
            <div className="relative w-full max-w-4xl bg-white/80 dark:bg-slate-900/80 border border-white/40 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in backdrop-blur-xl ring-1 ring-black/5">

                {/* Header */}
                <div className="p-6 border-b border-slate-100/50 dark:border-white/5 flex justify-between items-center bg-white/40 dark:bg-white/5">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${item.type === ContentType.VIDEO ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20' :
                                'bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-1 ring-orange-500/20'
                                }`}>
                                {item.type}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${item.status === Status.ACTIVE ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 ring-1 ring-yellow-500/20'
                                }`}>
                                {item.status}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight line-clamp-1">{item.title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-all duration-200 ml-4"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-100/50 dark:border-white/5 px-6 bg-white/20 dark:bg-white/5">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'details' ? 'border-blue-500 text-blue-600 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('comments')}
                        className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'comments' ? 'border-blue-500 text-blue-600 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Comments <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full text-[10px]">{item.comments || commentsList.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('likes')}
                        className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'likes' ? 'border-blue-500 text-blue-600 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Likes <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full text-[10px]">{item.likes || likesList.length}</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30 dark:bg-black/20">

                    {/* TAB: DETAILS */}
                    {activeTab === 'details' && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in">
                            {/* Left Column - Media */}
                            <div className="col-span-1 md:col-span-5 space-y-4">
                                <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 relative group shadow-lg">
                                    {item.type === ContentType.VIDEO ? (
                                        <video
                                            src={mediaUrl}
                                            poster={thumbnailUrl}
                                            controls
                                            className="w-full h-full object-cover"
                                        />
                                    ) : item.type === ContentType.PODCAST ? (
                                        <div className="w-full h-full relative">
                                            <img
                                                src={thumbnailUrl || `https://picsum.photos/seed/${item.id}/400/300`}
                                                alt={item.title}
                                                className="w-full h-full object-cover opacity-80"
                                            />
                                            <div className="absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-md p-2">
                                                <audio controls className="w-full h-8 custom-audio">
                                                    <source src={mediaUrl} type="audio/mpeg" />
                                                    Your browser does not support the audio element.
                                                </audio>
                                            </div>
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/50 shadow-xl">
                                                    <Mic size={32} className="text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <img
                                                src={thumbnailUrl || `https://picsum.photos/seed/${item.id}/400/300`}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors pointer-events-none">
                                                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/50 shadow-xl">
                                                    {renderTypeIcon()}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div onClick={() => setActiveTab('likes')} className="cursor-pointer p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-1 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                                        <Heart size={18} className="text-pink-500" fill="currentColor" />
                                        <span className="text-lg font-bold text-slate-800 dark:text-white">{item.likes?.toLocaleString() || likesList.length.toLocaleString()}</span>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Likes</span>
                                    </div>
                                    <div onClick={() => setActiveTab('comments')} className="cursor-pointer p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-1 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                                        <MessageSquare size={18} className="text-blue-500" fill="currentColor" />
                                        <span className="text-lg font-bold text-slate-800 dark:text-white">{item.comments?.toLocaleString() || commentsList.length.toLocaleString()}</span>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Comments</span>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-white/50 dark:bg-white/5">
                                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium"><Eye size={16} /> Views</span>
                                        <span className="font-mono font-semibold text-slate-800 dark:text-white">{item.views.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-white/50 dark:bg-white/5">
                                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium"><Calendar size={16} /> Date</span>
                                        <span className="text-slate-800 dark:text-white font-medium">
                                            {item.date ? new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-white/50 dark:bg-white/5">
                                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium"><User size={16} /> Author</span>
                                        <span className="text-slate-800 dark:text-white font-medium truncate max-w-[120px]">{item.author}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Info */}
                            <div className="col-span-1 md:col-span-7 space-y-6 flex flex-col h-full">

                                <div className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex-1">
                                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-wider">Content Description</h3>
                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                                        {item.description}
                                    </p>
                                </div>



                                <div className="flex gap-3 pt-2 mt-auto">
                                    <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-[1.02] active:scale-[0.98]">
                                        Edit Content
                                    </button>
                                    <button className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30 py-3 rounded-xl font-bold text-sm transition-all">
                                        Suspend
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: COMMENTS */}
                    {activeTab === 'comments' && (
                        <div className="space-y-4 animate-fade-in">
                            {commentsList.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No comments yet.</p>
                            ) : (
                                commentsList.map((comment, index) => (
                                    <div key={comment.id || index} className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md overflow-hidden">
                                            {comment.avatar ? <img src={comment.avatar} alt={comment.user} className="w-full h-full object-cover" /> : (comment.user ? comment.user.substring(0, 2).toUpperCase() : 'US')}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">{comment.user}</h4>
                                                <span className="text-xs text-slate-500">{comment.date}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{comment.text}</p>
                                            <div className="flex items-center gap-4 mt-3">
                                                <button className="text-xs text-slate-500 hover:text-blue-500 flex items-center gap-1 transition-colors">
                                                    <ThumbsUp size={12} /> Like
                                                </button>
                                                <button className="text-xs text-slate-500 hover:text-blue-500 flex items-center gap-1 transition-colors">
                                                    <Send size={12} /> Reply
                                                </button>
                                                <button className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors ml-auto">
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* TAB: LIKES */}
                    {activeTab === 'likes' && (
                        <div className="animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {likesList.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4 col-span-2">No likes yet.</p>
                                ) : (
                                    likesList.map((like, index) => (
                                        <div key={like.id || index} className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md overflow-hidden">
                                                {like.avatar ? <img src={like.avatar} alt={like.user} className="w-full h-full object-cover" /> : (like.user ? like.user.substring(0, 2).toUpperCase() : 'US')}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">{like.user}</h4>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${like.role === 'Premium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                                    like.role === 'Admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                                                        'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                                                    }`}>{like.role || 'Member'}</span>
                                            </div>
                                            <div className="ml-auto">
                                                <Heart size={16} className="text-pink-500 fill-current" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ContentModal;
