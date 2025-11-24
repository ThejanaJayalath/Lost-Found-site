import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    contactPhone?: string;
    time?: string;
    userName?: string;
    userInitial?: string;
}

interface PostCardProps {
    post: Post;
    onClick: () => void;
}

export default function PostCard({ post, onClick }: PostCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (post.images && post.images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % post.images.length);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (post.images && post.images.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length);
        }
    };

    // Placeholder for user info
    const userInitial = post.userInitial || "A";
    const userName = post.userName || "Anonymous";

    return (
        <div
            onClick={onClick}
            className="bg-gray-800 border border-blue-500/20 rounded-2xl overflow-hidden hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-500/40 transition-all duration-300 cursor-pointer group flex flex-col h-full"
        >
            {/* Image Area */}
            <div className="h-64 bg-gray-800 relative overflow-hidden">
                {post.images && post.images.length > 0 ? (
                    <>
                        <img
                            src={post.images[currentImageIndex]}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Navigation Arrows */}
                        {post.images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                >
                                    <ChevronRight size={16} />
                                </button>
                                {/* Dots Indicator */}
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                    {post.images.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/40'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-gray-800">
                        <div className="flex gap-4 opacity-30">
                            <div className="w-12 h-12 border-2 border-gray-500 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">▲</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* User Info (Moved below image) */}
            <div className="p-4 flex items-center gap-3 border-b border-gray-700/50">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-medium border border-gray-600">
                    {userInitial}
                </div>
                <div>
                    <h3 className="font-medium text-gray-200 text-sm">{userName}</h3>
                    <p className="text-xs text-gray-500">{post.date}</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                <h2 className="text-lg font-bold text-white mb-1">{post.title}</h2>
                <div className="flex items-center gap-1 text-gray-400 text-sm mb-3">
                    <span>{post.location}</span>
                </div>

                <p className="text-gray-400 text-sm mb-6 line-clamp-2 flex-grow">
                    {post.description || "No description provided."}
                </p>

                <div className="flex justify-end mt-auto">
                    <button className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 px-6 py-2 rounded-full text-sm font-medium transition-all hover:text-white hover:border-gray-600">
                        Contact
                    </button>
                </div>
            </div>
        </div>
    );
}
