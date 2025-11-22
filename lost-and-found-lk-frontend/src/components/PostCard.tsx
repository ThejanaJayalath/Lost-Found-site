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
    userName?: string; // Assuming we might have this, or use placeholder
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

    // Placeholder for user info since we don't have it in the Post model yet fully populated
    const userInitial = "A";

    return (
        <div
            onClick={onClick}
            className="bg-[#E6E6FA]/40 rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border border-white/50"
        >
            {/* Header */}
            <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5D5C8D] flex items-center justify-center text-white font-medium">
                    {userInitial}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{post.title}</h3>
                    <p className="text-xs text-gray-500">{post.date}</p>
                </div>
            </div>

            {/* Image Area */}
            <div className="h-48 bg-gray-200 relative group overflow-hidden">
                {post.images && post.images.length > 0 ? (
                    <>
                        <img
                            src={post.images[currentImageIndex]}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                        {/* Navigation Arrows */}
                        {post.images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <ChevronRight size={20} />
                                </button>
                                {/* Dots Indicator */}
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                    {post.images.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-1.5 h-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <div className="flex gap-4 opacity-50">
                            <div className="w-12 h-12 border-2 border-gray-400 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">▲</span>
                            </div>
                            <div className="w-12 h-12 border-2 border-gray-400 rounded-full flex items-center justify-center">
                                <span className="text-2xl">●</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <h2 className="text-xl font-bold text-gray-800 mb-1">{post.title}</h2>
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                    <span>{post.location}</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"}
                </p>

                <div className="flex justify-end">
                    <button className="bg-[#5D5C8D] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#4A4970] transition-colors">
                        Contact
                    </button>
                </div>
            </div>
        </div>
    );
}
