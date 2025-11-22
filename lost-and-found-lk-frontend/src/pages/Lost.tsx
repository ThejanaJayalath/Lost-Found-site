import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ReportLostModal from '../components/ReportLostModal';
import PostDetailModal from '../components/PostDetailModal';
import PostCard from '../components/PostCard';
import api from '../services/api';

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

export default function Lost() {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts?status=LOST');
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
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.type.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDate = isDateInFilter(post.date, dateFilter);
        const matchesCategory = categoryFilter === 'all' || post.type.toUpperCase() === categoryFilter.toUpperCase();

        return matchesSearch && matchesDate && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF5EE] via-[#FFFFF0] to-[#F0FFF0] px-4 md:px-8 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-[#2D2B2B] mb-8 font-serif">Lost Items</h1>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl mx-auto">
                        {/* Search Bar */}
                        <div className="relative flex-1 w-full">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                <div className="text-gray-500">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="3" y1="12" x2="21" y2="12"></line>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <line x1="3" y1="18" x2="21" y2="18"></line>
                                    </svg>
                                </div>
                            </div>
                            <input
                                type="text"
                                placeholder="Item Name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-12 py-3 bg-[#F5F5DC]/50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-700 placeholder-gray-500"
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <Search size={20} />
                            </div>
                        </div>

                        {/* Report Button */}
                        <button
                            onClick={() => setIsReportModalOpen(true)}
                            className="bg-[#E85D4E] hover:bg-[#D64C3D] text-white px-8 py-3 rounded-xl shadow-lg shadow-red-500/20 transition-all transform hover:scale-105 flex items-center gap-2 font-medium text-lg"
                        >
                            <span>Report</span>
                            <span className="text-2xl">📦</span>
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-6 py-2 bg-white/80 border border-gray-200 rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer shadow-sm hover:shadow-md transition-all"
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
                            className="px-6 py-2 bg-white/80 border border-gray-200 rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer shadow-sm hover:shadow-md transition-all"
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

                {/* Items Grid */}
                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : (
                    <>
                        {filteredPosts.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No items found matching "{searchQuery}"
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {filteredPosts.map((item) => (
                                    <PostCard
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

            <ReportLostModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onSuccess={fetchPosts}
            />

            <PostDetailModal
                post={selectedPost}
                onClose={() => setSelectedPost(null)}
            />
        </div>
    );
}
