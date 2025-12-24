import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, CheckCircle, Trash2, Ban, EyeOff, ChevronDown, ChevronUp, Facebook, Mail, Lock, X, Search } from 'lucide-react';
import { getApiBaseUrl } from '../../services/api';
import Sidebar from '../../components/admin/Sidebar';
import StatsCard from '../../components/admin/StatsCard';
import ActivityChart from '../../components/admin/ActivityChart';

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

interface Post {
    id: string;
    title: string;
    description: string;
    status: 'LOST' | 'FOUND' | 'RESOLVED';
    date: string;
    time?: string;
    images: string[];
    hidden: boolean;
    facebookStatus?: string;
    facebookPostId?: string;
    location: string;
    createdAt?: Date | string;
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
    const [metaSubTab, setMetaSubTab] = useState<'requests' | 'history'>('requests');
    const navigate = useNavigate();

    // Tracks tab filters and search
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'lost' | 'found' | 'resolved' | 'users'>('all');
    const [sortBy, setSortBy] = useState<'latest-activity' | 'creation-date-desc' | 'creation-date-asc' | 'name-asc' | 'name-desc'>('latest-activity');

    // Mock data for chart - in a real app, this would come from the backend API
    // We'll generate some data based on the stats we have
    const [chartData, setChartData] = useState<any[]>([]);

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

