import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import ReportFoundModal from '../components/ReportFoundModal';
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

export default function Found() {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

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
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.type.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDate = isDateInFilter(post.date, dateFilter);
        const matchesCategory = categoryFilter === 'all' || post.type.toUpperCase() === categoryFilter.toUpperCase();

        return matchesSearch && matchesDate && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-[#FDFDF5] px-8 py-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Found Items</h1>
                        <p className="text-gray-600 mt-2">Browse items found by others</p>
                    </div>
                    <button
                        onClick={() => setIsReportModalOpen(true)}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-md transition-colors"
                    >
                        <Plus size={20} />
                        Report Found Item
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search found items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 cursor-pointer"
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
                            className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 cursor-pointer"
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            <ReportFoundModal
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
