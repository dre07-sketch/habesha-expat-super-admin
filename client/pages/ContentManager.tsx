
import React, { useState } from 'react';
import { Search, Filter, Star } from 'lucide-react';
import { ContentItem, ContentType, Status } from '../types';
import ContentModal from '../components/ContentModal';

// Mock Data
//pop 
const MOCK_CONTENT: ContentItem[] = [
  {
    id: '1',
    title: 'The Future of Tech in East Africa',
    type: ContentType.PODCAST,
    author: 'Dawit Kebede',
    status: Status.ACTIVE,
    views: 1240,
    date: '2023-10-24',
    description: 'An in-depth discussion about the rising tech hubs in Addis Ababa and Asmara.',
    thumbnailUrl: 'https://picsum.photos/seed/tech/400/300',
    mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Sample Audio
    likes: 156,
    comments: 24
  },
  {
    id: '2',
    title: 'Habesha Restaurant & Lounge',
    type: ContentType.BUSINESS,
    author: 'Sarah Johnson',
    status: Status.PENDING,
    views: 50,
    date: '2023-10-23',
    description: 'Authentic Ethiopian cuisine in the heart of the city. Traditional dishes and coffee ceremony.',
    thumbnailUrl: 'https://picsum.photos/seed/food/400/300',
    rating: 4.8,
    reviewCount: 124,
    location: 'Addis Ababa, Bole',
    likes: 89,
    comments: 12
  },
  {
    id: '3',
    title: 'Diaspora Investment Guide 2025',
    type: ContentType.VIDEO,
    author: 'Adamant Inv.',
    status: Status.ACTIVE,
    views: 8902,
    date: '2023-10-20',
    description: 'Key sectors for investment in the coming year. Expert analysis and projections.',
    thumbnailUrl: 'https://picsum.photos/seed/invest/400/300',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Sample Video
    likes: 2400,
    comments: 560
  },
  {
    id: '4',
    title: 'Music Video: New Release',
    type: ContentType.VIDEO,
    author: 'Habesha Tunes',
    status: Status.ACTIVE,
    views: 15000,
    date: '2023-10-19',
    description: 'Latest music video release.',
    thumbnailUrl: 'https://picsum.photos/seed/music/400/300',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', // Sample Video
    likes: 3200,
    comments: 120
  }
];

const ContentManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filteredContent = MOCK_CONTENT.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || item.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const filters = ['All', ContentType.VIDEO, ContentType.PODCAST, ContentType.BUSINESS, ContentType.ARTICLE];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Content & Media</h1>
        
        <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search content..." 
              className="pl-10 pr-4 py-2 rounded-xl w-full text-sm bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
            <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border ${
                    activeFilter === filter
                    ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 dark:border-white shadow-md transform scale-105'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/10'
                }`}
            >
                {filter}
            </button>
        ))}
      </div>

      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4 font-semibold">Content</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Author</th>
                <th className="p-4 font-semibold">Stats</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-sm">
              {filteredContent.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-9 bg-slate-200 dark:bg-slate-800 rounded overflow-hidden shrink-0 border border-slate-100 dark:border-white/5">
                        <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white line-clamp-1">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        item.type === ContentType.BUSINESS ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 
                        item.type === ContentType.VIDEO ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 
                        item.type === ContentType.PODCAST ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' :
                        'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                    }`}>
                        {item.type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{item.author}</td>
                  <td className="p-4">
                    <div className="text-slate-600 dark:text-slate-300 font-mono text-xs">{item.views.toLocaleString()} views</div>
                    {item.type === ContentType.BUSINESS && item.rating && (
                        <div className="flex items-center gap-1 text-xs text-yellow-500 mt-1">
                             <Star size={10} fill="currentColor" />
                             <span>{item.rating} ({item.reviewCount})</span>
                        </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        item.status === Status.ACTIVE 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                    }`}>
                        {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                        onClick={() => setSelectedItem(item)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-700 dark:text-white transition-colors"
                    >
                        View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredContent.length === 0 && (
            <div className="p-12 text-center">
                <p className="text-slate-500 dark:text-slate-400 mb-2">No content found matching your filters.</p>
                <button 
                    onClick={() => {setActiveFilter('All'); setSearchTerm('');}}
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                    Clear Filters
                </button>
            </div>
        )}
      </div>

      <ContentModal 
        isOpen={!!selectedItem} 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
};

export default ContentManager;
