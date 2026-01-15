import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, CheckCircle, Trash2, Ban, EyeOff, ChevronDown, ChevronUp, Facebook, Mail, Lock, X, Search, MessageSquare, Wrench } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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
    const [activeTab, setActiveTab] = useState<'overview' | 'tracks' | 'meta' | 'roles' | 'messages' | 'maintenance'>('overview');
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

    // Support Messages state
    const [supportMessages, setSupportMessages] = useState<any[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('adminAccessToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchData();
    }, [navigate]);

    // Fetch support messages when Messages tab is active
    useEffect(() => {
        if (activeTab === 'messages') {
            fetchSupportMessages();
        }
    }, [activeTab]);

    const fetchSupportMessages = async () => {
        setMessagesLoading(true);
        try {
            const headers = getAuthHeaders();
            const response = await fetch(`${getApiBaseUrl()}/admin/support`, { headers });
            
            if (response.ok) {
                const data = await response.json();
                setSupportMessages(data);
            } else {
                console.error('Failed to fetch support messages');
            }
        } catch (error) {
            console.error('Error fetching support messages:', error);
        } finally {
            setMessagesLoading(false);
        }
    };

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
        <div className="flex flex-col md:flex-row bg-[#0f0f0f] text-white min-h-screen">
            {/* Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />

            {/* Main Content */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto min-h-screen md:h-screen md:ml-0">
                {/* Header / Top Bar */}
                <div className="flex justify-between items-center mb-6 md:mb-8 mt-12 md:mt-0">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold">Hello, {currentUser?.roles?.includes('OWNER') ? 'Owner' : 'Admin'}!</h1>
                        <p className="text-gray-400 text-xs md:text-sm">Welcome back to Lost & Found Dashboard</p>
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

                        {/* Post Status Overview */}
                        <div className="bg-[#1c1c1c] rounded-2xl border border-gray-800 p-4 md:p-6">
                            <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Post Status Overview</h2>
                            {(() => {
                                const pendingCount = users.flatMap(u => u.posts).filter(p => p.facebookStatus === 'PENDING').length;
                                const postedCount = users.flatMap(u => u.posts).filter(p => p.facebookStatus === 'POSTED').length;
                                const failedCount = users.flatMap(u => u.posts).filter(p => p.facebookStatus === 'FAILED').length;
                                const total = pendingCount + postedCount + failedCount;

                                const chartData = [
                                    { name: 'Pending', value: pendingCount, color: '#EAB308', icon: Package },
                                    { name: 'Posted', value: postedCount, color: '#22C55E', icon: CheckCircle },
                                    { name: 'Failed', value: failedCount, color: '#EF4444', icon: X },
                                ].filter(item => item.value > 0);

                                const CustomTooltip = ({ active, payload }: any) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0];
                                        const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
                                        return (
                                            <div className="bg-[#2d2d2d] border border-gray-700 p-3 md:p-4 rounded-xl shadow-xl">
                                                <p className="text-white font-semibold text-sm md:text-base mb-2">{data.name}</p>
                                                <p className="text-gray-300 text-xs md:text-sm">Count: <span className="font-bold" style={{ color: data.payload.fill }}>{data.value}</span></p>
                                                <p className="text-gray-400 text-xs">Percentage: {percentage}%</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                };

                                const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
                                    const RADIAN = Math.PI / 180;
                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                    if (percent < 0.05) return null; // Don't show label if slice is too small

                                    return (
                                        <text
                                            x={x}
                                            y={y}
                                            fill="white"
                                            textAnchor={x > cx ? 'start' : 'end'}
                                            dominantBaseline="central"
                                            className="text-xs md:text-sm font-semibold"
                                        >
                                            {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                    );
                                };

                                if (total === 0) {
                                    return (
                                        <div className="flex flex-col items-center justify-center py-12 md:py-16">
                                            <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mb-4" />
                                            <p className="text-gray-500 text-sm md:text-base">No posts with Facebook status yet</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                                        {/* Donut Chart */}
                                        <div className="w-full md:w-1/2 max-w-md">
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <defs>
                                                        <linearGradient id="gradientPending" x1="0" y1="0" x2="1" y2="1">
                                                            <stop offset="0%" stopColor="#FCD34D" stopOpacity={1} />
                                                            <stop offset="100%" stopColor="#EAB308" stopOpacity={1} />
                                                        </linearGradient>
                                                        <linearGradient id="gradientPosted" x1="0" y1="0" x2="1" y2="1">
                                                            <stop offset="0%" stopColor="#4ADE80" stopOpacity={1} />
                                                            <stop offset="100%" stopColor="#22C55E" stopOpacity={1} />
                                                        </linearGradient>
                                                        <linearGradient id="gradientFailed" x1="0" y1="0" x2="1" y2="1">
                                                            <stop offset="0%" stopColor="#F87171" stopOpacity={1} />
                                                            <stop offset="100%" stopColor="#EF4444" stopOpacity={1} />
                                                        </linearGradient>
                                                    </defs>
                                                    <Pie
                                                        data={chartData}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={CustomLabel}
                                                        outerRadius={100}
                                                        innerRadius={60}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                        stroke="#0f0f0f"
                                                        strokeWidth={3}
                                                    >
                                                        {chartData.map((entry) => {
                                                            const gradientId = entry.name === 'Pending' ? 'gradientPending' : entry.name === 'Posted' ? 'gradientPosted' : 'gradientFailed';
                                                            return (
                                                                <Cell key={`cell-${entry.name}`} fill={`url(#${gradientId})`} />
                                                            );
                                                        })}
                                                    </Pie>
                                                    <Tooltip content={<CustomTooltip />} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* Legend with Stats */}
                                        <div className="w-full md:w-1/2 space-y-4">
                                            {chartData.map((item) => {
                                                const Icon = item.icon;
                                                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                                                return (
                                                    <div
                                                        key={item.name}
                                                        className="bg-[#2d2d2d] rounded-xl border border-gray-700 p-4 md:p-5 hover:border-opacity-50 transition-all"
                                                        style={{ borderColor: `${item.color}40` }}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3 md:gap-4">
                                                                <div
                                                                    className="p-2 md:p-3 rounded-lg flex-shrink-0"
                                                                    style={{ backgroundColor: `${item.color}20` }}
                                                                >
                                                                    <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: item.color }} />
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-sm md:text-base font-semibold text-gray-300">{item.name}</h3>
                                                                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                                                                        {item.name === 'Pending' && 'Awaiting approval'}
                                                                        {item.name === 'Posted' && 'Published to Facebook'}
                                                                        {item.name === 'Failed' && 'Posting failed'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-xl md:text-2xl font-bold" style={{ color: item.color }}>
                                                                    {item.value}
                                                                </div>
                                                                <div className="text-xs md:text-sm text-gray-500 mt-1">{percentage}%</div>
                                                            </div>
                                                        </div>
                                                        {/* Progress Bar */}
                                                        <div className="mt-3 md:mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full transition-all duration-500"
                                                                style={{
                                                                    width: `${percentage}%`,
                                                                    backgroundColor: item.color,
                                                                    boxShadow: `0 0 10px ${item.color}40`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}
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
                                className={`bg-[#1E1E1E] rounded-2xl p-4 md:p-6 border transition-all relative overflow-hidden group hover:border-gray-700 ${activeFilter === 'lost' ? 'border-orange-500/50 ring-2 ring-orange-500/20' : 'border-gray-800'}`}
                            >
                                <div className={`absolute bottom-0 left-0 h-1 w-1/3 bg-orange-500 rounded-tr-full`}></div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-3xl md:text-4xl font-bold text-white">{getFilterCounts().lost}</div>
                                    <div className={`p-2 md:p-3 rounded-xl bg-orange-500 bg-opacity-10 text-orange-500`}>
                                        <Package size={20} className="md:w-6 md:h-6" />
                                    </div>
                                </div>
                                <h3 className="text-gray-400 text-xs md:text-sm font-medium">Lost Items</h3>
                            </button>
                            <button
                                onClick={() => setActiveFilter(activeFilter === 'found' ? 'all' : 'found')}
                                className={`bg-[#1E1E1E] rounded-2xl p-4 md:p-6 border transition-all relative overflow-hidden group hover:border-gray-700 ${activeFilter === 'found' ? 'border-blue-500/50 ring-2 ring-blue-500/20' : 'border-gray-800'}`}
                            >
                                <div className={`absolute bottom-0 left-0 h-1 w-1/3 bg-blue-500 rounded-tr-full`}></div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-3xl md:text-4xl font-bold text-white">{getFilterCounts().found}</div>
                                    <div className={`p-2 md:p-3 rounded-xl bg-blue-500 bg-opacity-10 text-blue-500`}>
                                        <CheckCircle size={20} className="md:w-6 md:h-6" />
                                    </div>
                                </div>
                                <h3 className="text-gray-400 text-xs md:text-sm font-medium">Found Items</h3>
                            </button>
                            <button
                                onClick={() => setActiveFilter(activeFilter === 'resolved' ? 'all' : 'resolved')}
                                className={`bg-[#1E1E1E] rounded-2xl p-4 md:p-6 border transition-all relative overflow-hidden group hover:border-gray-700 ${activeFilter === 'resolved' ? 'border-purple-500/50 ring-2 ring-purple-500/20' : 'border-gray-800'}`}
                            >
                                <div className={`absolute bottom-0 left-0 h-1 w-1/3 bg-purple-500 rounded-tr-full`}></div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-3xl md:text-4xl font-bold text-white">{getFilterCounts().resolved}</div>
                                    <div className={`p-2 md:p-3 rounded-xl bg-purple-500 bg-opacity-10 text-purple-500`}>
                                        <CheckCircle size={20} className="md:w-6 md:h-6" />
                                    </div>
                                </div>
                                <h3 className="text-gray-400 text-xs md:text-sm font-medium">Resolved</h3>
                            </button>
                            <button
                                onClick={() => setActiveFilter(activeFilter === 'users' ? 'all' : 'users')}
                                className={`bg-[#1E1E1E] rounded-2xl p-4 md:p-6 border transition-all relative overflow-hidden group hover:border-gray-700 ${activeFilter === 'users' ? 'border-green-500/50 ring-2 ring-green-500/20' : 'border-gray-800'}`}
                            >
                                <div className={`absolute bottom-0 left-0 h-1 w-1/3 bg-green-500 rounded-tr-full`}></div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-3xl md:text-4xl font-bold text-white">{getFilterCounts().users}</div>
                                    <div className={`p-2 md:p-3 rounded-xl bg-green-500 bg-opacity-10 text-green-500`}>
                                        <Users size={20} className="md:w-6 md:h-6" />
                                    </div>
                                </div>
                                <h3 className="text-gray-400 text-xs md:text-sm font-medium">Total Users</h3>
                            </button>
                        </div>

                        {/* Search and Sort Bar */}
                        <div className="bg-[#1c1c1c] rounded-2xl border border-gray-800 p-4 md:p-6">
                            <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
                                {/* Search Bar */}
                                <div className="flex-1 w-full relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search users, emails, or posts..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 md:py-2.5 bg-black/50 border border-gray-700 rounded-lg text-white text-sm md:text-base placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                {/* Sort Dropdown */}
                                <div className="flex items-center gap-2 md:gap-3">
                                    <label className="text-xs md:text-sm text-gray-400 whitespace-nowrap">Sort by:</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="flex-1 md:flex-none px-3 md:px-4 py-2 md:py-2.5 bg-black/50 border border-gray-700 rounded-lg text-white text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 cursor-pointer"
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
                            <div className="p-4 md:p-6 border-b border-gray-800 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                                <h2 className="text-lg md:text-xl font-bold">Tracks / User Management</h2>
                                <div className="text-xs md:text-sm text-gray-500">
                                    {getFilteredAndSortedUsers().length} {getFilteredAndSortedUsers().length === 1 ? 'user' : 'users'} found
                                </div>
                            </div>

                            <div className="divide-y divide-gray-800">
                                {getFilteredAndSortedUsers().length > 0 ? (
                                    getFilteredAndSortedUsers().map((detail) => (
                                    <div key={detail.user.id} className="group hover:bg-white/5 transition-colors">
                                        <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 cursor-pointer" onClick={() => setExpandedUser(expandedUser === detail.user.id ? null : detail.user.id)}>
                                            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-base md:text-lg font-bold flex-shrink-0 ${detail.user.blocked ? 'bg-red-900/20 text-red-500 border border-red-500/30' : 'bg-gray-700 text-white border border-gray-600'}`}>
                                                    {detail.user.photoUrl ? (
                                                        <img src={detail.user.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        detail.user.name ? detail.user.name.substring(0, 2).toUpperCase() : 'U'
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-base md:text-lg truncate">{detail.user.name || 'Unknown User'}</h3>
                                                        {detail.user.blocked && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">BLOCKED</span>}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400">
                                                        <span className="truncate">{detail.user.email}</span>
                                                        <span className="hidden md:inline">•</span>
                                                        <span>{detail.postCount} Posts</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between md:justify-end gap-4">
                                                <div className="text-left md:text-right text-xs md:text-sm text-gray-500">
                                                    <div className="hidden md:block">Latest Activity</div>
                                                    <div>{detail.latestActivity || 'Never'}</div>
                                                </div>
                                                {expandedUser === detail.user.id ? <ChevronUp size={20} className="text-gray-500 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-500 flex-shrink-0" />}
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {expandedUser === detail.user.id && (
                                            <div className="px-4 md:px-6 pb-4 md:pb-6 pl-4 md:pl-20 bg-black/20 border-t border-gray-800/50">
                                                <div className="py-4 flex flex-wrap gap-2 md:gap-3 mb-4 border-b border-gray-800/50">
                                                    <button onClick={() => toggleBlockUser(detail.user.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${detail.user.blocked ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'}`}>
                                                        <Ban size={16} /> {detail.user.blocked ? 'Unblock' : 'Block'}
                                                    </button>
                                                    <button onClick={() => deleteUser(detail.user.id)} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2">
                                                        <Trash2 size={16} /> Delete
                                                    </button>
                                                </div>

                                                <h4 className="text-xs md:text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">User Posts</h4>
                                                {detail.posts.length > 0 ? (
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {detail.posts.map(post => (
                                                            <div key={post.id} className={`bg-[#2d2d2d] rounded-lg p-3 md:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border ${post.hidden ? 'border-red-500/30 opacity-60' : 'border-gray-700'}`}>
                                                                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                                                    {post.images && post.images.length > 0 ? (
                                                                        <img src={post.images[0]} alt="" className="w-12 h-12 md:w-16 md:h-16 rounded-md object-cover bg-black flex-shrink-0" />
                                                                    ) : (
                                                                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-md bg-gray-800 flex items-center justify-center text-gray-600 text-xs flex-shrink-0">No Img</div>
                                                                    )}
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                            <h5 className="font-bold text-white text-sm md:text-base truncate">{post.title}</h5>
                                                                            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${post.status === 'LOST' ? 'bg-red-500/20 text-red-400' : post.status === 'FOUND' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{post.status}</span>
                                                                            {post.facebookStatus === 'POSTED' && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0"><Facebook size={10} /> Published</span>}
                                                                        </div>
                                                                        <p className="text-xs md:text-sm text-gray-400 line-clamp-1">{post.description}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2 justify-end md:justify-start">
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
                    <div className="animate-fade-in flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-8 min-h-[calc(100vh-200px)] md:h-[calc(100vh-140px)]">
                        {/* Left: Post Requests & History */}
                        <div className="bg-[#1c1c1c] rounded-2xl border border-gray-800 overflow-hidden flex flex-col min-h-[400px] md:min-h-0">
                            <div className="p-4 md:p-6 border-b border-gray-800">
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
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    {post.images?.[0] ? <img src={post.images[0]} className="w-10 h-10 md:w-12 md:h-12 rounded object-cover flex-shrink-0" /> : <div className="w-10 h-10 md:w-12 md:h-12 rounded bg-gray-600 flex-shrink-0"></div>}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-white text-sm md:text-base truncate">{post.title}</h4>
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
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    {post.images?.[0] ? <img src={post.images[0]} className="w-10 h-10 md:w-12 md:h-12 rounded object-cover flex-shrink-0" /> : <div className="w-10 h-10 md:w-12 md:h-12 rounded bg-gray-600 flex-shrink-0"></div>}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-white text-sm md:text-base truncate">{post.title}</h4>
                                                        <p className="text-xs text-gray-400">{post.status} • {post.date}</p>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                                            <span className="inline-block text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded flex items-center gap-1">
                                                                <Facebook size={10} />
                                                                Published
                                                            </span>
                                                            {post.facebookPostId && (
                                                                <span className="text-xs text-gray-500 truncate">ID: {post.facebookPostId}</span>
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
                        <div className="bg-[#1c1c1c] rounded-2xl border border-gray-800 flex flex-col overflow-hidden min-h-[500px] md:min-h-0">
                            {selectedPostForMeta ? (
                                <>
                                            <div className="p-4 md:p-6 border-b border-gray-800 flex flex-col md:flex-row md:justify-between md:items-center gap-2 bg-[#2d2d2d]">
                                                <h3 className="font-bold text-sm md:text-base">Post Preview</h3>
                                                <div className="flex items-center gap-2 text-blue-400 text-xs md:text-sm">
                                                    <Facebook size={14} />
                                                    Target: Lost & Found LK Page
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
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
                                        <div className="p-4 md:p-6 border-t border-gray-800 bg-[#2d2d2d]">
                                            <button
                                                onClick={handleSubmitToFacebook}
                                                disabled={postingToFb[selectedPostForMeta.id]}
                                                className="w-full py-2.5 md:py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl font-bold text-sm md:text-base transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {postingToFb[selectedPostForMeta.id] ? 'Publishing...' : 'Approve & Publish to Facebook'}
                                            </button>
                                        </div>
                                    )}
                                    {selectedPostForMeta.facebookStatus === 'POSTED' && (
                                        <div className="p-4 md:p-6 border-t border-gray-800 bg-[#2d2d2d]">
                                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 md:p-4 text-center">
                                                <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                                                    <Facebook size={16} />
                                                    <span className="font-bold text-sm md:text-base">Published to Facebook</span>
                                                </div>
                                                {selectedPostForMeta.facebookPostId && (
                                                    <p className="text-xs text-gray-400 break-all">Post ID: {selectedPostForMeta.facebookPostId}</p>
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

                {/* 5. MESSAGES TAB */}
                {activeTab === 'messages' && (
                    <div className="animate-fade-in">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-2">Support Messages</h2>
                            <p className="text-gray-400 text-sm">View and manage customer support messages</p>
                        </div>

                        {messagesLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-gray-400">Loading messages...</div>
                            </div>
                        ) : supportMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <MessageSquare size={48} className="mb-4 opacity-20" />
                                <p>No support messages yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Messages List */}
                                <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                                    {supportMessages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            onClick={() => setSelectedMessage(msg)}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                                selectedMessage?.id === msg.id
                                                    ? 'bg-orange-500/10 border-orange-500/50'
                                                    : 'bg-[#1E1E1E] border-gray-800 hover:border-gray-700'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-semibold text-white text-sm truncate">{msg.name}</h3>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    msg.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                                                    msg.status === 'replied' ? 'bg-green-500/20 text-green-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                    {msg.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-xs mb-2 truncate">{msg.subject}</p>
                                            <p className="text-gray-500 text-xs">{new Date(msg.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Message Detail */}
                                <div className="lg:col-span-2">
                                    {selectedMessage ? (
                                        <div className="bg-[#1E1E1E] rounded-lg border border-gray-800 p-6">
                                            <div className="flex items-start justify-between mb-6">
                                                <div>
                                                    <h3 className="text-xl font-bold mb-2">{selectedMessage.subject}</h3>
                                                    <div className="space-y-1 text-sm text-gray-400">
                                                        <p><strong className="text-white">From:</strong> {selectedMessage.name}</p>
                                                        <p><strong className="text-white">Email:</strong> <a href={`mailto:${selectedMessage.email}`} className="text-cyan-400 hover:underline">{selectedMessage.email}</a></p>
                                                        <p><strong className="text-white">Date:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}</p>
                                                        <p><strong className="text-white">Status:</strong> <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                            selectedMessage.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                                                            selectedMessage.status === 'replied' ? 'bg-green-500/20 text-green-400' :
                                                            'bg-gray-500/20 text-gray-400'
                                                        }`}>{selectedMessage.status}</span></p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedMessage(null)}
                                                    className="text-gray-400 hover:text-white"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                            <div className="border-t border-gray-800 pt-6">
                                                <h4 className="font-semibold mb-3 text-white">Message:</h4>
                                                <div className="bg-[#2d2d2d] rounded-lg p-4 text-gray-300 whitespace-pre-wrap">
                                                    {selectedMessage.message}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-[#1E1E1E] rounded-lg border border-gray-800">
                                            <MessageSquare size={48} className="mb-4 opacity-20" />
                                            <p>Select a message to view details</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 6. MAINTENANCE TAB */}
                {activeTab === 'maintenance' && (
                    <div className="animate-fade-in">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-2">Maintenance</h2>
                            <p className="text-gray-400 text-sm">System maintenance and configuration tools</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Maintenance Card 1 */}
                            <div className="bg-[#1c1c1c] rounded-2xl border border-gray-800 p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-orange-500/10 rounded-lg">
                                        <Wrench className="text-orange-400" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">System Status</h3>
                                        <p className="text-sm text-gray-400">Check system health</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-sm">Database</span>
                                        <span className="text-green-400 text-sm font-medium">Online</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-sm">API Server</span>
                                        <span className="text-green-400 text-sm font-medium">Online</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-sm">Storage</span>
                                        <span className="text-green-400 text-sm font-medium">Online</span>
                                    </div>
                                </div>
                            </div>

                            {/* Maintenance Card 2 */}
                            <div className="bg-[#1c1c1c] rounded-2xl border border-gray-800 p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-blue-500/10 rounded-lg">
                                        <Settings className="text-blue-400" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Cache Management</h3>
                                        <p className="text-sm text-gray-400">Clear system cache</p>
                                    </div>
                                </div>
                                <button className="w-full mt-4 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors text-sm font-medium">
                                    Clear Cache
                                </button>
                            </div>

                            {/* Maintenance Card 3 */}
                            <div className="bg-[#1c1c1c] rounded-2xl border border-gray-800 p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-purple-500/10 rounded-lg">
                                        <Package className="text-purple-400" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Database Backup</h3>
                                        <p className="text-sm text-gray-400">Create system backup</p>
                                    </div>
                                </div>
                                <button className="w-full mt-4 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors text-sm font-medium">
                                    Create Backup
                                </button>
                            </div>

                            {/* Maintenance Card 4 */}
                            <div className="bg-[#1c1c1c] rounded-2xl border border-gray-800 p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-green-500/10 rounded-lg">
                                        <CheckCircle className="text-green-400" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Logs</h3>
                                        <p className="text-sm text-gray-400">View system logs</p>
                                    </div>
                                </div>
                                <button className="w-full mt-4 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-sm font-medium">
                                    View Logs
                                </button>
                            </div>
                        </div>
                    </div>
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
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <h2 className="text-xl md:text-2xl font-bold">Admin Management</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base"
                >
                    <Users size={18} />
                    Add New Admin
                </button>
            </div>

            <div className="bg-[#1c1c1c] rounded-2xl border border-gray-800 overflow-hidden">
                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-800">
                    {admins.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No admins found.</div>
                    ) : (
                        admins.map((admin: any) => {
                        const isCurrentUser = currentUser?.userId === admin.id;
                        const isAdminRole = admin.roles?.includes('ADMIN') && !admin.roles?.includes('OWNER');
                        const isTargetOwner = admin.roles?.includes('OWNER');
                        const canEdit = isOwner || (isAdminRole && !isTargetOwner);

                        return (
                            <div key={admin.id} className="p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-white text-sm">{admin.email}</h3>
                                            {admin.roles?.includes('OWNER') ? (
                                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold">OWNER</span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-bold">ADMIN</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400">{admin.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">Created: {new Date(admin.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {canEdit && (
                                    <div className="flex gap-2 pt-2 border-t border-gray-800">
                                        <button
                                            onClick={() => {
                                                setShowEditEmailModal(admin);
                                                setNewEmail(admin.email);
                                            }}
                                            className="flex-1 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors text-xs flex items-center justify-center gap-1"
                                        >
                                            <Mail size={14} />
                                            Change Email
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowChangePasswordModal(admin);
                                            }}
                                            className="flex-1 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 rounded-lg text-green-400 transition-colors text-xs flex items-center justify-center gap-1"
                                        >
                                            <Lock size={14} />
                                            Change Password
                                        </button>
                                        {isOwner && !isCurrentUser && isAdminRole && (
                                            <button
                                                onClick={() => onRemoveAdmin(admin.id)}
                                                className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors text-xs"
                                                title="Remove Admin"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                )}
                                {isCurrentUser && (
                                    <p className="text-xs text-gray-500 italic">(Current User)</p>
                                )}
                            </div>
                        );
                    }))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
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
            <div className="bg-[#1c1c1c] rounded-2xl w-full max-w-md border border-gray-800 max-h-[90vh] overflow-y-auto">
                <div className="p-4 md:p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-[#1c1c1c]">
                    <h3 className="text-lg md:text-xl font-bold text-white">Add New Admin</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="p-4 md:p-6 space-y-4">
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
            <div className="bg-[#1c1c1c] rounded-2xl w-full max-w-md border border-gray-800 max-h-[90vh] overflow-y-auto">
                <div className="p-4 md:p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-[#1c1c1c]">
                    <h3 className="text-lg md:text-xl font-bold text-white">Change Email for {admin.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="p-4 md:p-6 space-y-4">
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
            <div className="bg-[#1c1c1c] rounded-2xl w-full max-w-md border border-gray-800 max-h-[90vh] overflow-y-auto">
                <div className="p-4 md:p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-[#1c1c1c]">
                    <h3 className="text-lg md:text-xl font-bold text-white">Change Password for {admin.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
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
