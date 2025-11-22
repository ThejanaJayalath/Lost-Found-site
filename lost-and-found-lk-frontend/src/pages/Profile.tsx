import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Edit2, Trash2, Plus } from 'lucide-react';
import ReportLostModal from '../components/ReportLostModal';
import ReportFoundModal from '../components/ReportFoundModal';

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
    const { user, syncUserWithBackend } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.displayName || '');
    const [phone, setPhone] = useState('');
    const [posts, setPosts] = useState<Post[]>([]);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isFoundModalOpen, setIsFoundModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.displayName || '');
            fetchUserData();
            fetchUserPosts();
        }
    }, [user]);

    const fetchUserData = async () => {
        if (!user || !user.email) return;
        try {
            const response = await fetch(`http://localhost:8082/api/users/${user.email}`);
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
            // Assuming we will use email or a specific userId field if available. 
            // Since we added userId to Post, we need to know what that userId is.
            // If it's the MongoDB ID, we need to get it from fetchUserData first.
            // Or if we store it in AuthContext.
            // For now, let's assume we use email or we fetch the user first and get the ID.

            // Better approach: fetch user first, get ID, then fetch posts.
            // But for now let's try fetching by email if we change the backend, or just fetch user first.
            const userResponse = await fetch(`http://localhost:8082/api/users/${user.email}`);
            if (userResponse.ok) {
                const userData = await userResponse.json();
                const response = await fetch(`http://localhost:8082/api/posts/user/${userData.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data);
                }
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
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
                await fetch(`http://localhost:8082/api/posts/${postId}`, {
                    method: 'DELETE',
                });
                setPosts(posts.filter(post => post.id !== postId));
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt={name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} className="text-gray-400" />
                                )}
                            </div>
                            <div>
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                                            placeholder="Full Name"
                                        />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                                            placeholder="Phone Number"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                                        <div className="flex items-center gap-4 mt-2 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Mail size={16} />
                                                <span>{user?.email}</span>
                                            </div>
                                            {phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone size={16} />
                                                    <span>{phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${isEditing
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {isEditing ? 'Save Changes' : 'Edit Profile'}
                        </button>
                    </div>
                </div>

                {/* My Posts Section */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">My Posts</h2>
                    <button
                        onClick={() => {
                            setEditingPost(null);
                            setIsReportModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                    >
                        <Plus size={20} />
                        Report Lost Item
                    </button>
                    <button
                        onClick={() => {
                            setEditingPost(null);
                            setIsFoundModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30 ml-4"
                    >
                        <Plus size={20} />
                        Report Found Item
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map((post) => (
                        <div key={post.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-video bg-gray-100 relative">
                                {post.images && post.images.length > 0 ? (
                                    <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingPost(post);
                                            if (post.status === 'FOUND') {
                                                setIsFoundModalOpen(true);
                                            } else {
                                                setIsReportModalOpen(true);
                                            }
                                        }}
                                        className="p-2 bg-white/90 rounded-full hover:bg-white text-gray-700 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeletePost(post.id)}
                                        className="p-2 bg-white/90 rounded-full hover:bg-white text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-gray-900 line-clamp-1">{post.title}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.status === 'LOST' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {post.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.description}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{post.date}</span>
                                    <span>{post.location}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {posts.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">You haven't posted anything yet.</p>
                    </div>
                )}
            </div>

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
    );
}
