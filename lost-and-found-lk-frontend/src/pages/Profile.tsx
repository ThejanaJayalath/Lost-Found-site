import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Edit2, Trash2, Box, CheckCircle } from 'lucide-react';
import ReportLostModal from '../components/ReportLostModal';
import ReportFoundModal from '../components/ReportFoundModal';
import { getApiBaseUrl } from '../services/api';

interface Post {
    id: string;
    title: string;
    description: string;
    location: string;
    date: string;
    time: string;
    images: string[];
    type: string;
    status: string;
    color: string;
}

export default function Profile() {
    const navigate = useNavigate();
    const { user, syncUserWithBackend, loading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.displayName || '');
    const [phone, setPhone] = useState('');
    const [posts, setPosts] = useState<Post[]>([]);
    const [foundPosts, setFoundPosts] = useState<Post[]>([]);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isFoundModalOpen, setIsFoundModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/');
        }
        if (user) {
            setName(user.displayName || '');

            const loadData = async () => {
                setIsLoading(true);
                try {
                    await Promise.all([
                        fetchUserData(),
                        fetchUserPosts(),
                        fetchFoundPosts(),
                        fetchNotifications()
                    ]);
                } catch (error) {
                    console.error("Error loading profile data", error);
                } finally {
                    setIsLoading(false);
                }
            };

            loadData();
        }
    }, [user, loading, navigate]);

    const fetchUserData = async () => {
        if (!user || !user.email) return;
        try {
            const response = await fetch(`${getApiBaseUrl()}/users/${user.email}`);
            if (response.ok) {
                const userData = await response.json();
                if (userData.phoneNumber) {
                    setPhone(userData.phoneNumber);
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const fetchUserPosts = async () => {
        if (!user) return;
        try {
            const userResponse = await fetch(`${getApiBaseUrl()}/users/${user.email}`);
            if (userResponse.ok) {
                const userData = await userResponse.json();
                const response = await fetch(`${getApiBaseUrl()}/posts/user/${userData.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data);
                }
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const fetchFoundPosts = async () => {
        if (!user || !user.email) return;
        try {
            const response = await fetch(`${getApiBaseUrl()}/interactions/user/${user.email}/found`);
            if (response.ok) {
                const data = await response.json();
                setFoundPosts(data);
            }
        } catch (error) {
            console.error('Error fetching found posts:', error);
        }
    };

    const fetchNotifications = async () => {
        if (!user || !user.email) return;
        try {
            const response = await fetch(`${getApiBaseUrl()}/interactions/user/${user.email}/claims`);
            if (response.ok) {
                const data = await response.json();
                // Filter out already accepted/rejected if needed, or show all
                setNotifications(data.filter((n: any) => n.status === 'PENDING'));
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleConfirmClaim = async (interactionId: string) => {
        if (!window.confirm("Are you sure you want to confirm this item return? This will mark the post as resolved.")) return;

        try {
            const response = await fetch(`${getApiBaseUrl()}/interactions/${interactionId}/confirm`, {
                method: 'POST'
            });

            if (response.ok) {
                alert("Item confirmed returned! Post marked as resolved.");
                fetchNotifications();
                fetchUserPosts(); // Refresh posts to show new status
            } else {
                alert("Failed to confirm.");
            }
        } catch (error) {
            console.error("Error confirming claim:", error);
        }
    };

    const handleUpdateProfile = async () => {
        if (!user) return;
        try {
            await syncUserWithBackend(user, { phoneNumber: phone });
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await fetch(`${getApiBaseUrl()}/posts/${postId}`, {
                    method: 'DELETE',
                });
                setPosts(posts.filter(post => post.id !== postId));
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 px-4 md:px-8 py-8 pt-24">
            <div className="max-w-5xl mx-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-400 animate-pulse">Loading profile...</p>
                    </div>
                ) : (
                    <>
                        {/* Profile Header */}
                        <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-8 mb-12 relative overflow-hidden">
                            {/* Decorative Background Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
                                <div className="flex flex-col md:flex-row items-center gap-8 w-full">
                                    {/* Avatar */}
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-gray-600 shadow-xl">
                                            {user?.photoURL ? (
                                                <img src={user.photoURL} alt={name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={48} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div className="absolute inset-0 rounded-full ring-2 ring-blue-500/50 animate-pulse"></div>
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 text-center md:text-left w-full">
                                        {isEditing ? (
                                            <div className="space-y-4 max-w-md mx-auto md:mx-0">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white placeholder-gray-400 outline-none transition-all"
                                                        placeholder="Full Name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        className="block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white placeholder-gray-400 outline-none transition-all"
                                                        placeholder="Phone Number"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <h1 className="text-3xl font-bold text-white mb-2">{name}</h1>
                                                <div className="flex flex-col md:flex-row items-center gap-4 text-gray-400">
                                                    <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1 rounded-full">
                                                        <Mail size={16} className="text-blue-400" />
                                                        <span>{user?.email}</span>
                                                    </div>
                                                    {phone && (
                                                        <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1 rounded-full">
                                                            <Phone size={16} className="text-green-400" />
                                                            <span>{phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Edit Button */}
                                <button
                                    onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                                    className={`px-6 py-2.5 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg ${isEditing
                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-blue-500/20'
                                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600 hover:text-white'
                                        }`}
                                >
                                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                                </button>
                            </div>
                        </div>

                        {/* Notifications Section */}
                        {notifications.length > 0 && (
                            <div className="mb-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <h2 className="text-2xl font-bold text-white">Notifications</h2>
                                    <span className="text-sm font-normal text-white bg-red-500 px-2 py-1 rounded-full animate-pulse">
                                        {notifications.length} New
                                    </span>
                                </div>
                                <div className="grid gap-4">
                                    {notifications.map((notif) => (
                                        <div key={notif.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-blue-500/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                                                    <CheckCircle size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">Item Found!</h3>
                                                    <p className="text-gray-400">
                                                        <span className="font-bold text-white">{notif.finderName || notif.finderEmail}</span> claims to have found your item.
                                                    </p>
                                                    {notif.finderPhone && (
                                                        <div className="flex items-center gap-2 mt-2 text-green-400 font-mono bg-green-500/10 px-3 py-1 rounded-lg w-fit">
                                                            <Phone size={14} />
                                                            {notif.finderPhone}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleConfirmClaim(notif.id)}
                                                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all transform hover:scale-105 whitespace-nowrap"
                                            >
                                                Confirm It's Mine
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* My Posts Section */}
                        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                My Posts
                                <span className="text-sm font-normal text-gray-500 bg-gray-800 px-2 py-1 rounded-full border border-gray-700">
                                    {posts.length}
                                </span>
                            </h2>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setEditingPost(null);
                                        setIsReportModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-red-500/20 transform hover:scale-105"
                                >
                                    <Box size={18} />
                                    Report Lost
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingPost(null);
                                        setIsFoundModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-500/20 transform hover:scale-105"
                                >
                                    <CheckCircle size={18} />
                                    Report Found
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                            {posts.map((post) => (
                                <div key={post.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-500/30 transition-all duration-300 group">
                                    <div className="aspect-video bg-gray-700 relative overflow-hidden">
                                        {post.images && post.images.length > 0 ? (
                                            <img
                                                src={post.images[0]}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                <Box size={32} className="opacity-50" />
                                            </div>
                                        )}

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                            <button
                                                onClick={() => {
                                                    setEditingPost(post);
                                                    if (post.status === 'FOUND') {
                                                        setIsFoundModalOpen(true);
                                                    } else {
                                                        setIsReportModalOpen(true);
                                                    }
                                                }}
                                                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md border border-white/20 transition-all transform hover:scale-110"
                                                title="Edit Post"
                                            >
                                                <Edit2 size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePost(post.id)}
                                                className="p-3 bg-red-500/80 hover:bg-red-500 rounded-full text-white backdrop-blur-md border border-red-400/20 transition-all transform hover:scale-110"
                                                title="Delete Post"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md ${post.status === 'LOST'
                                                ? 'bg-red-500/90 text-white'
                                                : 'bg-green-500/90 text-white'
                                                }`}>
                                                {post.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">{post.title}</h3>
                                        <p className="text-sm text-gray-400 line-clamp-2 mb-4 h-10">{post.description}</p>

                                        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-700 pt-4">
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                {post.date}
                                            </span>
                                            <span className="truncate max-w-[150px]">{post.location}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {posts.length === 0 && (
                            <div className="text-center py-16 bg-gray-800/50 rounded-2xl border border-dashed border-gray-700 mb-16">
                                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Box size={32} className="text-gray-500" />
                                </div>
                                <h3 className="text-xl font-medium text-white mb-2">No posts yet</h3>
                                <p className="text-gray-400 max-w-sm mx-auto">
                                    You haven't posted any lost or found items yet. Use the buttons above to create your first post.
                                </p>
                            </div>
                        )}

                        {/* Items I Found Section */}
                        {foundPosts.length > 0 && (
                            <>
                                <div className="flex items-center gap-3 mb-8 border-t border-gray-700 pt-12">
                                    <h2 className="text-2xl font-bold text-white">Items I Found</h2>
                                    <span className="text-sm font-normal text-gray-500 bg-gray-800 px-2 py-1 rounded-full border border-gray-700">
                                        {foundPosts.length}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {foundPosts.map((post) => (
                                        <div key={post.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:border-green-500/30 transition-all duration-300 group">
                                            <div className="aspect-video bg-gray-700 relative overflow-hidden">
                                                {post.images && post.images.length > 0 ? (
                                                    <img
                                                        src={post.images[0]}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                        <Box size={32} className="opacity-50" />
                                                    </div>
                                                )}

                                                {/* Status Badge */}
                                                <div className="absolute top-3 left-3">
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md bg-green-500/90 text-white">
                                                        FOUND BY ME
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-5">
                                                <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">{post.title}</h3>
                                                <p className="text-sm text-gray-400 line-clamp-2 mb-4 h-10">{post.description}</p>

                                                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-700 pt-4">
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                        {post.date}
                                                    </span>
                                                    <span className="truncate max-w-[150px]">{post.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}

                <ReportLostModal
                    isOpen={isReportModalOpen}
                    onClose={() => {
                        setIsReportModalOpen(false);
                        setEditingPost(null);
                    }}
                    onSuccess={() => {
                        fetchUserPosts();
                        setEditingPost(null);
                    }}
                    initialData={editingPost}
                />

                <ReportFoundModal
                    isOpen={isFoundModalOpen}
                    onClose={() => {
                        setIsFoundModalOpen(false);
                        setEditingPost(null);
                    }}
                    onSuccess={() => {
                        fetchUserPosts();
                        setEditingPost(null);
                    }}
                    initialData={editingPost}
                />
            </div>
        </div>
    );
}