    // Generate mock chart data
    useEffect(() => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const mockData = days.map(day => ({
            name: day,
            lost: Math.floor(Math.random() * 15) + 5,
            found: Math.floor(Math.random() * 10) + 2,
            resolved: Math.floor(Math.random() * 8) + 1
        }));
        setChartData(mockData);
    }, []);

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
                fetch(`${getApiBaseUrl()}/admin/admins`, { headers }).catch(() => null)
            ]);

            if (statsRes.ok && usersRes.ok) {
                const statsData = await statsRes.json();
                const usersData = await usersRes.json();

                if (adminsRes && adminsRes.ok) {
                    const adminsData = await adminsRes.json();
                    setAdmins(adminsData);
                }

                try {
                    const token = localStorage.getItem('adminAccessToken');
                    if (token) {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        setCurrentUser({ userId: payload.userId, roles: payload.roles || [] });
                    }
                } catch (e) {
                    console.error('Error parsing token:', e);
                }

                setStats({
                    lost: statsData.lostItems,
                    found: statsData.foundItems,
                    resolved: statsData.resolvedItems,
                    users: statsData.totalUsers
                });
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

    // Filter and sort users for Tracks tab
    const getFilteredAndSortedUsers = () => {
        let filtered = [...users];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(detail => 
                detail.user.name.toLowerCase().includes(query) ||
                detail.user.email.toLowerCase().includes(query) ||
                detail.posts.some((post: Post) => 
                    post.title.toLowerCase().includes(query) ||
                    post.description.toLowerCase().includes(query)
                )
            );
        }

        // Apply status filter
        if (activeFilter === 'lost') {
            filtered = filtered.map(detail => ({
                ...detail,
                posts: detail.posts.filter((post: Post) => post.status === 'LOST')
            })).filter(detail => detail.posts.length > 0);
        } else if (activeFilter === 'found') {
            filtered = filtered.map(detail => ({
                ...detail,
                posts: detail.posts.filter((post: Post) => post.status === 'FOUND')
            })).filter(detail => detail.posts.length > 0);
        } else if (activeFilter === 'resolved') {
            filtered = filtered.map(detail => ({
                ...detail,
                posts: detail.posts.filter((post: Post) => post.status === 'RESOLVED')
            })).filter(detail => detail.posts.length > 0);
        } else if (activeFilter === 'users') {
            // Show all users regardless of posts
            filtered = filtered;
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'latest-activity':
                    if (!a.latestActivity && !b.latestActivity) return 0;
                    if (!a.latestActivity) return 1;
                    if (!b.latestActivity) return -1;
                    return new Date(b.latestActivity).getTime() - new Date(a.latestActivity).getTime();
                
                case 'creation-date-desc':
                    // Sort by latest post creation date, or user creation if no posts
                    const aLatestPost = a.posts.length > 0 && a.posts[0]?.createdAt 
                        ? new Date(a.posts[0].createdAt).getTime() 
                        : 0;
                    const bLatestPost = b.posts.length > 0 && b.posts[0]?.createdAt 
                        ? new Date(b.posts[0].createdAt).getTime() 
                        : 0;
                    return bLatestPost - aLatestPost;
                
                case 'creation-date-asc':
                    const aEarliestPost = a.posts.length > 0 && a.posts[0]?.createdAt 
                        ? new Date(a.posts[0].createdAt).getTime() 
                        : Date.now();
                    const bEarliestPost = b.posts.length > 0 && b.posts[0]?.createdAt 
                        ? new Date(b.posts[0].createdAt).getTime() 
                        : Date.now();
                    return aEarliestPost - bEarliestPost;
                
                case 'name-asc':
                    return (a.user.name || '').localeCompare(b.user.name || '');
                
                case 'name-desc':
                    return (b.user.name || '').localeCompare(a.user.name || '');
                
                default:
                    return 0;
            }
        });

        return filtered;
    };

    // Calculate filter counts
    const getFilterCounts = () => {
        const allPosts = users.flatMap(u => u.posts);
        return {
            lost: allPosts.filter((p: Post) => p.status === 'LOST').length,
            found: allPosts.filter((p: Post) => p.status === 'FOUND').length,
            resolved: allPosts.filter((p: Post) => p.status === 'RESOLVED').length,
            users: users.length
        };
    };

    if (loading) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="flex bg-[#0f0f0f] text-white min-h-screen">
            {/* Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto h-screen">
                {/* Header / Top Bar */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Hello, {currentUser?.roles?.includes('OWNER') ? 'Owner' : 'Admin'}!</h1>
                        <p className="text-gray-400 text-sm">Welcome back to Lost & Found Dashboard</p>
                    </div>
                </div>

                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="animate-fade-in space-y-6">
                        {/* Stats Cards */}
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatsCard
                                icon={<Package className="text-orange-500" />}
                                title="Lost Items"
                                value={stats.lost}
                                color="orange"
                            />
                            <StatsCard
                                icon={<CheckCircle className="text-blue-500" />}
                                title="Found Items"
                                value={stats.found}
                                color="blue"
                            />
                            <StatsCard
                                icon={<CheckCircle className="text-purple-500" />}
                                title="Resolved"
                                value={stats.resolved}
                                color="purple"
                            />
                            <StatsCard
                                icon={<Users className="text-green-500" />}
                                title="Total Users"
                                value={stats.users}
                                color="green"
                            />
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1">
                            <ActivityChart data={chartData} />
                        </div>
                    </div>
                )}

                {/* 2. TRACKS TAB (Old User Management) */}
                {activeTab === 'tracks' && (
                    <div className="animate-fade-in space-y-6">
                        {/* Filter Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <button
                                onClick={() => setActiveFilter(activeFilter === 'lost' ? 'all' : 'lost')}
                                className={`bg-[#1E1E1E] rounded-2xl p-6 border transition-all relative overflow-hidden group hover:border-gray-700 ${activeFilter === 'lost' ? 'border-orange-500/50 ring-2 ring-orange-500/20' : 'border-gray-800'}`}
                            >
                                <div className={`absolute bottom-0 left-0 h-1 w-1/3 bg-orange-500 rounded-tr-full`}></div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-4xl font-bold text-white">{getFilterCounts().lost}</div>
                                    <div className={`p-3 rounded-xl bg-orange-500 bg-opacity-10 text-orange-500`}>
                                        <Package size={24} />
                                    </div>
                                </div>
                                <h3 className="text-gray-400 text-sm font-medium">Lost Items</h3>
                            </button>
                            <button
                                onClick={() => setActiveFilter(activeFilter === 'found' ? 'all' : 'found')}
                                className={`bg-[#1E1E1E] rounded-2xl p-6 border transition-all relative overflow-hidden group hover:border-gray-700 ${activeFilter === 'found' ? 'border-blue-500/50 ring-2 ring-blue-500/20' : 'border-gray-800'}`}
                            >
                                <div className={`absolute bottom-0 left-0 h-1 w-1/3 bg-blue-500 rounded-tr-full`}></div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-4xl font-bold text-white">{getFilterCounts().found}</div>
                                    <div className={`p-3 rounded-xl bg-blue-500 bg-opacity-10 text-blue-500`}>
                                        <CheckCircle size={24} />
                                    </div>
                                </div>
                                <h3 className="text-gray-400 text-sm font-medium">Found Items</h3>
                            </button>
                            <button
                                onClick={() => setActiveFilter(activeFilter === 'resolved' ? 'all' : 'resolved')}
                                className={`bg-[#1E1E1E] rounded-2xl p-6 border transition-all relative overflow-hidden group hover:border-gray-700 ${activeFilter === 'resolved' ? 'border-purple-500/50 ring-2 ring-purple-500/20' : 'border-gray-800'}`}
                            >
                                <div className={`absolute bottom-0 left-0 h-1 w-1/3 bg-purple-500 rounded-tr-full`}></div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-4xl font-bold text-white">{getFilterCounts().resolved}</div>
                                    <div className={`p-3 rounded-xl bg-purple-500 bg-opacity-10 text-purple-500`}>
                                        <CheckCircle size={24} />
                                    </div>
                                </div>
                                <h3 className="text-gray-400 text-sm font-medium">Resolved</h3>
                            </button>
                            <button
                                onClick={() => setActiveFilter(activeFilter === 'users' ? 'all' : 'users')}
                                className={`bg-[#1E1E1E] rounded-2xl p-6 border transition-all relative overflow-hidden group hover:border-gray-700 ${activeFilter === 'users' ? 'border-green-500/50 ring-2 ring-green-500/20' : 'border-gray-800'}`}
                            >
                                <div className={`absolute bottom-0 left-0 h-1 w-1/3 bg-green-500 rounded-tr-full`}></div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-4xl font-bold text-white">{getFilterCounts().users}</div>
                                    <div className={`p-3 rounded-xl bg-green-500 bg-opacity-10 text-green-500`}>
                                        <Users size={24} />
                                    </div>
                                </div>
                                <h3 className="text-gray-400 text-sm font-medium">Total Users</h3>
                            </button>
                        </div>

                        {/* Search and Sort Bar */}
                        <div className="bg-[#1c1c1c] rounded-2xl border border-gray-800 p-6">
                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                {/* Search Bar */}
                                <div className="flex-1 w-full md:w-auto relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search users, emails, or posts..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                {/* Sort Dropdown */}
                                <div className="flex items-center gap-3">
                                    <label className="text-sm text-gray-400 whitespace-nowrap">Sort by:</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="px-4 py-2.5 bg-black/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 cursor-pointer"
                                    >
                                        <option value="latest-activity">Latest Activity</option>
                                        <option value="creation-date-desc">Creation Date (Newest First)</option>
                                        <option value="creation-date-asc">Creation Date (Oldest First)</option>
                                        <option value="name-asc">Name (A-Z)</option>
                                        <option value="name-desc">Name (Z-A)</option>
                                    </select>
                                </div>

                                {/* Clear Filters Button */}
                                {(searchQuery || activeFilter !== 'all') && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setActiveFilter('all');
                                        }}
                                        className="px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors whitespace-nowrap"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* User List */}
                        <div className="bg-[#1c1c1c] rounded-2xl border border-gray-800 overflow-hidden">
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                                <h2 className="text-xl font-bold">Tracks / User Management</h2>
                                <div className="text-sm text-gray-500">
                                    {getFilteredAndSortedUsers().length} {getFilteredAndSortedUsers().length === 1 ? 'user' : 'users'} found
                                </div>
                            </div>

                            <div className="divide-y divide-gray-800">
                                {getFilteredAndSortedUsers().length > 0 ? (
                                    getFilteredAndSortedUsers().map((detail) => (
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
                                    ))
                                ) : (
                                    <div className="p-12 text-center text-gray-500">
                                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>No users found matching your filters.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. META TAB */}
                {activeTab === 'meta' && (
                    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
                        {/* Left: Post Requests & History */}
                        <div className="bg-[#1c1c1c] rounded-2xl border border-gray-800 overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-800">
                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => {
                                            setMetaSubTab('requests');
                                            setSelectedPostForMeta(null);
                                        }}
                                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                                            metaSubTab === 'requests'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-800 text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        Post Requests
                                    </button>
                                    <button
                                        onClick={() => {
                                            setMetaSubTab('history');
                                            setSelectedPostForMeta(null);
                                        }}
                                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                                            metaSubTab === 'history'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-800 text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        Post History
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {metaSubTab === 'requests' 
                                        ? 'Review and approve Facebook post requests' 
                                        : 'View all published Facebook posts'}
                                </p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {metaSubTab === 'requests' ? (
                                    <>
                                        {users.flatMap(u => u.posts).filter(p => p.facebookStatus === 'PENDING').map(post => (
                                            <div
                                                key={post.id}
                                                onClick={() => setSelectedPostForMeta(post)}
                                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedPostForMeta?.id === post.id ? 'bg-blue-500/10 border-blue-500' : 'bg-[#2d2d2d] border-gray-700 hover:border-gray-500'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    {post.images?.[0] ? <img src={post.images[0]} className="w-12 h-12 rounded object-cover" /> : <div className="w-12 h-12 rounded bg-gray-600"></div>}
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-white">{post.title}</h4>
                                                        <p className="text-xs text-gray-400">{post.status} • {post.date}</p>
                                                        <span className="inline-block mt-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">Pending Approval</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {users.flatMap(u => u.posts).filter(p => p.facebookStatus === 'PENDING').length === 0 && (
                                            <div className="text-center text-gray-500 mt-10">No post requests found.</div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {users.flatMap(u => u.posts).filter(p => p.facebookStatus === 'POSTED').map(post => (
                                            <div
                                                key={post.id}
                                                onClick={() => setSelectedPostForMeta(post)}
                                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedPostForMeta?.id === post.id ? 'bg-blue-500/10 border-blue-500' : 'bg-[#2d2d2d] border-gray-700 hover:border-gray-500'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    {post.images?.[0] ? <img src={post.images[0]} className="w-12 h-12 rounded object-cover" /> : <div className="w-12 h-12 rounded bg-gray-600"></div>}
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-white">{post.title}</h4>
                                                        <p className="text-xs text-gray-400">{post.status} • {post.date}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="inline-block text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded flex items-center gap-1">
                                                                <Facebook size={10} />
                                                                Published
                                                            </span>
                                                            {post.facebookPostId && (
                                                                <span className="text-xs text-gray-500">ID: {post.facebookPostId}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {users.flatMap(u => u.posts).filter(p => p.facebookStatus === 'POSTED').length === 0 && (
                                            <div className="text-center text-gray-500 mt-10">No published posts found.</div>
                                        )}
                                    </>
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
                                    {selectedPostForMeta.facebookStatus === 'PENDING' && (
                                        <div className="p-6 border-t border-gray-800 bg-[#2d2d2d]">
                                            <button
                                                onClick={handleSubmitToFacebook}
                                                disabled={postingToFb[selectedPostForMeta.id]}
                                                className="w-full py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {postingToFb[selectedPostForMeta.id] ? 'Publishing...' : 'Approve & Publish to Facebook'}
                                            </button>
                                        </div>
                                    )}
                                    {selectedPostForMeta.facebookStatus === 'POSTED' && (
                                        <div className="p-6 border-t border-gray-800 bg-[#2d2d2d]">
                                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                                                <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                                                    <Facebook size={18} />
                                                    <span className="font-bold">Published to Facebook</span>
                                                </div>
                                                {selectedPostForMeta.facebookPostId && (
                                                    <p className="text-xs text-gray-400">Post ID: {selectedPostForMeta.facebookPostId}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                                    <Package size={48} className="mb-4 opacity-20" />
                                    <p>Select a post {metaSubTab === 'requests' ? 'request' : 'from history'} to edit and publish.</p>
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
                                const isTargetOwner = admin.roles?.includes('OWNER');
                                // Admins cannot edit owners, only owners can edit owners
                                const canEdit = isOwner || (isAdminRole && !isTargetOwner);

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
                                                {canEdit && (
                                                    <>
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
                                                    </>
                                                )}
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
                        <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                        <input name="name" required className="w-full bg-black/50 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input name="email" type="email" required className="w-full bg-black/50 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input name="password" type="password" required minLength={6} className="w-full bg-black/50 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors">
                        Create Admin
                    </button>
                </form>
            </div>
        </div>
    );
}

// Edit Email Modal
function EditEmailModal({ admin, currentEmail, onClose, onSubmit, onEmailChange }: any) {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1c1c1c] rounded-2xl w-full max-w-md border border-gray-800">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Change Email for {admin.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">New Email</label>
                        <input
                            type="email"
                            required
                            value={currentEmail}
                            onChange={(e) => onEmailChange(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors">
                        Update Email
                    </button>
                </form>
            </div>
        </div>
    );
}

// Change Password Modal
function ChangePasswordModal({ admin, onClose, onSubmit }: any) {
    const [password, setPassword] = useState('');
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(password);
        setPassword('');
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1c1c1c] rounded-2xl w-full max-w-md border border-gray-800">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Change Password for {admin.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg transition-colors">
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    );
}
