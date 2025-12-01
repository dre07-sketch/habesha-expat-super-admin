
import React, { useState } from 'react';
import { User, MoreHorizontal, Shield, Mail, Ban, CheckCircle, X, Filter, Loader2 } from 'lucide-react';
import { User as UserType, UserRole, Status } from '../types';

const INITIAL_USERS: UserType[] = [
  { id: '1', name: 'Abebe Bikila', email: 'abebe@example.com', role: UserRole.PREMIUM, status: Status.ACTIVE, joinedAt: '2023-01-15', lastLogin: '2 hrs ago' },
  { id: '2', name: 'Yodit Lemlem', email: 'yodit@example.com', role: UserRole.ADMIN, status: Status.ACTIVE, joinedAt: '2023-02-20', lastLogin: '5 mins ago' },
  { id: '3', name: 'Kebede Michael', email: 'kebede@example.com', role: UserRole.FREE, status: Status.SUSPENDED, joinedAt: '2023-05-10', lastLogin: '3 days ago' },
  { id: '4', name: 'Saba Tech', email: 'info@sabatech.com', role: UserRole.EDITOR, status: Status.ACTIVE, joinedAt: '2023-08-12', lastLogin: '1 day ago' },
  { id: '5', name: 'Admin User', email: 'admin@habesha.com', role: UserRole.SUPER_ADMIN, status: Status.ACTIVE, joinedAt: '2022-12-01', lastLogin: 'Just now' },
  { id: '6', name: 'Tigist Haile', email: 'tigist@example.com', role: UserRole.FREE, status: Status.ACTIVE, joinedAt: '2023-09-01', lastLogin: '1 week ago' },
  { id: '7', name: 'Robel Tesfaye', email: 'robel@example.com', role: UserRole.PREMIUM, status: Status.ACTIVE, joinedAt: '2023-07-15', lastLogin: '4 hrs ago' },
];

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>(INITIAL_USERS);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [isSending, setIsSending] = useState(false);

  const toggleStatus = (id: string) => {
    setUsers(users.map(user => {
        if (user.id === id) {
            return {
                ...user,
                status: user.status === Status.ACTIVE ? Status.SUSPENDED : Status.ACTIVE
            };
        }
        return user;
    }));
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    // Simulate network delay
    setTimeout(() => {
        setIsSending(false);
        alert(`Email sent to users!\nSubject: ${emailSubject}`);
        setIsEmailModalOpen(false);
        setEmailSubject('');
        setEmailMessage('');
    }, 2000);
  };

  const filteredUsers = users.filter(user => {
    if (activeFilter === 'All') return true;
    return user.role === activeFilter;
  });

  const filters = ['All', UserRole.FREE, UserRole.PREMIUM, UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">User Management</h1>
        <button 
            onClick={() => setIsEmailModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
            <Mail size={16} />
            Mass Email
        </button>
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
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Joined</th>
                <th className="p-4 font-semibold">Last Login</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-sm">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-white">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                        {user.role === UserRole.SUPER_ADMIN && <Shield size={14} className="text-purple-500 dark:text-purple-400" />}
                        <span className={`font-medium ${
                            user.role === UserRole.SUPER_ADMIN ? 'text-purple-600 dark:text-purple-400' : 
                            user.role === UserRole.PREMIUM ? 'text-amber-600 dark:text-amber-400' :
                            user.role === UserRole.EDITOR ? 'text-blue-600 dark:text-blue-400' :
                            'text-slate-600 dark:text-slate-300'
                        }`}>
                            {user.role}
                        </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === Status.ACTIVE ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                        {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{user.joinedAt}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{user.lastLogin}</td>
                  <td className="p-4 text-right">
                    {user.role !== UserRole.SUPER_ADMIN && (
                        <button 
                            onClick={() => toggleStatus(user.id)}
                            className={`p-2 rounded-lg transition-colors mr-2 ${
                                user.status === Status.ACTIVE 
                                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' 
                                : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                            }`}
                            title={user.status === Status.ACTIVE ? "Suspend User" : "Activate User"}
                        >
                            {user.status === Status.ACTIVE ? <Ban size={18} /> : <CheckCircle size={18} />}
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mass Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-white/20 dark:bg-black/50 transition-all duration-300" onClick={() => setIsEmailModalOpen(false)}></div>
            <div className="relative w-full max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 animate-fade-in ring-1 ring-black/5">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Mail className="text-blue-500" size={24} />
                        Send Mass Email
                    </h2>
                    <button onClick={() => setIsEmailModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSendEmail} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Target Audience</label>
                        <select className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-blue-500">
                            <option value="all">All Users</option>
                            <option value="members">Active Members</option>
                            <option value="premium">Premium Subscribers</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Subject Line</label>
                        <input 
                            type="text" 
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            placeholder="Announcement Title..."
                            required
                            className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Message Content</label>
                        <textarea 
                            value={emailMessage}
                            onChange={(e) => setEmailMessage(e.target.value)}
                            placeholder="Write your message here..."
                            rows={5}
                            required
                            className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                        ></textarea>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button"
                            disabled={isSending}
                            onClick={() => setIsEmailModalOpen(false)}
                            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSending}
                            className="flex-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" /> Sending...
                                </>
                            ) : (
                                'Send Blast'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
