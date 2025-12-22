import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';
import MediaModal from '../components/ContentModal';
import BusinessModal from '../components/BusinessModal';

// --- Types ---
export enum ContentType {
  VIDEO = 'Video',
  PODCAST = 'Podcast',
  BUSINESS = 'Business',
  REVIEW = 'Review' // Defined for data handling, but excluded from filters
}

export interface ContentItem {
  id: number;
  title: string;
  type: ContentType;
  author: string;
  status: string;
  views: number;
  date: string;
  thumbnail_url: string | null;
  media_url: string | null;
  parent_id?: number; // Added to link Reviews to Businesses
  likes?: number;
  comments?: number;
}

const API_BASE_URL = 'http://localhost:5000/api/contents';
const UPLOADS_URL = `${API_BASE_URL}/uploads/`;

const ContentManager: React.FC = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/contents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch content');
      const data = await response.json();

      const formattedData = data.map((item: any) => ({
        ...item,
        likes: Number(item.likes_count || 0),
        comments: Number(item.comments_count || 0)
      }));

      setContent(formattedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Filter for Main Grid: Exclude Reviews
  const filteredContent = content.filter(item => {
    // 1. Hide Reviews from the main list
    if (item.type === ContentType.REVIEW) return false;

    // 2. Apply Search
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.author && item.author.toLowerCase().includes(searchTerm.toLowerCase()));

    // 3. Apply Tab Filter
    const matchesFilter = activeFilter === 'All' || item.type === activeFilter;

    return matchesSearch && matchesFilter;
  });

  // Helper: Get reviews for the currently selected business
  const getSelectedReviews = () => {
    if (!selectedItem || selectedItem.type !== ContentType.BUSINESS) return [];
    return content.filter(c => c.type === ContentType.REVIEW && c.parent_id === selectedItem.id);
  };

  const filters = ['All', ContentType.VIDEO, ContentType.PODCAST, ContentType.BUSINESS];

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${UPLOADS_URL}${url}`;
  };

  if (loading) return <div className="flex justify-center h-96 items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center h-96 text-red-500">
      <AlertCircle size={48} className="mb-4" />
      <p>Error loading content: {error}</p>
      <button onClick={fetchContent} className="mt-4 px-4 py-2 bg-slate-100 rounded text-black">Try Again</button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Content & Media</h1>
        <div className="flex gap-2 flex-1 md:max-w-md justify-end">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search content..."
              className="pl-10 pr-4 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchContent} className="p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 transition-colors">
            <RefreshCw size={18} className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeFilter === filter
              ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-300 dark:border-white/10'
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-semibold">Content</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Author/Host</th>
                <th className="p-4 font-semibold">Stats</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-sm">
              {filteredContent.map((item) => (
                <tr key={`${item.type}-${item.id}`} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-9 bg-slate-200 dark:bg-slate-800 rounded overflow-hidden shrink-0 border border-slate-100 dark:border-white/5 relative flex items-center justify-center">
                        {getImageUrl(item.thumbnail_url) ? (
                          <img src={getImageUrl(item.thumbnail_url)!} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-[10px] text-slate-400">No IMG</div>
                        )}
                      </div>

                      <div>
                        <p className="font-medium text-slate-800 dark:text-white line-clamp-1 max-w-[200px]" title={item.title}>
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500">{formatDate(item.date)}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${item.type === ContentType.BUSINESS ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                      item.type === ContentType.VIDEO ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' :
                        item.type === ContentType.PODCAST ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' :
                          'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                      }`}>
                      {item.type}
                    </span>
                  </td>

                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {item.author || 'System'}
                  </td>

                  <td className="p-4">
                    {item.type === ContentType.BUSINESS ? (
                      <span className="text-xs text-slate-400">Directory</span>
                    ) : item.type === ContentType.PODCAST ? (
                      <span className="text-xs text-slate-400">Audio Only</span>
                    ) : (
                      <div className="text-slate-600 dark:text-slate-300 font-mono text-xs">
                        {item.views?.toLocaleString()} views
                      </div>
                    )}
                  </td>

                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border capitalize ${item.status === 'visible' || item.status === 'active'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                      {item.status || 'Unknown'}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-700 dark:text-white"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Passing filtered reviews to the modal */}
      {selectedItem?.type === ContentType.BUSINESS ? (
        <BusinessModal
          isOpen={!!selectedItem}
          item={selectedItem}
          reviews={getSelectedReviews()} // Pass the reviews here
          onClose={() => setSelectedItem(null)}
        />
      ) : (
        <MediaModal
          isOpen={!!selectedItem}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default ContentManager;