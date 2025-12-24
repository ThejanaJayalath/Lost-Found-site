import { Edit2, Trash2 } from 'lucide-react';

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
}

interface ProfilePostListItemProps {
    post: Post;
    onEdit: () => void;
    onDelete: () => void;
}

export default function ProfilePostListItem({ post, onEdit, onDelete }: ProfilePostListItemProps) {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-blue-500/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 group flex flex-row gap-4 p-4">
            {/* Small Image */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                {post.images && post.images.length > 0 ? (
                    <img
                        src={post.images[0]}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-800">
                        <div className="w-8 h-8 border-2 border-gray-500 rounded flex items-center justify-center opacity-50">
                            <span className="text-lg">▲</span>
                        </div>
                    </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        post.status === 'LOST'
                            ? 'bg-red-500/90 text-white'
                            : 'bg-green-500/90 text-white'
                    }`}>
                        {post.status}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg font-bold text-white mb-1 line-clamp-1">
                                {post.title}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded">
                                    {post.type}
                                </span>
                                {post.color && (
                                    <span className="text-xs text-gray-400">
                                        • {post.color}
                                    </span>
                                )}
                                <span className="text-xs text-gray-500">
                                    • {post.location}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                        {post.description || "No description provided."}
                    </p>
                </div>

                {/* Footer Row */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-700/50">
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-all"
                            title="Edit Post"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-all"
                            title="Delete Post"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

