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

interface PostListItemProps {
    post: Post;
    onClick: () => void;
}

export default function PostListItem({ post, onClick }: PostListItemProps) {
    const userInitial = post.userInitial || "A";
    const userName = post.userName || "Anonymous";

    return (
        <div
            onClick={onClick}
            className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-blue-500/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 cursor-pointer group flex flex-row gap-4 p-4"
        >
            {/* Small Image */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
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
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">
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
                        {/* Status Badge */}
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex-shrink-0 ${
                            post.status === 'LOST'
                                ? 'bg-red-500/90 text-white'
                                : post.status === 'FOUND'
                                ? 'bg-green-500/90 text-white'
                                : 'bg-gray-500/90 text-white'
                        }`}>
                            {post.status}
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                        {post.description || "No description provided."}
                    </p>
                </div>

                {/* Footer Row */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-medium text-xs border border-gray-600">
                                {userInitial}
                            </div>
                            <span className="text-gray-400">{userName}</span>
                        </div>
                        <span className="text-gray-600">•</span>
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick();
                        }}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
}

