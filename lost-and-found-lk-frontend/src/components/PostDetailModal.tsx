import { X, MapPin, Calendar, Tag, Smartphone, Laptop, CreditCard, FileText, Briefcase, Dog, Clock, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getApiBaseUrl } from '../services/api';

interface Post {
    id: string;
    title: string;
    description: string;
    location: string;
    date: string;
    time?: string;
    images: string[];
    type: string;
    status: string;
    color: string;
    imei?: string;
    serialNumber?: string;
    idNumber?: string;
    contactPhone?: string;
    contactName?: string;
}

interface PostDetailModalProps {
    post: Post | null;
    onClose: () => void;
    onOpenSignup?: () => void;
}

export default function PostDetailModal({ post, onClose, onOpenSignup }: PostDetailModalProps) {
    const { user } = useAuth();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showLoginRequired, setShowLoginRequired] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (post) {
            setCurrentImageIndex(0);
        }
    }, [post]);

    if (!post) return null;

    const getItemIcon = (type: string) => {
        if (!type) return <Briefcase size={20} />;
        switch (type.toUpperCase()) {
            case 'PHONE': return <Smartphone size={20} />;
            case 'LAPTOP': return <Laptop size={20} />;
            case 'WALLET':
            case 'PURSE': return <CreditCard size={20} />;
            case 'DOCUMENT':
            case 'ID CARD': return <FileText size={20} />;
            case 'PET': return <Dog size={20} />;
            default: return <Briefcase size={20} />;
        }
    };

    const handleFoundClick = () => {
        if (post.status === 'LOST') {
            // Check if user is logged in
            if (!user || !user.email) {
                setShowLoginRequired(true);
                return;
            }
            setShowConfirmation(true);
        } else {
            // Logic for 'Contact Owner' if needed, or just show phone
        }
    };

    const handleConfirmFound = async () => {
        if (!user || !user.email) {
            setShowConfirmation(false);
            setShowLoginRequired(true);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${getApiBaseUrl()}/interactions/found`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId: post.id,
                    finderEmail: user.email,
                    ownerEmail: null // Can be added if available in post data
                }),
            });

            if (response.ok) {
                setShowConfirmation(false);
                setShowSuccess(true);
            } else {
                const errorText = await response.text();
                alert(`Error: ${errorText}`);
            }
        } catch (error) {
            console.error("Error recording interaction:", error);
            alert("Failed to record interaction. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-gray-800 relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Login Required Modal Overlay */}
                {showLoginRequired && (
                    <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                        <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full border border-gray-700 text-center">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle size={32} className="text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Sign Up Required</h3>
                            <p className="text-gray-400 mb-8">
                                If you want to report this item as found, you should sign up first.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowLoginRequired(false)}
                                    className="flex-1 py-3 px-4 rounded-xl font-medium bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowLoginRequired(false);
                                        onClose();
                                        if (onOpenSignup) {
                                            onOpenSignup();
                                        }
                                    }}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmation Modal Overlay */}
                {showConfirmation && (
                    <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                        <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full border border-gray-700 text-center">
                            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle size={32} className="text-yellow-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Are you sure?</h3>
                            <p className="text-gray-400 mb-8">
                                Do you confirm that you have found this exact item? This will notify the owner.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowConfirmation(false)}
                                    className="flex-1 py-3 px-4 rounded-xl font-medium bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmFound}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold bg-green-500 text-white hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                                >
                                    {isSubmitting ? 'Processing...' : 'Yes, I Found It'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Modal Overlay */}
                {showSuccess && (
                    <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                        <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full border border-gray-700 text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={32} className="text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                            <p className="text-gray-400 mb-6">
                                Please contact the owner immediately to return the item.
                            </p>

                            <div className="bg-gray-700/50 p-6 rounded-xl border border-gray-600 mb-8">
                                <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Owner's Contact</p>
                                <p className="text-3xl font-bold text-white mb-1">{post.contactPhone || "No Phone Provided"}</p>
                                {post.contactName && <p className="text-gray-300">{post.contactName}</p>}
                            </div>

                            <button
                                onClick={() => {
                                    setShowSuccess(false);
                                    onClose();
                                }}
                                className="w-full py-3 px-4 rounded-xl font-bold bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* Image Section (Left/Top) */}
                <div className="w-full md:w-1/2 bg-gray-800 relative flex flex-col">
                    <div className="flex-1 relative min-h-[300px] md:min-h-full group">
                        {post.images && post.images.length > 0 ? (
                            <>
                                <img
                                    src={post.images[currentImageIndex]}
                                    alt={post.title}
                                    className="absolute inset-0 w-full h-full object-contain bg-black/20"
                                />

                                {/* Navigation Arrows */}
                                {post.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentImageIndex((prev) => (prev === 0 ? post.images.length - 1 : prev - 1));
                                            }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentImageIndex((prev) => (prev === post.images.length - 1 ? 0 : prev + 1));
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                        >
                                            <ChevronRight size={24} />
                                        </button>

                                        {/* Image Counter */}
                                        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                                            {currentImageIndex + 1} / {post.images.length}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                                <span className="text-6xl">📦</span>
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {post.images && post.images.length > 1 && (
                        <div className="p-4 flex gap-2 overflow-x-auto bg-gray-800/90 backdrop-blur border-t border-gray-700">
                            {post.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${idx === currentImageIndex ? 'border-blue-500' : 'border-transparent'}`}
                                >
                                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="absolute top-4 left-4 md:hidden bg-black/50 p-2 rounded-full text-white backdrop-blur-sm"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Details Section (Right/Bottom) */}
                <div className="w-full md:w-1/2 flex flex-col h-full max-h-[50vh] md:max-h-[90vh] bg-gray-900">
                    <div className="p-6 md:p-8 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`flex items-center gap-2 font-medium text-sm uppercase tracking-wider ${post.status === 'LOST' ? 'text-red-400' : 'text-green-400'
                                }`}>
                                {getItemIcon(post.type)}
                                <span>{post.type}</span>
                            </div>
                            <button onClick={onClose} className="hidden md:block text-gray-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-2">{post.title}</h2>

                        {/* Date & Time */}
                        {/* items Details List */}
                        <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/50 mb-8 space-y-4">
                            {/* Date */}
                            <div className="flex flex-col md:flex-row border-b border-gray-700/50 pb-3">
                                <span className="text-gray-500 text-sm font-bold uppercase tracking-wider w-36 shrink-0 flex items-center gap-2">
                                    <Calendar size={14} />
                                    {post.status === 'LOST' ? 'Lost Date' : 'Found Date'}
                                </span>
                                <span className="text-gray-200 font-medium">
                                    {post.date ? new Date(post.date).toLocaleDateString() : 'Date unknown'}
                                </span>
                            </div>

                            {/* Time */}
                            {post.time && (
                                <div className="flex flex-col md:flex-row border-b border-gray-700/50 pb-3">
                                    <span className="text-gray-500 text-sm font-bold uppercase tracking-wider w-36 shrink-0 flex items-center gap-2">
                                        <Clock size={14} />
                                        {post.status === 'LOST' ? 'Lost Time' : 'Found Time'}
                                    </span>
                                    <span className="text-gray-200 font-medium">
                                        {post.time}
                                    </span>
                                </div>
                            )}

                            {/* Location */}
                            <div className="flex flex-col md:flex-row border-b border-gray-700/50 pb-3">
                                <span className="text-gray-500 text-sm font-bold uppercase tracking-wider w-36 shrink-0 flex items-center gap-2">
                                    <MapPin size={14} />
                                    {post.status === 'LOST' ? 'Last Location' : 'Location Found'}
                                </span>
                                <span className="text-gray-200 font-medium">
                                    {post.location}
                                </span>
                            </div>

                            {/* Color */}
                            <div className="flex flex-col md:flex-row">
                                <span className="text-gray-500 text-sm font-bold uppercase tracking-wider w-36 shrink-0 flex items-center gap-2">
                                    <Tag size={14} />
                                    Color
                                </span>
                                <span className="text-gray-200 font-medium">
                                    {post.color}
                                </span>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none mb-8">
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Description</h3>
                            <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">
                                {post.description}
                            </p>
                        </div>

                        {/* Specific Details */}
                        {(post.serialNumber || post.idNumber || post.contactPhone) && (
                            <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 mb-8">
                                <h4 className="text-blue-400 font-bold text-sm mb-3 uppercase tracking-wider">Identifiers & Contact</h4>
                                {post.serialNumber && (
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Serial Number:</span>
                                        <span className="font-mono text-white bg-gray-700 px-2 py-0.5 rounded">{post.serialNumber}</span>
                                    </div>
                                )}
                                {post.idNumber && (
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">ID Number:</span>
                                        <span className="font-mono text-white bg-gray-700 px-2 py-0.5 rounded">{post.idNumber}</span>
                                    </div>
                                )}
                                {post.contactPhone && (
                                    <div className="flex justify-between text-sm mt-3 pt-3 border-t border-gray-700">
                                        <span className="text-gray-400 font-medium">Contact:</span>
                                        <span className="font-bold text-green-400 text-lg">{post.contactPhone}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-gray-800 bg-gray-900">
                        <button
                            onClick={handleFoundClick}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${post.status === 'LOST'
                                ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30'
                                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30'
                                }`}
                        >
                            {post.status === 'LOST' ? 'I Found This!' : 'Contact Owner'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
