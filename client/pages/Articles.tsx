import React, { useState } from 'react';
import { Search, Filter, Edit, Eye, Trash2, Plus } from 'lucide-react';
import { ContentItem, ContentType, Status } from '../types';
import ContentModal from '../components/ContentModal';

interface Article {
  id: string;
  title: string;
  category: string;
  author: string;
  status: 'Published' | 'Draft' | 'Review';
  published: string;
  img: string;
  views: number;
  likes: number;
  comments: number;
}
//------------------------------ Mock Data ------------------//
const ARTICLES: Article[] = [
  { id: '1', title: 'The Rise of Tech in Addis', category: 'Technology', author: 'Dawit K.', status: 'Published', published: 'Oct 24, 2025', img: 'https://picsum.photos/seed/tech/50/50', views: 3421, likes: 234, comments: 45 },
  { id: '2', title: 'Best Coffee Spots in Bole', category: 'Lifestyle', author: 'Sarah J.', status: 'Draft', published: 'Oct 23, 2025', img: 'https://picsum.photos/seed/coffee/50/50', views: 0, likes: 0, comments: 0 },
  { id: '3', title: 'Investment Laws Update', category: 'Business', author: 'Michael B.', status: 'Review', published: 'Oct 22, 2025', img: 'https://picsum.photos/seed/law/50/50', views: 120, likes: 12, comments: 4 },
  { id: '4', title: 'Cultural Heritage Sites', category: 'Culture', author: 'Tigist A.', status: 'Published', published: 'Oct 21, 2025', img: 'https://picsum.photos/seed/culture/50/50', views: 8540, likes: 1250, comments: 320 },
  { id: '5', title: 'Diaspora Banking Guide', category: 'Finance', author: 'Robel T.', status: 'Published', published: 'Oct 20, 2025', img: 'https://picsum.photos/seed/bank/50/50', views: 5432, likes: 432, comments: 56 },
  { id: '6', title: 'Art Scene in Asmara', category: 'Art', author: 'Yonas M.', status: 'Published', published: 'Oct 18, 2025', img: 'https://picsum.photos/seed/art/50/50', views: 2100, likes: 180, comments: 22 },
  { id: '7', title: 'Sustainable Agriculture', category: 'Environment', author: 'Hana P.', status: 'Draft', published: 'Oct 15, 2025', img: 'https://picsum.photos/seed/farm/50/50', views: 0, likes: 0, comments: 0 },
];

const Articles: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filteredArticles = ARTICLES.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewArticle = (article: Article) => {
    setSelectedArticle(article);
  };

  // Convert Article to ContentItem for the Modal
  const modalItem: ContentItem | null = selectedArticle ? {
    id: selectedArticle.id,
    title: selectedArticle.title,
    type: ContentType.ARTICLE,
    author: selectedArticle.author,
    status: selectedArticle.status === 'Published' ? Status.ACTIVE : Status.PENDING,
    views: selectedArticle.views,
    date: selectedArticle.published,
    description: `This is the detailed content for the article "${selectedArticle.title}". It discusses various aspects of ${selectedArticle.category.toLowerCase()} relevant to the Habesha diaspora community.`,
    thumbnailUrl: selectedArticle.img.replace('50/50', '400/300'),
    likes: selectedArticle.likes,
    comments: selectedArticle.comments
  } : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Articles</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage editorial content and publications</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search articles..." 
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20">
              <Plus size={18} /> Write Article
           </button>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-white/60 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Published</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-blue-50/30 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 dark:border-white/10">
                        <img src={article.img} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-white line-clamp-1">{article.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 shadow-sm">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{article.author}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit ${
                      article.status === 'Published' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20' :
                      article.status === 'Review' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        article.status === 'Published' ? 'bg-emerald-500' : 
                        article.status === 'Review' ? 'bg-orange-500' : 'bg-slate-500'
                      }`}></span>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{article.published}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all" 
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleViewArticle(article)}
                        className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all" 
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all" 
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ContentModal 
        isOpen={!!selectedArticle} 
        item={modalItem} 
        onClose={() => setSelectedArticle(null)} 
      />
    </div>
  );
};

export default Articles;