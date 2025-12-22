import React, { useState, useEffect } from 'react';
import {
  Plus, Calendar, User, Tag, Clock, Eye, ChevronRight,
  Share2, Bookmark, EyeOff, Heart, MessageCircle,
  BarChart2, Search, Trash2, AlertTriangle, CheckCircle
} from 'lucide-react';
import Modal from '../components/Modal';

import { Article } from '../types';

const API_BASE_URL = 'http://localhost:5000';

const Articles: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'engagement'>('content');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // State for engagement data
  const [comments, setComments] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [engagementLoading, setEngagementLoading] = useState(false);

  // Helper function to resolve full URLs
  const getFullUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}/${url.replace(/^\/+/, '')}`;
  };

  // Helper functions for video handling
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // --- Helper: Fetch Articles List Logic ---
  const loadArticles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/articles/articles-get`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const jsonResponse = await response.json();
      const articlesData = jsonResponse.data || [];

      const mappedArticles: Article[] = articlesData.map((item: any) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        content: item.content,
        category: item.category,
        author: item.author_name || 'Unknown',
        status: item.status,
        views: item.views || 0,
        publishDate: item.publish_date,
        created_at: item.created_at,
        tags: Array.isArray(item.tags) ? item.tags : (item.tags ? item.tags.split(',').map(tag => tag.trim()) : []),
        url: item.url || null,
        video_url: item.video_url || null,
        image: item.image,
        likes: 0,
        comments: 0,
        likedBy: [],
        commentList: []
      }));

      setArticles(mappedArticles);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching articles');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch comments for a specific article ---
  const fetchComments = async (articleId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/articles/articles/${articleId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
        setSelectedArticle(prev => prev ? { ...prev, comments: data.comments.length } : null);
      }
    } catch (err: any) {
      console.error('Error fetching comments:', err);
    }
  };

  // --- Fetch likes for a specific article ---
  const fetchLikes = async (articleId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/articles/articles/${articleId}/likes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch likes');
      }
      const data = await response.json();
      if (data.success) {
        setLikes(data.likes);
        setSelectedArticle(prev => prev ? { ...prev, likes: data.likes.length } : null);
      }
    } catch (err: any) {
      console.error('Error fetching likes:', err);
    }
  };

  // --- Delete article ---
  const handleDeleteArticle = async (articleId: string) => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/articles/articles-delete/${articleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete article');
      }

      const data = await response.json();
      if (data.success) {
        // Remove article from state
        setArticles(prevArticles => prevArticles.filter(article => article.id !== articleId));
        // Close modal if the deleted article is currently selected
        if (selectedArticle && selectedArticle.id === articleId) {
          setSelectedArticle(null);
        }
        setDeleteSuccess(true);
        // Auto close success modal after 2 seconds
        setTimeout(() => {
          setShowDeleteConfirm(false);
          setDeleteSuccess(false);
        }, 2000);
      }
    } catch (err: any) {
      setDeleteError(err.message || 'An error occurred while deleting the article');
      console.error('Error deleting article:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- 1. Initial Fetch ---
  useEffect(() => {
    loadArticles();
  }, []);

  // --- 2. Handle Form Submit (Refresh list) ---
  const handleFormSubmit = () => {
    setIsFormOpen(false);
    loadArticles();
  };

  // --- 3. Handle Status Update (Publish/Unpublish) ---
  const handleStatusUpdate = async (articleId: string, newStatus: 'published' | 'draft') => {
    if (!selectedArticle) return;

    setIsUpdatingStatus(true);
    setStatusUpdateError(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/articles/toggle-status/${articleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${newStatus === 'published' ? 'publish' : 'unpublish'} article`);
      }

      const data = await response.json();
      const updatedArticle = data.article;

      setArticles(prevArticles =>
        prevArticles.map(article =>
          article.id === articleId ? { ...article, ...updatedArticle } : article
        )
      );
      setSelectedArticle(prev => prev ? { ...prev, ...updatedArticle } : null);

    } catch (err: any) {
      setStatusUpdateError(err.message || `An error occurred while ${newStatus === 'published' ? 'publishing' : 'unpublishing'} the article`);
      console.error('Error updating article status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleOpenArticle = (article: Article) => {
    setSelectedArticle(article);
    setActiveTab('content');
    setStatusUpdateError(null);
    setDeleteError(null);
    setShowDeleteConfirm(false);
    setComments([]);
    setLikes([]);
    setEngagementLoading(true);
    Promise.all([
      fetchComments(article.id.toString()),
      fetchLikes(article.id.toString()),
    ]).finally(() => {
      setEngagementLoading(false);
    });
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (article.author && article.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (article.category && article.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No Date';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const ArticleImage = ({ src, alt, className }: { src: string | null; alt: string; className?: string }) => {
    const placeholder = 'https://via.placeholder.com/400x300.png?text=No+Image';
    const [imgSrc, setImgSrc] = useState(src || placeholder);

    useEffect(() => {
      setImgSrc(src || placeholder);
    }, [src]);

    const handleError = () => {
      if (imgSrc !== placeholder) {
        setImgSrc(placeholder);
      }
    };

    return (
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        onError={handleError}
      />
    );
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Articles & Blog</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage editorial content, news, and stories.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 dark:text-white placeholder-slate-400 transition-all shadow-sm"
            />
          </div>

        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <h3 className="text-lg font-bold text-red-700 dark:text-red-300 mb-2">Error Loading Articles</h3>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button onClick={loadArticles} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Try Again</button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {filteredArticles.map((article) => (
            <div key={article.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-6 hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all cursor-pointer group" onClick={() => handleOpenArticle(article)}>
              <div className="relative w-full md:w-64 h-40 shrink-0 rounded-xl overflow-hidden">
                <ArticleImage src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 left-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 dark:text-white shadow-sm flex items-center">
                  <Tag size={10} className="mr-1 text-blue-500" /> {article.category}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pr-4">{article.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${article.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'}`}>
                      {article.status}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm line-clamp-2 leading-relaxed">{article.excerpt}</p>
                </div>
                <div className="flex items-center justify-between mt-4 border-t border-slate-100 dark:border-slate-700 pt-3">
                  <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center"><Calendar size={12} className="mr-1.5 text-slate-400" /> {formatDate(article.publishDate)}</span>
                    <span className="flex items-center"><User size={12} className="mr-1.5 text-slate-400" /> {article.author}</span>
                    <span className="flex items-center"><Heart size={12} className="mr-1.5 text-slate-400" /> {article.likes || 0}</span>
                    <span className="flex items-center"><MessageCircle size={12} className="mr-1.5 text-slate-400" /> {article.comments || 0}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedArticle(article);
                        setShowDeleteConfirm(true);
                      }}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="flex items-center text-blue-600 dark:text-blue-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                      Read Article <ChevronRight size={14} className="ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredArticles.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">No articles found.</div>
          )}
        </div>
      )}



      <Modal isOpen={showDeleteConfirm} onClose={() => {
        setShowDeleteConfirm(false);
        setDeleteSuccess(false);
      }} title={deleteSuccess ? "Article Deleted" : "Confirm Delete"} maxWidth="max-w-md">
        <div className="p-6">
          {deleteSuccess ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Article Deleted Successfully</h3>
              <p className="text-slate-600 dark:text-slate-300">The article has been permanently removed from the system.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full mr-4">
                  <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Delete Article</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Are you sure you want to delete this article? This action cannot be undone.
              </p>
              {deleteError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  {deleteError}
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedArticle && handleDeleteArticle(selectedArticle.id.toString())}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-2" />
                      Delete Article
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal isOpen={!!selectedArticle && !showDeleteConfirm} onClose={() => setSelectedArticle(null)} title="Article Preview" maxWidth="max-w-5xl">
        {selectedArticle && (
          <div className="bg-white dark:bg-slate-900 flex flex-col relative rounded-b-xl overflow-hidden">
            <div className="min-h-[60vh]">
              <div className="relative h-80 w-full rounded-t-xl md:rounded-xl overflow-hidden mb-0 group">
                <ArticleImage src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-95"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-10">
                  <div className="max-w-4xl">
                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-blue-900/20 uppercase tracking-wide">{selectedArticle.category}</span>
                      <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wide ${selectedArticle.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>{selectedArticle.status}</span>
                      {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedArticle.tags.map((tag, index) => (
                            <span key={index} className="inline-block bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wide">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight shadow-black drop-shadow-lg">{selectedArticle.title}</h1>
                    <div className="flex items-center space-x-6 text-slate-200 text-sm font-medium">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mr-3 backdrop-blur-sm border border-white/20"><User size={14} className="text-white" /></div>
                        <span>{selectedArticle.author}</span>
                      </div>
                      <div className="flex items-center"><Calendar size={16} className="mr-2 opacity-70" /> {formatDate(selectedArticle.publishDate)}</div>
                      <div className="flex items-center"><Clock size={16} className="mr-2 opacity-70" /> 5 min read</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="flex w-full">
                  <button onClick={() => setActiveTab('content')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'content' ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}>Article Content</button>
                  <button onClick={() => setActiveTab('engagement')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'engagement' ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}>Engagement & Feedback</button>
                </div>
              </div>

              <div className="px-4 md:px-12 max-w-5xl mx-auto py-10">
                {activeTab === 'content' && (
                  <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <div className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-loose">
                      <p className="lead text-xl text-slate-500 dark:text-slate-400 font-serif italic border-l-4 border-blue-500 pl-4 mb-8">{selectedArticle.excerpt}</p>

                      {/* Video Player */}
                      {selectedArticle.video_url && (
                        <div className="my-8 rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
                          {isYouTubeUrl(selectedArticle.video_url) ? (
                            // YouTube video
                            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                              <iframe
                                className="absolute top-0 left-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedArticle.video_url)}`}
                                title={selectedArticle.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                          ) : (
                            // Local video or other direct video link
                            <video
                              controls
                              className="w-full max-h-[500px]"
                              poster={selectedArticle.image || undefined}
                              preload="metadata"
                            >
                              <source src={getFullUrl(selectedArticle.video_url)} />
                              Your browser does not support the video tag.
                            </video>
                          )}
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
                            Video: {selectedArticle.title}
                          </div>
                        </div>
                      )}

                      <div className="whitespace-pre-line font-serif text-lg">{selectedArticle.content}</div>
                    </div>
                  </div>
                )}

                {activeTab === 'engagement' && (
                  <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                    {engagementLoading && (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    )}

                    {!engagementLoading && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-2xl border border-blue-100 dark:border-slate-700 flex items-center justify-between">
                            <div>
                              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Views</p>
                              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{selectedArticle.views?.toLocaleString() || '0'}</h3>
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-700 rounded-xl text-blue-600 dark:text-blue-400 shadow-sm"><BarChart2 size={24} /></div>
                          </div>
                          <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-2xl border border-rose-100 dark:border-slate-700 flex items-center justify-between">
                            <div>
                              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Likes</p>
                              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{likes.length.toLocaleString()}</h3>
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-700 rounded-xl text-rose-500 shadow-sm"><Heart size={24} fill="currentColor" /></div>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-2xl border border-emerald-100 dark:border-slate-700 flex items-center justify-between">
                            <div>
                              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Comments</p>
                              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{comments.length.toLocaleString()}</h3>
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-700 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-sm"><MessageCircle size={24} /></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                          <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center"><MessageCircle className="mr-2 text-blue-500" size={20} /> Discussion ({comments.length})</h3>
                            <div className="space-y-6">
                              {comments.length > 0 ? (
                                comments.map(comment => (
                                  <div key={comment.id} className="flex gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0"><User size={16} className="text-slate-500 dark:text-slate-400" /></div>
                                    <div className="flex-1">
                                      <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm group-hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="font-bold text-sm text-slate-900 dark:text-white">{comment.user_name}</span>
                                          <span className="text-xs text-slate-400">{formatDate(comment.created_at)}</span>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{comment.content}</p>
                                      </div>
                                      <div className="flex items-center gap-4 mt-1 pl-2">
                                        <button className="text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors">Like</button>
                                        <button className="text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors">Reply</button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                  <MessageCircle size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                  <p className="text-slate-500 dark:text-slate-400">No comments yet.</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="lg:col-span-1 space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center"><Heart className="mr-2 text-rose-500" size={20} /> Recent Likes</h3>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                              {likes.length > 0 ? (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                  {likes.map(like => (
                                    <div key={like.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"><User size={14} className="text-slate-500 dark:text-slate-400" /></div>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{like.user_name}</span>
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-medium">{formatDate(like.created_at)}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">No likes recorded yet.</div>
                              )}
                              <div className="p-3 bg-slate-50 dark:bg-slate-900/30 text-center border-t border-slate-100 dark:border-slate-700">
                                <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">View All Likes</button>
                              </div>
                            </div>
                            <div className="bg-blue-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-blue-100 dark:border-slate-700 mt-6">
                              <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-2">Performance Tip</h4>
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Articles published on Tuesday mornings tend to get 20% more engagement. Consider sharing this on social media now.</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
              <div className="flex items-center">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium mr-2">Current Status:</span>
                <span className={`uppercase font-bold text-sm px-2 py-0.5 rounded ${selectedArticle.status === 'published' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>{selectedArticle.status}</span>
              </div>
              <div className="flex space-x-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1 sm:flex-none bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center transition-all shadow-lg shadow-red-600/20"
                >
                  <Trash2 size={18} className="mr-2" /> Delete
                </button>
                {selectedArticle.status === 'published' ? (
                  <button onClick={() => handleStatusUpdate(selectedArticle.id.toString(), 'draft')} disabled={isUpdatingStatus} className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400 border border-slate-300 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center transition-all">
                    {isUpdatingStatus ? (<><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Unpublishing...</>) : (<><EyeOff size={18} className="mr-2" /> Unpublish</>)}
                  </button>
                ) : (
                  <button onClick={() => handleStatusUpdate(selectedArticle.id.toString(), 'published')} disabled={isUpdatingStatus} className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isUpdatingStatus ? (<><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Publishing...</>) : (<><Eye size={18} className="mr-2" /> Publish Now</>)}
                  </button>
                )}
              </div>
              {statusUpdateError && (<div className="text-red-500 text-sm mt-2 w-full text-center">{statusUpdateError}</div>)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Articles;