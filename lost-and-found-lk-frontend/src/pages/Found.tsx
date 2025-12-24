import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, CheckCircle, Grid3x3, List } from 'lucide-react';
import PostDetailModal from '../components/PostDetailModal';
import PostCard from '../components/PostCard';
import PostListItem from '../components/PostListItem';
import ReportFoundModal from '../components/ReportFoundModal';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getViewPreference, saveViewPreference } from '../utils/viewPreference';
import type { ViewMode } from '../utils/viewPreference';

interface Post {
    id: string;
    title: string;
    description: string;
    location: string;
    date: string;
    images: string[];
    type: string;
    status: string;
    color: string;
    imei?: string;
    serialNumber?: string;
    idNumber?: string;
    contactPhone?: string;
    time?: string;
}

interface FoundProps {
    onOpenLogin: () => void;
    onOpenSignup?: () => void;
}

export default function Found({ onOpenLogin, onOpenSignup }: FoundProps) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>(getViewPreference());

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts?status=FOUND');
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const isDateInFilter = (dateStr: string, filter: string) => {
        if (filter === 'all') return true;
        if (!dateStr) return false;

        const postDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(today.getTime() - postDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filter) {
            case 'today':
                return diffDays === 0;
            case 'yesterday':
                return diffDays === 1;
            case '3days':
                return diffDays <= 3;
            case 'week':
                return diffDays <= 7;
            case 'month':
                return diffDays <= 30;
            case '3months':
                return diffDays <= 90;
            case 'year':
                return diffDays <= 365;
            default:
                return true;
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch =
            (post.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (post.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (post.location?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (post.type?.toLowerCase() || '').includes(searchQuery.toLowerCase());

        const matchesDate = isDateInFilter(post.date, dateFilter);
        const matchesCategory = categoryFilter === 'all' || (post.type && post.type.toUpperCase() === categoryFilter.toUpperCase());

        return matchesSearch && matchesDate && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gray-900 px-4 md:px-8 py-8 pt-24">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col items-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-200 mb-8 font-sans">Found Items</h1>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-5xl">
                        {/* Search Bar */}
                        <div className="relative flex-1 w-full max-w-2xl">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <Menu size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Item Name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 text-gray-200 placeholder-gray-500 transition-all"
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <Search size={20} />
                            </div>
                        </div>

                        {/* Report Button */}
                        <button
                            onClick={() => {
                                if (user) {
                                    setIsReportModalOpen(true);
                                } else {
                                    onOpenLogin();
                                }
                            }}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-lg shadow-lg shadow-green-500/20 transition-all transform hover:scale-105 flex items-center gap-2 font-medium text-lg"
                        >
                            <span>Report Found</span>
                            <CheckCircle size={20} />
                        </button>
                    </div>

                    {/* View Toggle & Filters */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                        {/* View Toggle */}
                        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-full p-1">
                            <button
                                onClick={() => {
                                    setViewMode('grid');
                                    saveViewPreference('grid');
                                }}
                                className={`p-2 rounded-full transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-green-500 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                                title="Grid View"
                            >
                                <Grid3x3 size={18} />
                            </button>
                            <button
                                onClick={() => {
                                    setViewMode('list');
                                    saveViewPreference('list');
                                }}
                                className={`p-2 rounded-full transition-all ${
                                    viewMode === 'list'
                                        ? 'bg-green-500 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                                title="List View"
                            >
                                <List size={18} />
                            </button>
                        </div>
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-6 py-2 bg-gray-800 border border-gray-700 rounded-full text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/50 cursor-pointer hover:bg-gray-700 transition-all appearance-none"
                            style={{ backgroundImage: 'none' }}
                        >
                            <option value="all">Any Time</option>
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="3days">Last 3 Days</option>
                            <option value="week">Last Week</option>
                            <option value="month">Last Month</option>
                            <option value="3months">Last 3 Months</option>
                            <option value="year">Last Year</option>
                        </select>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-6 py-2 bg-gray-800 border border-gray-700 rounded-full text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/50 cursor-pointer hover:bg-gray-700 transition-all appearance-none"
                            style={{ backgroundImage: 'none' }}
                        >
                            <option value="all">All Categories</option>
                            <option value="Phone">Phone</option>
                            <option value="Laptop">Laptop</option>
                            <option value="Purse">Purse</option>
                            <option value="Wallet">Wallet</option>
                            <option value="ID Card">ID Card</option>
                            <option value="Document">Document</option>
                            <option value="Pet">Pet</option>
                            <option value="Bag">Bag</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                {/* Items Grid/List */}
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading...</div>
                ) : (
                    <>
                        {filteredPosts.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No items found matching "{searchQuery}"
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredPosts.map((item) => (
                                    <PostCard
                                        key={item.id}
                                        post={item}
                                        onClick={() => setSelectedPost(item)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredPosts.map((item) => (
                                    <PostListItem
                                        key={item.id}
                                        post={item}
                                        onClick={() => setSelectedPost(item)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>



            <PostDetailModal
                post={selectedPost}
                onClose={() => setSelectedPost(null)}
                onOpenSignup={onOpenSignup}
            />

            <ReportFoundModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onSuccess={() => {
                    setIsReportModalOpen(false);
                    fetchPosts(); // Refresh the posts list
                    navigate('/profile'); // Navigate to profile after successful submission
                }}
            />
        </div>
    );
}
