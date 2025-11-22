import { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Calendar } from 'lucide-react';

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

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
        >
            {/* Image Carousel */}
            <div className="h-48 overflow-hidden relative bg-gray-100">
                {post.images && post.images.length > 0 ? (
                    <>
                        <img
                            src={post.images[currentImageIndex]}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500"
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
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                        <span className="text-4xl">📦</span>
                    </div>
                )}
                <span className={`absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded-full ${post.status === 'LOST' ? 'bg-red-500' : 'bg-green-500'}`}>
                    {post.status}
                </span>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{post.title}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap ml-2">{post.type}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">{post.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span className="truncate max-w-[100px]">{post.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{post.date}</span>
                    </div>
                </div>

                <button className="w-full mt-4 bg-green-50 text-green-700 border border-green-200 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors">
                    I Found This!
                </button>
            </div>
        </div>
    );
}
