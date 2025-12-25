import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, Power, UserPlus, Lock, Shield, Ban, CheckCircle, Camera, Upload, Loader2, RefreshCw } from 'lucide-react';

// --- Types based on your DB Schema ---
interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string; // 'active' | 'suspended'
    avatar_url?: string;
    last_active?: string; // Mapped from created_at in your query
}

interface SystemStatus {
    id: number;
    service_name: string;
    status: string; // 'activated' | 'deactivated'
    maintenance_message: string;
    updated_at: string;
}

// --- Configuration ---
const API_BASE_URL = 'http://localhost:5000/api/settings'; // Adjust port/path as needed

const Settings: React.FC = () => {
    // Form State
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'Admin' });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    // Data State
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [siteStatus, setSiteStatus] = useState({ public: true, admin: true });

    // Credential State
    const [currentAdminEmail, setCurrentAdminEmail] = useState('');
    const [newPassword, setNewPassword] = useState({ new: '', confirm: '' });

    // Loading States
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isTogglingStatus, setIsTogglingStatus] = useState<number | null>(null);

    // --- 1. Fetch Initial Data ---
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const headers: HeadersInit = {
                'Authorization': `Bearer ${token}`
            };

            // Fetch Current Admin Email
            if (token) {
                try {
                    const meRes = await fetch(`${API_BASE_URL}/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (meRes.ok) {
                        const meData = await meRes.json();
                        if (meData.email) {
                            setCurrentAdminEmail(meData.email);
                        }
                    } else {
                        console.error("Failed to fetch current admin info:", meRes.status);
                    }
                } catch (e) {
                    console.error("Error fetching me:", e);
                }
            }

            // Fetch Admins
            try {
                const adminsRes = await fetch(`${API_BASE_URL}/admins-get`, { headers });
                if (adminsRes.ok) {
                    const adminsData = await adminsRes.json();
                    if (Array.isArray(adminsData)) {
                        setAdmins(adminsData);
                    } else {
                        console.error("Admins data is not an array:", adminsData);
                        setAdmins([]);
                    }
                } else {
                    console.error("Failed to fetch admins:", adminsRes.status);
                    setAdmins([]);
                }
            } catch (e) {
                console.error("Error fetching admins:", e);
                setAdmins([]);
            }

            // Fetch System Status
            try {
                const statusRes = await fetch(`${API_BASE_URL}/system-status`, { headers });
                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    if (Array.isArray(statusData)) {
                        // Map DB 'activated'/'deactivated' to boolean
                        const publicSite = statusData.find((s: any) => s.service_name === 'Public Website');
                        const adminPanel = statusData.find((s: any) => s.service_name === 'Admin Panel');

                        setSiteStatus({
                            public: publicSite?.status === 'activated',
                            admin: adminPanel?.status === 'activated'
                        });
                    } else {
                        console.error("Status data is not an array:", statusData);
                    }
                } else {
                    console.error("Failed to fetch system status:", statusRes.status);
                }
            } catch (e) {
                console.error("Error fetching system status:", e);
            }

            setIsLoadingData(false);
        } catch (error) {
            console.error("Failed to fetch settings data:", error);
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- 2. System Kill Switch Logic ---
    const handleKillSwitch = async (target: 'public' | 'admin') => {
        const isOnline = siteStatus[target];
        const action = isOnline ? 'SHUT DOWN' : 'RESTORE';
        const dbStatus = isOnline ? 'deactivated' : 'activated'; // Value for DB
        const endpoint = target === 'public' ? '/system-status/website' : '/system-status/admin';


        if (confirm) {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: dbStatus })
                });

                if (response.ok) {
                    setSiteStatus(prev => ({ ...prev, [target]: !prev[target] }));
                } else {
                    alert("Failed to update system status.");
                }
            } catch (err) {
                console.error(err);
                alert("Network error.");
            }
        }
    };

    // --- 3. Toggle Admin Status Logic ---
    const toggleAdminStatus = async (admin: AdminUser) => {
        const newStatus = admin.status === 'active' ? 'suspended' : 'active';
        setIsTogglingStatus(admin.id);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/admins/${admin.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                setAdmins(admins.map(a => a.id === admin.id ? { ...a, status: newStatus } : a));
            } else {
                alert("Failed to update status");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsTogglingStatus(null);
        }
    };

    // --- 4. Image Handling ---
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);

            // Create local preview
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setImagePreview(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // --- 5. Register Admin Logic ---
    const handleRegisterAdmin = async () => {
        if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
            alert("Please fill in all fields");
            return;
        }

        setIsRegistering(true);

        try {
            let avatarUrl = '';

            // A. Upload Image first (assuming you have an endpoint for the multer config)
            if (selectedImage) {
                const formData = new FormData();
                formData.append('image', selectedImage); // Field name must match multer

                // Note: You didn't provide the exact route for upload, assuming '/upload'
                const token = localStorage.getItem('authToken');
                // Note: FormData does not need Content-Type header manually set, browsers handle it for multipart
                const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    avatarUrl = data.path || data.url; // Adjust based on your upload response
                }
            }

            // B. Create Admin Record
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/admins-create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newAdmin,
                    avatar_url: avatarUrl
                })
            });

            if (response.ok) {
                const createdAdmin = await response.json();
                // Add new admin to list with mapped fields
                setAdmins([...admins, {
                    ...createdAdmin,
                    status: 'active',
                    last_active: new Date().toISOString()
                }]);

                // Reset Form
                setNewAdmin({ name: '', email: '', password: '', role: 'Admin' });
                setSelectedImage(null);
                setImagePreview('');

            } else {
                const err = await response.json();
                alert(`Error: ${err.error || 'Failed to create admin'}`);
            }

        } catch (err) {
            console.error(err);
            alert("Network error occurred.");
        } finally {
            setIsRegistering(false);
        }
    };

    // Credential Update Logic
    const handleUpdateCredentials = async () => {
        if (newPassword.new && newPassword.new.length < 8) {
            alert("New password must be at least 8 characters long.");
            return;
        }

        if (newPassword.new && newPassword.new !== newPassword.confirm) {
            alert("Passwords do not match.");
            return;
        }

        setIsUpdatingCreds(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/settings/account`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: currentAdminEmail,
                    password: newPassword.new || undefined
                })
            });

            if (response.ok) {
                alert("Credentials updated successfully.");
                setNewPassword({ new: '', confirm: '' });
            } else {
                const data = await response.json();
                alert(`Update failed: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while updating credentials.");
        } finally {
            setIsUpdatingCreds(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-500">
                <Loader2 className="animate-spin mr-2" /> Loading System Settings...
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">System Settings</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage credentials, access control, and emergency protocols.</p>
                </div>
                <button onClick={fetchData} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors" title="Refresh Data">
                    <RefreshCw size={20} className="text-slate-500" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Settings */}
                <div className="glass-panel p-6 rounded-2xl space-y-6 border border-white/60 dark:border-white/5">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-white/5">
                        <Lock size={20} className="text-blue-500" />
                        Admin Credentials
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Email Address</label>
                            <input
                                type="email"
                                value={currentAdminEmail}
                                onChange={(e) => setCurrentAdminEmail(e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl text-sm text-slate-800 dark:text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">New Password</label>
                                <input
                                    type="password"
                                    placeholder="Minimum 8 characters"
                                    value={newPassword.new}
                                    onChange={(e) => setNewPassword({ ...newPassword, new: e.target.value })}
                                    className="glass-input w-full px-4 py-3 rounded-xl text-sm text-slate-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={newPassword.confirm}
                                    onChange={(e) => setNewPassword({ ...newPassword, confirm: e.target.value })}
                                    className="glass-input w-full px-4 py-3 rounded-xl text-sm text-slate-800 dark:text-white"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleUpdateCredentials}
                            disabled={isUpdatingCreds}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isUpdatingCreds ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" /> Updating...
                                </>
                            ) : (
                                <>
                                    <Save size={18} /> Update Credentials
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Create New Admin */}
                <div className="glass-panel p-6 rounded-2xl space-y-6 border border-white/60 dark:border-white/5">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-white/5">
                        <UserPlus size={20} className="text-emerald-500" />
                        Register New Admin
                    </h2>

                    {/* Image Upload Section */}
                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center overflow-hidden hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Admin Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center p-2">
                                        <Camera size={20} className="text-slate-400 mx-auto mb-1" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 rounded-xl text-white shadow-lg cursor-pointer hover:bg-emerald-400 transition-colors border-2 border-white dark:border-slate-900">
                                <Upload size={12} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Profile Picture</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Upload a photo for the admin profile. <br />Supported formats: JPG, PNG.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Full Name</label>
                            <input
                                type="text"
                                className="glass-input w-full px-4 py-3 rounded-xl text-sm text-slate-800 dark:text-white"
                                value={newAdmin.name}
                                onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                placeholder="e.g., Abebe Bikila"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    className="glass-input w-full px-4 py-3 rounded-xl text-sm text-slate-800 dark:text-white"
                                    value={newAdmin.email}
                                    onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    placeholder="admin@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Role</label>
                                <select
                                    className="glass-input w-full px-4 py-3 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 appearance-none"
                                    value={newAdmin.role}
                                    onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value })}
                                >
                                    <option className="text-black" value="Admin">Admin</option>
                                    <option className="text-black" value="Editor">Editor</option>
                                    <option className="text-black" value="Super-Admin">Super-Admin</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Temp Password</label>
                            <input
                                type="password"
                                className="glass-input w-full px-4 py-3 rounded-xl text-sm text-slate-800 dark:text-white"
                                value={newAdmin.password}
                                onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            onClick={handleRegisterAdmin}
                            disabled={isRegistering}
                            className="w-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-700 dark:text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isRegistering ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" /> Creating Account...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} /> Create Admin Account
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* EMERGENCY SHUTDOWN ZONE */}
            <div className="relative rounded-3xl overflow-hidden group border border-red-500/20 shadow-2xl shadow-red-900/20">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-slate-900 dark:bg-black">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ef4444 0, #ef4444 10px, transparent 10px, transparent 20px)' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-900/90"></div>
                </div>

                <div className="relative p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse">
                            <AlertTriangle className="text-red-500" size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Emergency Shutdown Zone</h2>
                            <p className="text-red-200/70 text-sm mt-1">Restricted Area. Actions here have immediate global impact.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Public Site Control */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex items-center justify-between hover:bg-white/10 transition-all group/card">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <GlobeIcon active={siteStatus.public} />
                                    <h3 className="text-lg font-bold text-white">Public Website</h3>
                                </div>
                                <p className="text-sm text-slate-400 max-w-[200px]">Controls visibility of www.habeshaexpat.com</p>
                                <div className={`mt-4 text-xs font-mono font-bold py-1 px-3 rounded-lg inline-flex items-center gap-2 border ${siteStatus.public ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                    <span className={`w-2 h-2 rounded-full ${siteStatus.public ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                    {siteStatus.public ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
                                </div>
                            </div>

                            <button
                                onClick={() => handleKillSwitch('public')}
                                className={`relative w-24 h-12 rounded-full p-1 transition-all duration-500 ease-in-out shadow-inner cursor-pointer ${siteStatus.public
                                    ? 'bg-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-slate-600'
                                    : 'bg-slate-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] border border-red-900/50'
                                    }`}
                            >
                                <div className={`absolute inset-0 rounded-full transition-opacity duration-500 ${siteStatus.public ? 'opacity-0' : 'opacity-100 shadow-[0_0_20px_rgba(239,68,68,0.4)]'}`}></div>

                                {/* The Sliding Knob */}
                                <div className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-500 transform ${siteStatus.public
                                    ? 'translate-x-12 bg-gradient-to-br from-emerald-400 to-emerald-600 border border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.6)]'
                                    : 'translate-x-0 bg-gradient-to-br from-red-500 to-red-700 border border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.6)]'
                                    }`}>
                                    <Power size={18} className="text-white drop-shadow-md" />
                                </div>
                            </button>
                        </div>

                        {/* Admin Panel Control */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex items-center justify-between hover:bg-white/10 transition-all group/card">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldAlert active={siteStatus.admin} />
                                    <h3 className="text-lg font-bold text-white">Admin Panel</h3>
                                </div>
                                <p className="text-sm text-slate-400 max-w-[200px]">Controls access to admin.habeshaexpat.com</p>
                                <div className={`mt-4 text-xs font-mono font-bold py-1 px-3 rounded-lg inline-flex items-center gap-2 border ${siteStatus.admin ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                    <span className={`w-2 h-2 rounded-full ${siteStatus.admin ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                    {siteStatus.admin ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
                                </div>
                            </div>

                            <button
                                onClick={() => handleKillSwitch('admin')}
                                className={`relative w-24 h-12 rounded-full p-1 transition-all duration-500 ease-in-out shadow-inner cursor-pointer ${siteStatus.admin
                                    ? 'bg-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-slate-600'
                                    : 'bg-slate-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] border border-red-900/50'
                                    }`}
                            >
                                <div className={`absolute inset-0 rounded-full transition-opacity duration-500 ${siteStatus.admin ? 'opacity-0' : 'opacity-100 shadow-[0_0_20px_rgba(239,68,68,0.4)]'}`}></div>

                                {/* The Sliding Knob */}
                                <div className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-500 transform ${siteStatus.admin
                                    ? 'translate-x-12 bg-gradient-to-br from-emerald-400 to-emerald-600 border border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.6)]'
                                    : 'translate-x-0 bg-gradient-to-br from-red-500 to-red-700 border border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.6)]'
                                    }`}>
                                    <Power size={18} className="text-white drop-shadow-md" />
                                </div>
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* ADMIN ACCESS CONTROL LIST */}
            <div className="relative rounded-3xl overflow-hidden border border-white/60 dark:border-white/5 bg-white/40 dark:bg-slate-900/50 backdrop-blur-xl shadow-xl">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Admin Privileges</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage active administrators and system moderators.</p>
                        </div>
                        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-sm">
                            <Shield className="text-indigo-500" size={24} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {admins.length === 0 && (
                            <div className="text-center py-8 text-slate-400">No administrators found.</div>
                        )}
                        {admins.map((admin) => (
                            <div key={admin.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        {admin.avatar_url ? (
                                            <img src={admin.avatar_url} alt={admin.name} className="w-12 h-12 rounded-full object-cover shadow-lg" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                {admin.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${admin.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white">{admin.name}</h3>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            <span>{admin.email}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                            <span className={`${admin.role === 'SuperAdmin' ? 'text-amber-500 font-bold' : 'text-indigo-500'}`}>{admin.role}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mt-4 md:mt-0">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Created At</p>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {admin.last_active ? new Date(admin.last_active).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>

                                    <div className="h-10 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden sm:block"></div>

                                    <button
                                        onClick={() => toggleAdminStatus(admin)}
                                        disabled={isTogglingStatus === admin.id || admin.role === 'Super-Admin'}
                                        style={admin.role === 'Super-Admin' ? { filter: 'blur(2px)', opacity: 0.5, pointerEvents: 'none' } : {}}
                                        className={`min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 ${admin.status === 'active'
                                            ? 'bg-white dark:bg-white/5 text-red-500 border border-slate-200 dark:border-white/10 hover:bg-red-50 dark:hover:bg-red-500/20 hover:border-red-200 dark:hover:border-red-500/30'
                                            : 'bg-emerald-500 text-white border border-emerald-600 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                                            }`}
                                    >
                                        {isTogglingStatus === admin.id ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : admin.status === 'active' ? (
                                            <> <Ban size={16} /> SUSPEND ACCESS </>
                                        ) : (
                                            <> <CheckCircle size={16} /> ACTIVATE </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Decorative blurred blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -ml-10 -mb-10"></div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const GlobeIcon = ({ active }: { active: boolean }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20" height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active ? "text-emerald-500" : "text-red-500"}
    >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
);

const ShieldAlert = ({ active }: { active: boolean }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active ? "text-emerald-500" : "text-red-500"}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
);

export default Settings;