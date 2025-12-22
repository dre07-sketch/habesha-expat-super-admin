import React, { useState, useEffect } from 'react';
import { User, MoreHorizontal, Shield, Mail, Ban, CheckCircle, X, Filter, Loader2, Search } from 'lucide-react';
import { User as UserType, Status } from '../types';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailAudience, setEmailAudience] = useState('all');

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:5000/api/users/users-get', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401 || response.status === 403) {
          setError('Unauthorized. Please login again.');
          // Optional: Redirect to login if needed, or handle in global interceptor
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleStatus = async (id: string) => {
    // Optimistic update
    const userToUpdate = users.find(u => u.id === id);
    if (!userToUpdate) return;

    const newStatus = userToUpdate.status === Status.ACTIVE ? Status.SUSPENDED : Status.ACTIVE;

    // Update UI immediately
    setUsers(users.map(user =>
      user.id === id ? { ...user, status: newStatus } : user
    ));

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      // Revert on error
      setUsers(users.map(user =>
        user.id === id ? { ...user, status: userToUpdate.status } : user
      ));
      alert("Failed to update user status. Check console.");
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/users/mass-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
          audience: emailAudience
        })
      });

      const data = await response.json();

      if (response.ok) {

        setIsEmailModalOpen(false);
        setEmailSubject('');
        setEmailMessage('');
        setEmailAudience('all');
      } else {

      }
    } catch (err) {
      console.error(err);
      alert('Transmission failed. Check console for details.');
    } finally {
      setIsSending(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = activeFilter === 'All' || user.role === activeFilter;
    const matchesSearch = searchTerm === '' ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const filters = ['All', 'Free', 'Member', 'Author'];

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

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Box */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="text-slate-400" size={18} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <X className="text-slate-400 hover:text-slate-600 dark:hover:text-white" size={18} />
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border ${activeFilter === filter
                ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 dark:border-white shadow-md transform scale-105'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/10'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-blue-500" size={32} />
          <span className="ml-3 text-slate-600 dark:text-slate-300">Loading users...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 text-red-700 dark:text-red-400">
          <div className="flex items-center gap-2">
            <X size={20} />
            <span className="font-medium">Error loading users</span>
          </div>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && (
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
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
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
                          <span className={`font-medium ${user.role === 'Member' ? 'text-amber-600 dark:text-amber-400' :
                            user.role === 'Author' ? 'text-blue-600 dark:text-blue-400' :
                              'text-slate-600 dark:text-slate-300'
                            }`}>
                            {user.role}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === Status.ACTIVE ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                          }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">{user.joinedAt}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">{user.lastLogin}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => toggleStatus(user.id)}
                          className={`p-2 rounded-lg transition-colors mr-2 ${user.status === Status.ACTIVE
                            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                            : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                            }`}
                          title={user.status === Status.ACTIVE ? "Suspend User" : "Activate User"}
                        >
                          {user.status === Status.ACTIVE ? <Ban size={18} /> : <CheckCircle size={18} />}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      {searchTerm ? 'No users match your search' : 'No users found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                <select
                  value={emailAudience}
                  onChange={(e) => setEmailAudience(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                >
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