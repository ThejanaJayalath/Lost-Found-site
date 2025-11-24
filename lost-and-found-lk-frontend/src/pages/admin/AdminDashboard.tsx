import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, CheckCircle, Search, Trash2, Ban, EyeOff, ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import Logo from '../../components/Logo';

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
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        try {
            console.log('Fetching admin data...');
            const [statsRes, usersRes] = await Promise.all([
                fetch('http://localhost:8082/api/admin/stats'),
                fetch('http://localhost:8082/api/admin/users')
            ]);

            console.log('Stats response status:', statsRes.status);
            console.log('Users response status:', usersRes.status);

            if (statsRes.ok && usersRes.ok) {
                const statsData = await statsRes.json();
                const usersData = await usersRes.json();
                console.log('Stats Data:', statsData);
                console.log('Users Data:', usersData);

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
        localStorage.removeItem('adminToken');
        navigate('/');
    };

    const toggleBlockUser = async (userId: string) => {
        try {
            const res = await fetch(`http://localhost:8082/api/admin/users/${userId}/block`, { method: 'PUT' });
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
            const res = await fetch(`http://localhost:8082/api/admin/users/${userId}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(users.filter(u => u.user.id !== userId));
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const toggleHidePost = async (postId: string) => {
        try {
            const res = await fetch(`http://localhost:8082/api/admin/posts/${postId}/hide`, { method: 'PUT' });
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
            const res = await fetch(`http://localhost:8082/api/admin/posts/${postId}`, { method: 'DELETE' });
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

    if (loading) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            {/* Navbar */}
            <nav className="bg-[#1c1c1c] border-b border-gray-800 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Logo />
                    <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border border-blue-500/20">Admin</span>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <LogOut size={18} />
                    Sign Out
                </button>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <StatCard icon={<Package className="text-blue-400" />} label="Lost Items" value={stats.lost} color="blue" />
                    <StatCard icon={<CheckCircle className="text-green-400" />} label="Found Items" value={stats.found} color="green" />
                    <StatCard icon={<CheckCircle className="text-purple-400" />} label="Resolved" value={stats.resolved} color="purple" />
                    <StatCard icon={<Users className="text-orange-400" />} label="Total Users" value={stats.users} color="orange" />
                </div>

                {/* Users List */}
                <div className="bg-[#1c1c1c] rounded-2xl border border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                        <h2 className="text-xl font-bold">User Management</h2>
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
                                                <span className="capitalize">{detail.user.authProvider}</span>
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
                                        {/* User Actions */}
                                        <div className="py-4 flex gap-3 mb-4 border-b border-gray-800/50">
                                            <button
                                                onClick={() => toggleBlockUser(detail.user.id)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${detail.user.blocked ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'}`}
                                            >
                                                <Ban size={16} />
                                                {detail.user.blocked ? 'Unblock User' : 'Block User'}
                                            </button>
                                            <button
                                                onClick={() => deleteUser(detail.user.id)}
                                                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                                            >
                                                <Trash2 size={16} />
                                                Delete User
                                            </button>
                                        </div>

                                        {/* User Posts */}
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
                                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${post.status === 'LOST' ? 'bg-red-500/20 text-red-400' : post.status === 'FOUND' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                                        {post.status}
                                                                    </span>
                                                                    {post.hidden && <span className="text-xs bg-gray-600 text-white px-2 py-0.5 rounded-full">HIDDEN</span>}
                                                                </div>
                                                                <p className="text-sm text-gray-400 line-clamp-1">{post.description}</p>
                                                                <p className="text-xs text-gray-500 mt-1">{post.date} at {post.time}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => toggleHidePost(post.id)}
                                                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                                title={post.hidden ? "Unhide" : "Hide"}
                                                            >
                                                                <EyeOff size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => deletePost(post.id)}
                                                                className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">No posts found.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
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
