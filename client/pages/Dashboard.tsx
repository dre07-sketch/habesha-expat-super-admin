
import React from 'react';
import { 
  Users, MapPin, Star, FileText, Globe, Video, Mic, Calendar, 
  ArrowUp, ArrowDown, MoreHorizontal, TrendingUp, Edit, Eye, Trash2, Briefcase, Activity, Wifi, Zap, ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

// --- MOCK DATA ---
const growthData = [
  { name: 'Jan', users: 4000, articles: 2400, businesses: 2400, jobs: 45 },
  { name: 'Feb', users: 5000, articles: 3398, businesses: 2210, jobs: 82 },
  { name: 'Mar', users: 6000, articles: 4800, businesses: 2290, jobs: 124 },
  { name: 'Apr', users: 7000, articles: 5908, businesses: 2000, jobs: 156 },
  { name: 'May', users: 8000, articles: 6800, businesses: 2181, jobs: 203 },
  { name: 'Jun', users: 9500, articles: 7800, businesses: 2500, jobs: 289 },
];

const membershipData = [
  { name: 'Free Members', value: 12450, color: '#3b82f6' },
  { name: 'Premium Members', value: 2220, color: '#475569' },
];

const METRICS = [
  { label: 'Total Users', value: '12,450', badge: '+12%', icon: Users, progress: 70, color: 'bg-blue-600', iconBg: 'bg-blue-600' },
  { label: 'Active Jobs', value: '289', badge: '+18%', icon: Briefcase, progress: 75, color: 'bg-emerald-600', iconBg: 'bg-emerald-600' },
  { label: 'Pending Listings', value: '18', badge: '+5%', icon: FileText, progress: 40, color: 'bg-blue-600', iconBg: 'bg-blue-600' },
  { label: 'Total Videos', value: '127', badge: '+15%', icon: Video, progress: 50, color: 'bg-blue-800', iconBg: 'bg-blue-800' },
  { label: 'Upcoming Events', value: '8', badge: '+2', icon: Calendar, progress: 45, color: 'bg-slate-700', iconBg: 'bg-slate-700' },
  { label: 'Active Ads', value: '12', badge: '100%', icon: TrendingUp, progress: 85, color: 'bg-blue-700', iconBg: 'bg-blue-700' },
];

const TOP_REGIONS = [
  { code: 'US', name: 'USA', value: '4,500', growth: '+12%', color: 'bg-blue-500', w: 'w-[80%]' },
  { code: 'ET', name: 'Ethiopia', value: '3,800', growth: '+24%', color: 'bg-indigo-500', w: 'w-[65%]' },
  { code: 'GB', name: 'UK', value: '1,200', growth: '+5%', color: 'bg-emerald-500', w: 'w-[30%]' },
  { code: 'CA', name: 'Canada', value: '950', growth: '+8%', color: 'bg-slate-500', w: 'w-[25%]' },
  { code: 'DE', name: 'Germany', value: '600', growth: '+3%', color: 'bg-slate-600', w: 'w-[15%]' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-100 dark:border-white/10 shadow-xl animate-fade-in">
        <p className="text-sm font-bold text-slate-800 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs mb-1">
            <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500 dark:text-slate-400 capitalize font-medium">{entry.name}:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Welcome back, Administrator</p>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-xl border border-white/20 dark:border-white/10 backdrop-blur-md shadow-sm">
          Last updated: Just now
        </div>
      </div>

      {/* --- ROW 1: METRICS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {METRICS.map((metric, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group border border-white/60 dark:border-white/5">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl ${metric.iconBg} flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform`}>
                <metric.icon size={22} />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20">
                {metric.badge}
              </span>
            </div>
            <div className="space-y-1 mb-4">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{metric.label}</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{metric.value}</h3>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${metric.color} transition-all duration-1000 ease-out`} 
                style={{ width: `${metric.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

     

      {/* --- ROW 3: PLATFORM ANALYTICS GRAPH (REPLACING TABLE) --- */}
      <div className="glass-panel p-6 rounded-2xl border border-white/60 dark:border-white/5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600 dark:text-blue-400"/>
              Platform Traffic & Engagement
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monthly growth overview across all media types</p>
          </div>
          <select className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold px-4 py-2 text-slate-600 dark:text-slate-300 outline-none focus:border-blue-500 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
            <option>Last 6 Months</option>
            <option>Last Year</option>
          </select>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(148, 163, 184, 0.2)', strokeWidth: 2 }} />
              <Area 
                type="monotone" 
                dataKey="users" 
                name="Active Users"
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorUsers)" 
                animationDuration={1500}
              />
              <Area 
                type="monotone" 
                dataKey="articles" 
                name="Content Views"
                stroke="#8b5cf6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorArticles)" 
                animationDuration={1500}
                animationBegin={300}
              />
              <Area 
                type="monotone" 
                dataKey="jobs" 
                name="New Jobs"
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorJobs)" 
                animationDuration={1500}
                animationBegin={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- GLOBAL COMMUNITY MAP --- */}
      <div className="w-full relative overflow-hidden rounded-2xl bg-[#0f172a] shadow-xl border border-slate-700/50 min-h-[500px] flex items-center justify-center">
         {/* Map Header */}
         <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-start pointer-events-none">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Globe className="text-blue-500" />
                Global Community
              </h2>
              <p className="text-slate-400 text-sm mt-1">Real-time user activity map.</p>
            </div>
            <div className="bg-[#052e16] border border-[#14532d] text-[#4ade80] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse">
               <div className="w-2 h-2 rounded-full bg-[#4ade80]"></div>
               LIVE
            </div>
         </div>

         {/* Accurate Map SVG Background */}
         <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-100">
             {/* Using a background image map approach via SVG to ensure accuracy without 100kb+ of path data in code */}
             <svg viewBox="0 0 1000 500" className="w-full h-full fill-[#1e293b] stroke-[#334155] stroke-[0.5]">
                <defs>
                   <filter id="glow">
                      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                      <feMerge>
                         <feMergeNode in="coloredBlur"/>
                         <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                   </filter>
                </defs>
                {/* World Map - Simplified Accurate Paths */}
                <g transform="translate(0, 0)">
                   {/* North America */}
                   <path d="M140,40 L300,40 L380,140 L300,220 L220,280 L160,240 L120,160 Z M90,50 L200,50 L250,150 L180,220 L80,140 Z" fill="#1e293b" stroke="#334155" opacity="0" /> 
                   {/* Actually, to get the "Accurate" look requested without large data, we use a detailed path set */}
                   <path d="M 50 60 Q 250 50 450 60 Q 400 200 250 350 Q 150 250 50 60" fill="none" stroke="none" /> 
                </g>
                
                {/* 
                   Since I cannot inject a 100KB SVG path here, I will use a high-quality dotted representation 
                   or a reliable background image URL if permitted. 
                   Given the constraints, I will use a background image for the map visual to ensure it looks exactly like the "accurate" request 
                   instead of drawing shapes manually.
                */}
                <image href="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png" x="0" y="0" width="1000" height="500" style={{ filter: 'invert(1) opacity(0.15)' }} />
             </svg>
         </div>
         
         {/* Precise Dot Locations using percentages relative to container based on Equirectangular Projection */}
         
         {/* USA West (San Francisco/LA area) */}
         <div className="absolute top-[34%] left-[17%] group cursor-pointer z-10">
            <div className="relative flex items-center justify-center">
              <div className="w-3 h-3 bg-[#3b82f6] rounded-full z-10 shadow-[0_0_15px_rgba(59,130,246,1)] ring-2 ring-[#1e293b]"></div>
              <div className="absolute inset-0 bg-[#3b82f6] rounded-full animate-ping opacity-75"></div>
              {/* Tooltip */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                 USA (West) • 1.2k Users
              </div>
            </div>
         </div>

         {/* Mexico / Central America */}
         <div className="absolute top-[43%] left-[19%] group cursor-pointer z-10">
            <div className="relative flex items-center justify-center">
              <div className="w-3 h-3 bg-[#a855f7] rounded-full z-10 shadow-[0_0_15px_rgba(168,85,247,1)] ring-2 ring-[#1e293b]"></div>
              <div className="absolute inset-0 bg-[#a855f7] rounded-full animate-ping opacity-75 delay-100"></div>
            </div>
         </div>

         {/* Europe (Spain/France) */}
         <div className="absolute top-[28%] left-[49%] group cursor-pointer z-10">
            <div className="relative flex items-center justify-center">
              <div className="w-3 h-3 bg-[#10b981] rounded-full z-10 shadow-[0_0_15px_rgba(16,185,129,1)] ring-2 ring-[#1e293b]"></div>
              <div className="absolute inset-0 bg-[#10b981] rounded-full animate-ping opacity-75 delay-300"></div>
            </div>
         </div>

         {/* Ethiopia (Focus - Large Orange) */}
         <div className="absolute top-[50%] left-[59%] group cursor-pointer z-10">
            <div className="relative flex items-center justify-center">
              {/* Core */}
              <div className="w-4 h-4 bg-[#f59e0b] rounded-full z-20 shadow-[0_0_20px_rgba(245,158,11,1)] ring-2 ring-[#fff]"></div>
              {/* Rings */}
              <div className="absolute inset-0 w-full h-full bg-[#f59e0b] rounded-full animate-ping opacity-80 duration-1000"></div>
              <div className="absolute -inset-4 bg-[#f59e0b] rounded-full animate-pulse opacity-20 blur-xl"></div>
              
              {/* Tooltip */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800 border border-slate-600 text-white text-xs font-bold rounded-lg opacity-100 shadow-xl whitespace-nowrap z-30">
                 Addis Ababa • Live Hub
                 <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 border-r border-b border-slate-600"></div>
              </div>
            </div>
         </div>

         {/* Middle East (Iran/Pakistan area) */}
         <div className="absolute top-[38%] left-[64%] group cursor-pointer z-10">
            <div className="relative flex items-center justify-center">
              <div className="w-2 h-2 bg-[#a855f7] rounded-full z-10 shadow-[0_0_10px_rgba(168,85,247,0.8)] ring-1 ring-[#1e293b]"></div>
              <div className="absolute inset-0 bg-[#a855f7] rounded-full animate-ping opacity-50 delay-500"></div>
            </div>
         </div>


         {/* Floating Card (Right Side) */}
         <div className="absolute right-6 top-20 bottom-6 w-full max-w-xs bg-[#0f172a]/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 shadow-2xl flex flex-col z-20">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Active Regions</h3>
                 <Globe size={14} className="text-slate-500" />
             </div>
             
             <div className="space-y-6 flex-1">
                 {TOP_REGIONS.map((region) => (
                    <div key={region.code}>
                        <div className="flex justify-between items-end mb-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-slate-500 font-bold">{region.code}</span>
                                <span className="text-sm font-bold text-slate-200">{region.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{region.value}</span>
                                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-900/30 px-1.5 py-0.5 rounded border border-emerald-900/50">{region.growth}</span>
                            </div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                            <div className={`h-full rounded-full ${region.color} ${region.w} shadow-[0_0_10px_currentColor] opacity-80`}></div>
                        </div>
                    </div>
                 ))}
             </div>

             <button className="w-full mt-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-blue-400 border border-slate-700 transition-all flex items-center justify-center gap-2 group shadow-lg">
                 VIEW FULL REPORT <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
             </button>
         </div>
      </div>

      {/* --- ROW 4: Content Engagement & Membership --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Content Engagement */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl shadow-sm border border-white/60 dark:border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Globe className="text-blue-600 dark:text-blue-400" size={20} />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Content Engagement</h2>
            </div>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <div className="space-y-6">
            {[
              { label: 'Articles', icon: FileText, value: '45,230', percent: 78, color: 'bg-blue-500' },
              { label: 'Jobs', icon: Briefcase, value: '14,205', percent: 62, color: 'bg-emerald-500' },
              { label: 'Videos', icon: Video, value: '32,150', percent: 85, color: 'bg-indigo-500' },
              { label: 'Podcasts', icon: Mic, value: '18,640', percent: 72, color: 'bg-violet-500' },
              { label: 'Events', icon: Calendar, value: '12,890', percent: 91, color: 'bg-blue-600' },
              { label: 'Directory', icon: MapPin, value: '28,340', percent: 68, color: 'bg-sky-500' },
            ].map((item, idx) => (
              <div key={idx} className="group">
                <div className="flex justify-between text-sm mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-500 group-hover:text-blue-500 transition-colors">
                      <item.icon size={14} />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{item.value} views</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 rounded text-xs">{item.percent}%</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color} relative overflow-hidden shadow-lg shadow-${item.color}/30`} style={{ width: `${item.percent}%` }}>
                    <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite] translate-x-[-100%]"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Membership Distribution */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl shadow-sm border border-white/60 dark:border-white/5">
             <div className="flex items-center gap-2 mb-6">
                <Users className="text-blue-600 dark:text-blue-400" size={20} />
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Membership Distribution</h2>
             </div>

             <div className="flex flex-col items-center justify-center py-4">
                <div className="w-[220px] h-[220px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={membershipData}
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                                cornerRadius={6}
                            >
                                {membershipData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-3xl font-bold text-slate-800 dark:text-white">12.4k</span>
                         <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Users</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full mt-8">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20 text-center">
                        <p className="text-xs text-slate-500 dark:text-blue-300 font-medium mb-1">Free Members</p>
                        <p className="text-xl font-bold text-slate-800 dark:text-white">10,230</p>
                        <p className="text-[10px] text-blue-500 font-bold mt-1">+8% Growth</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Premium</p>
                        <p className="text-xl font-bold text-slate-800 dark:text-white">2,220</p>
                        <p className="text-[10px] text-emerald-500 font-bold mt-1">+18% Growth</p>
                    </div>
                </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
