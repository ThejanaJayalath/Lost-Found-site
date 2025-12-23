import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, CheckCircle, Trash2, Ban, EyeOff, ChevronDown, ChevronUp, LogOut, Facebook, Mail, Lock, X } from 'lucide-react';
import Logo from '../../components/Logo';
import { getApiBaseUrl } from '../../services/api';

interface UserDetail {
    user: {
        id: string;
        name: string;
        email: string;
        photoUrl: string;
        authProvider: string;
        blocked: boolean;
    };
    posts: any[];
    postCount: number;
    latestActivity: string | null;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState({ lost: 0, found: 0, resolved: 0, users: 0 });
    const [users, setUsers] = useState<UserDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [postingToFb, setPostingToFb] = useState<{ [postId: string]: boolean }>({});

    // New State for Tabs and Meta
    const [activeTab, setActiveTab] = useState<'overview' | 'tracks' | 'meta' | 'roles'>('overview');
    const [admins, setAdmins] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null); // Current logged-in user
    const [selectedPostForMeta, setSelectedPostForMeta] = useState<any | null>(null);
    const [metaCaption, setMetaCaption] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('adminAccessToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchData();
    }, [navigate]);

    useEffect(() => {
        if (selectedPostForMeta) {
            // Generate default caption (Client-side approximation or empty)
            const defaultCaption = `🔴 ${selectedPostForMeta.status} ITEM ALERT\n\n📦 Item: ${selectedPostForMeta.title}\n📍 Location: ${selectedPostForMeta.location || 'Unknown'}\n📝 Description:\n${selectedPostForMeta.description}\n\n#LostAndFoundLK`;
            setMetaCaption(defaultCaption);
        }
    }, [selectedPostForMeta]);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('adminAccessToken');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    };

    const fetchData = async () => {
        try {
            console.log('Fetching admin data...');
            const headers = getAuthHeaders();
            const [statsRes, usersRes, adminsRes] = await Promise.all([
                fetch(`${getApiBaseUrl()}/admin/stats`, { headers }),
                fetch(`${getApiBaseUrl()}/admin/users`, { headers }),
                fetch(`${getApiBaseUrl()}/admin/admins`, { headers }).catch(() => null) // Optional, might fail if endpoint doesn't exist yet
            ]);

            console.log('Stats response status:', statsRes.status);
            console.log('Users response status:', usersRes.status);

            if (statsRes.ok && usersRes.ok) {
                const statsData = await statsRes.json();
                const usersData = await usersRes.json();
                
                // Fetch admins if endpoint is available
                if (adminsRes && adminsRes.ok) {
                    const adminsData = await adminsRes.json();
                    setAdmins(adminsData);
                }
                
                // Get current user info from token (decode JWT payload)
                try {
                    const token = localStorage.getItem('adminAccessToken');
                    if (token) {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        setCurrentUser({ userId: payload.userId, roles: payload.roles || [] });
                    }
                } catch (e) {
                    console.error('Error parsing token:', e);
                }

                setStats(statsData);
                setUsers(usersData);
            } else {
                console.error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
        navigate('/admin/login');
    };

    const toggleBlockUser = async (userId: string) => {
        try {
            const res = await fetch(`${getApiBaseUrl()}/admin/users/${userId}/block`, {
                method: 'PUT',
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                setUsers(users.map(u =>
                    u.user.id === userId ? { ...u, user: { ...u.user, blocked: !u.user.blocked } } : u
                ));
            }
        } catch (error) {
            console.error('Error blocking user:', error);
        }
    };

    const deleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            const res = await fetch(`${getApiBaseUrl()}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                setUsers(users.filter(u => u.user.id !== userId));
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const toggleHidePost = async (postId: string) => {
        try {
            const res = await fetch(`${getApiBaseUrl()}/admin/posts/${postId}/hide`, {
                method: 'PUT',
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                // Update local state deeply
                setUsers(users.map(u => ({
                    ...u,
                    posts: u.posts.map(p => p.id === postId ? { ...p, hidden: !p.hidden } : p)
                })));
            }
        } catch (error) {
            console.error('Error hiding post:', error);
        }
    };

    const deletePost = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            const res = await fetch(`${getApiBaseUrl()}/admin/posts/${postId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                setUsers(users.map(u => ({
                    ...u,
                    posts: u.posts.filter(p => p.id !== postId)
                })));
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleSendToMeta = (post: any) => {
        setSelectedPostForMeta(post);
        setActiveTab('meta');
    };

    const handleSubmitToFacebook = async () => {
        if (!selectedPostForMeta) return;
        const postId = selectedPostForMeta.id;

        if (!confirm('Confirm publish to Facebook Page?')) return;

        setPostingToFb(prev => ({ ...prev, [postId]: true }));
        try {
            const res = await fetch(`${getApiBaseUrl()}/admin/posts/${postId}/approve-facebook`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ caption: metaCaption })
            });
            const data = await res.json();

            if (res.ok) {
                alert('Success: ' + data.message);
                setUsers(users.map(u => ({
                    ...u,
                    posts: u.posts.map(p => p.id === postId ? { ...p, facebookStatus: 'POSTED', facebookPostId: data.id } : p)
                })));
                setSelectedPostForMeta(null); // Clear selection after success
            } else {
                alert('Error: ' + data.message);
                setUsers(users.map(u => ({
                    ...u,
                    posts: u.posts.map(p => p.id === postId ? { ...p, facebookStatus: 'FAILED' } : p)
                })));
            }
        } catch (error: any) {
            console.error('Error posting to FB:', error);
            alert('Network Error');
        } finally {
            setPostingToFb(prev => ({ ...prev, [postId]: false }));
        }
    };

    const fetchAdmins = async () => {
        try {
            const headers = getAuthHeaders();
            const res = await fetch(`${getApiBaseUrl()}/admin/admins`, { headers });
            if (res.ok) {
                const adminsData = await res.json();
                setAdmins(adminsData);
            }
        } catch (error) {
            console.error('Error fetching admins:', error);
        }
    };

    const handleAddAdmin = async (email: string, password: string, name: string) => {
        try {
            const headers = getAuthHeaders();
            const res = await fetch(`${getApiBaseUrl()}/admin/admins`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ email, password, name }),
            });
            const data = await res.json();
            if (res.ok) {
                alert('Admin created successfully');
                fetchAdmins();
                return true;
            } else {
                alert('Error: ' + data.message);
                return false;
            }
        } catch (error) {
            alert('Network error');
            return false;
        }
    };

    const handleChangeAdminEmail = async (adminId: string, newEmail: string) => {
        try {
            const headers = getAuthHeaders();
            const res = await fetch(`${getApiBaseUrl()}/admin/admins/${adminId}/email`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ email: newEmail }),
            });
            const data = await res.json();
            if (res.ok) {
                alert('Email updated successfully');
                fetchAdmins();
                return true;
            } else {
                alert('Error: ' + data.message);
                return false;
            }
        } catch (error) {
            alert('Network error');
            return false;
        }
    };

    const handleChangeAdminPassword = async (adminId: string, newPassword: string) => {
        try {
            const headers = getAuthHeaders();
            const res = await fetch(`${getApiBaseUrl()}/admin/admins/${adminId}/password`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                alert('Password updated successfully');
                fetchAdmins();
                return true;
            } else {
                alert('Error: ' + data.message);
                return false;
            }
        } catch (error) {
            alert('Network error');
            return false;
        }
    };

    const handleRemoveAdmin = async (adminId: string) => {
        if (!confirm('Are you sure you want to remove admin access? This user will become a regular user.')) {
            return;
        }
        try {
            const headers = getAuthHeaders();
            const res = await fetch(`${getApiBaseUrl()}/admin/admins/${adminId}`, {
                method: 'DELETE',
                headers,
            });
            const data = await res.json();
            if (res.ok) {
                alert('Admin access removed successfully');
                fetchAdmins();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            alert('Network error');
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            {/* Navbar */}
            <nav className="bg-[#1c1c1c] border-b border-gray-800 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Logo />
                    <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border border-blue-500/20">Admin</span>
                </div>

                {/* Tabs */}
                <div className="flex bg-black/20 p-1 rounded-lg border border-gray-800">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('tracks')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'tracks' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Tracks
                    </button>
                    <button
                        onClick={() => setActiveTab('meta')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'meta' ? 'bg-blue-900/20 text-blue-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        Meta
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('roles');
                            fetchAdmins();
                        }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'roles' ? 'bg-purple-900/20 text-purple-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        Roles
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                            <StatCard icon={<Package className="text-blue-400" />} label="Lost Items" value={stats.lost} color="blue" />
                            <StatCard icon={<CheckCircle className="text-green-400" />} label="Found Items" value={stats.found} color="green" />
                            <StatCard icon={<CheckCircle className="text-purple-400" />} label="Resolved" value={stats.resolved} color="purple" />
                            <StatCard icon={<Users className="text-orange-400" />} label="Total Users" value={stats.users} color="orange" />
                        </div>

                        {/* Simple Chart Visualization (CSS Bars) */}
                        <div className="bg-[#1c1c1c] p-8 rounded-2xl border border-gray-800">
                            <h3 className="text-lg font-bold mb-6 text-gray-300">Activity Distribution</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>Lost Items</span>
                                        <span>{stats.lost}</span>
                                    </div>
                                    <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(stats.lost / (stats.lost + stats.found + stats.resolved || 1)) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>Found Items</span>
                                        <span>{stats.found}</span>
                                    </div>
                                    <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${(stats.found / (stats.lost + stats.found + stats.resolved || 1)) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>Resolved</span>
                                        <span>{stats.resolved}</span>
                                    </div>
                                    <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(stats.resolved / (stats.lost + stats.found + stats.resolved || 1)) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. TRACKS TAB (Old User Management) */}
                {activeTab === 'tracks' && (
                    <div className="animate-fade-in">
                        <div className="bg-[#1c1c1c] rounded-2xl border border-gray-800 overflow-hidden">
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                                <h2 className="text-xl font-bold">Tracks / User Management</h2>
                                <div className="text-sm text-gray-500">Sorted by Latest Activity</div>
                            </div>

                            <div className="divide-y divide-gray-800">
                                {users.map((detail) => (
                                    <div key={detail.user.id} className="group hover:bg-white/5 transition-colors">
                                        <div className="p-6 flex items-center justify-between cursor-pointer" onClick={() => setExpandedUser(expandedUser === detail.user.id ? null : detail.user.id)}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${detail.user.blocked ? 'bg-red-900/20 text-red-500 border border-red-500/30' : 'bg-gray-700 text-white border border-gray-600'}`}>
                                                    {detail.user.photoUrl ? (
                                                        <img src={detail.user.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        detail.user.name ? detail.user.name.substring(0, 2).toUpperCase() : 'U'
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-lg">{detail.user.name || 'Unknown User'}</h3>
                                                        {detail.user.blocked && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">BLOCKED</span>}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                                        <span>{detail.user.email}</span>
                                                        <span>•</span>
                                                        <span>{detail.postCount} Posts</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right text-sm text-gray-500 mr-4">
                                                    <div>Latest Activity</div>
                                                    <div>{detail.latestActivity || 'Never'}</div>
                                                </div>
                                                {expandedUser === detail.user.id ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {expandedUser === detail.user.id && (
                                            <div className="px-6 pb-6 pl-20 bg-black/20 border-t border-gray-800/50">
                                                <div className="py-4 flex gap-3 mb-4 border-b border-gray-800/50">
                                                    <button onClick={() => toggleBlockUser(detail.user.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${detail.user.blocked ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'}`}>
                                                        <Ban size={16} /> {detail.user.blocked ? 'Unblock' : 'Block'}
                                                    </button>
                                                    <button onClick={() => deleteUser(detail.user.id)} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2">
                                                        <Trash2 size={16} /> Delete
                                                    </button>
                                                </div>

                                                <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">User Posts</h4>
                                                {detail.posts.length > 0 ? (
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {detail.posts.map(post => (
                                                            <div key={post.id} className={`bg-[#2d2d2d] rounded-lg p-4 flex items-center justify-between border ${post.hidden ? 'border-red-500/30 opacity-60' : 'border-gray-700'}`}>
                                                                <div className="flex items-center gap-4">
                                                                    {post.images && post.images.length > 0 ? (
                                                                        <img src={post.images[0]} alt="" className="w-16 h-16 rounded-md object-cover bg-black" />
                                                                    ) : (
                                                                        <div className="w-16 h-16 rounded-md bg-gray-800 flex items-center justify-center text-gray-600">No Img</div>
                                                                    )}
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <h5 className="font-bold text-white">{post.title}</h5>
                                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${post.status === 'LOST' ? 'bg-red-500/20 text-red-400' : post.status === 'FOUND' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{post.status}</span>
                                                                            {post.facebookStatus === 'POSTED' && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1"><Facebook size={10} /> Published</span>}
                                                                        </div>
                                                                        <p className="text-sm text-gray-400 line-clamp-1">{post.description}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleSendToMeta(post)}
                                                                        disabled={post.facebookStatus === 'POSTED'}
                                                                        className={`p-2 rounded-lg transition-colors ${post.facebookStatus === 'POSTED' ? 'text-gray-600 cursor-not-allowed' : 'text-blue-400 hover:bg-blue-500/20'}`}
                                                                        title="Review for Facebook"
                                                                    >
                                                                        <Facebook size={18} />
                                                                    </button>
                                                                    <button onClick={() => toggleHidePost(post.id)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400" title="Hide/Unhide"><EyeOff size={18} /></button>
                                                                    <button onClick={() => deletePost(post.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400" title="Delete"><Trash2 size={18} /></button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <p className="text-gray-500">No posts.</p>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. META TAB */}
                {activeTab === 'meta' && (
                    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
                        {/* Left: Pending List */}
                        <div className="bg-[#1c1c1c] rounded-2xl border border-gray-800 overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-800">
                                <h2 className="text-xl font-bold">Meta Publishing Queue</h2>
                                <p className="text-sm text-gray-500">Select an item to edit and publish</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {users.flatMap(u => u.posts).filter(p => p.facebookStatus !== 'POSTED').map(post => (
                                    <div
                                        key={post.id}
                                        onClick={() => setSelectedPostForMeta(post)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedPostForMeta?.id === post.id ? 'bg-blue-500/10 border-blue-500' : 'bg-[#2d2d2d] border-gray-700 hover:border-gray-500'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {post.images?.[0] ? <img src={post.images[0]} className="w-12 h-12 rounded object-cover" /> : <div className="w-12 h-12 rounded bg-gray-600"></div>}
                                            <div>
                                                <h4 className="font-bold text-white">{post.title}</h4>
                                                <p className="text-xs text-gray-400">{post.status} • {post.date}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {users.flatMap(u => u.posts).filter(p => p.facebookStatus !== 'POSTED').length === 0 && (
                                    <div className="text-center text-gray-500 mt-10">No pending posts found.</div>
                                )}
                            </div>
                        </div>

                        {/* Right: Editor Preview */}
                        <div className="bg-[#1c1c1c] rounded-2xl border border-gray-800 flex flex-col overflow-hidden">
                            {selectedPostForMeta ? (
                                <>
                                    <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#2d2d2d]">
                                        <h3 className="font-bold">Post Preview</h3>
                                        <div className="flex items-center gap-2 text-blue-400 text-sm">
                                            <Facebook size={16} />
                                            Target: Lost & Found LK Page
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                        {/* Image Preview */}
                                        <div className="aspect-video bg-black rounded-lg flex items-center justify-center overflow-hidden border border-gray-800">
                                            {selectedPostForMeta.images?.[0] ? (
                                                <img src={selectedPostForMeta.images[0]} className="h-full w-full object-contain" />
                                            ) : (
                                                <span className="text-gray-500">No Image Available</span>
                                            )}
                                        </div>

                                        {/* Caption Editor */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Caption</label>
                                            <textarea
                                                value={metaCaption}
                                                onChange={(e) => setMetaCaption(e.target.value)}
                                                className="w-full h-48 bg-black/50 border border-gray-700 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-mono"
                                            />
                                            <p className="text-xs text-gray-500 mt-2 text-right">{metaCaption.length} characters</p>
                                        </div>
                                    </div>
                                    <div className="p-6 border-t border-gray-800 bg-[#2d2d2d]">
                                        <button
                                            onClick={handleSubmitToFacebook}
                                            disabled={postingToFb[selectedPostForMeta.id]}
                                            className="w-full py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {postingToFb[selectedPostForMeta.id] ? 'Publishing...' : 'Publish to Facebook Now'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                                    <Package size={48} className="mb-4 opacity-20" />
                                    <p>Select a post from the queue to edit and publish.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 4. ROLES TAB */}
                {activeTab === 'roles' && (
                    <RolesTab
                        admins={admins}
                        currentUser={currentUser}
                        onAddAdmin={handleAddAdmin}
                        onChangeEmail={handleChangeAdminEmail}
                        onChangePassword={handleChangeAdminPassword}
                        onRemoveAdmin={handleRemoveAdmin}
                    />
                )}
            </div>
        </div>
    );
}

// Roles Tab Component
function RolesTab({ admins, currentUser, onAddAdmin, onChangeEmail, onChangePassword, onRemoveAdmin }: any) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditEmailModal, setShowEditEmailModal] = useState<any>(null);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState<any>(null);
    const [newEmail, setNewEmail] = useState('');

    const isOwner = currentUser?.roles?.includes('OWNER');

    const handleAddAdminSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const name = formData.get('name') as string;

        const success = await onAddAdmin(email, password, name);
        if (success) {
            setShowAddModal(false);
            (e.target as HTMLFormElement).reset();
        }
    };

    const handleEditEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!showEditEmailModal) return;
        const success = await onChangeEmail(showEditEmailModal.id, newEmail);
        if (success) {
            setShowEditEmailModal(null);
            setNewEmail('');
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Admin Management</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                    <Users size={18} />
                    Add New Admin
                </button>
            </div>

            <div className="bg-[#1c1c1c] rounded-2xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#2d2d2d] border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Created</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {admins.map((admin: any) => {
                                const isCurrentUser = currentUser?.userId === admin.id;
                                const isAdminRole = admin.roles?.includes('ADMIN') && !admin.roles?.includes('OWNER');
                                
                                return (
                                    <tr key={admin.id} className="hover:bg-[#2d2d2d]/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-white">{admin.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{admin.name}</td>
                                        <td className="px-6 py-4 text-sm">
                                            {admin.roles?.includes('OWNER') ? (
                                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold">OWNER</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold">ADMIN</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(admin.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setShowEditEmailModal(admin);
                                                        setNewEmail(admin.email);
                                                    }}
                                                    className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                                                    title="Change Email"
                                                >
                                                    <Mail size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowChangePasswordModal(admin);
                                                    }}
                                                    className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 transition-colors"
                                                    title="Change Password"
                                                >
                                                    <Lock size={16} />
                                                </button>
                                                {isOwner && isAdminRole && !isCurrentUser && (
                                                    <button
                                                        onClick={() => onRemoveAdmin(admin.id)}
                                                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                                                        title="Remove Admin"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {admins.length === 0 && (
                        <div className="p-12 text-center text-gray-500">No admins found.</div>
                    )}
                </div>
            </div>

            {/* Add Admin Modal */}
            {showAddModal && (
                <AddAdminModal
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAddAdminSubmit}
                />
            )}

            {/* Edit Email Modal */}
            {showEditEmailModal && (
                <EditEmailModal
                    admin={showEditEmailModal}
                    currentEmail={newEmail}
                    onClose={() => {
                        setShowEditEmailModal(null);
                        setNewEmail('');
                    }}
                    onSubmit={handleEditEmailSubmit}
                    onEmailChange={setNewEmail}
                />
            )}

            {/* Change Password Modal */}
            {showChangePasswordModal && (
                <ChangePasswordModal
                    admin={showChangePasswordModal}
                    onClose={() => {
                        setShowChangePasswordModal(null);
                    }}
                    onSubmit={async (password: string) => {
                        const success = await onChangePassword(showChangePasswordModal.id, password);
                        if (success) {
                            setShowChangePasswordModal(null);
                        }
                        return success;
                    }}
                />
            )}
        </div>
    );
}

// Add Admin Modal Component
function AddAdminModal({ onClose, onSubmit }: any) {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1c1c1c] rounded-2xl w-full max-w-md border border-gray-800">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Add New Admin</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full p-3 bg-[#2d2d2d] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            placeholder="admin@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            minLength={6}
                            className="w-full p-3 bg-[#2d2d2d] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            placeholder="Minimum 6 characters"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Name (Optional)</label>
                        <input
                            type="text"
                            name="name"
                            className="w-full p-3 bg-[#2d2d2d] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            placeholder="Admin Name"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                            Create Admin
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Edit Email Modal Component
function EditEmailModal({ admin, currentEmail, onClose, onSubmit, onEmailChange }: any) {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1c1c1c] rounded-2xl w-full max-w-md border border-gray-800">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Change Email</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Current Email</label>
                        <input
                            type="email"
                            value={admin.email}
                            disabled
                            className="w-full p-3 bg-[#2d2d2d] border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">New Email</label>
                        <input
                            type="email"
                            value={currentEmail}
                            onChange={(e) => onEmailChange(e.target.value)}
                            required
                            className="w-full p-3 bg-[#2d2d2d] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="new@example.com"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                        >
                            Update Email
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Change Password Modal Component
function ChangePasswordModal({ admin, onClose, onSubmit }: any) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        
        await onSubmit(password);
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1c1c1c] rounded-2xl w-full max-w-md border border-gray-800">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Change Password</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Admin</label>
                        <input
                            type="text"
                            value={`${admin.name} (${admin.email})`}
                            disabled
                            className="w-full p-3 bg-[#2d2d2d] border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full p-3 bg-[#2d2d2d] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="Minimum 6 characters"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full p-3 bg-[#2d2d2d] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="Confirm new password"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                        >
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
    return (
        <div className="bg-[#1c1c1c] p-6 rounded-2xl border border-gray-800 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-bl-full transition-transform group-hover:scale-110`}></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-${color}-500/10`}>
                        {icon}
                    </div>
                    <span className="text-gray-400 font-medium">{label}</span>
                </div>
                <div className="text-3xl font-bold text-white">{value}</div>
            </div>
        </div>
    );
}
