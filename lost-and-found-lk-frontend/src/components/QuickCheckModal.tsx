import { useState } from 'react';
import { X, Smartphone, Laptop, Search, AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../services/api';
import PostCard from './PostCard';
import PostDetailModal from './PostDetailModal';

interface QuickCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'SELECTION' | 'INPUT' | 'RESULT';
type DeviceType = 'PHONE' | 'LAPTOP';


export default function QuickCheckModal({ isOpen, onClose }: QuickCheckModalProps) {
    const [step, setStep] = useState<Step>('SELECTION');
    const [deviceType, setDeviceType] = useState<DeviceType | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultPost, setResultPost] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedDetailPost, setSelectedDetailPost] = useState<any | null>(null);

    if (!isOpen) return null;

    const handleDeviceSelect = (type: DeviceType) => {
        setDeviceType(type);
        setStep('INPUT');
        setInputValue('');
        setError(null);
    };

    const handleBack = () => {
        if (step === 'INPUT') {
            setStep('SELECTION');
            setDeviceType(null);
        } else if (step === 'RESULT') {
            setStep('INPUT');
            setResultPost(null);
        }
    };

    const handleSearch = async () => {
        if (!inputValue.trim()) {
            setError('Please enter a valid ID.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/posts/search`, {
                params: {
                    type: deviceType,
                    value: inputValue
                }
            });
            setResultPost(response.data);
            setStep('RESULT');
        } catch (err: any) {
            if (err.response && err.response.status === 404) {
                setResultPost(null);
                setStep('RESULT');
            } else {
                setError('An error occurred while searching. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-800 flex flex-col">

                    {/* Header */}
                    <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900 z-10">
                        <div className="flex items-center gap-3">
                            {step !== 'SELECTION' && (
                                <button onClick={handleBack} className="text-gray-400 hover:text-white transition-colors">
                                    <ArrowLeft size={24} />
                                </button>
                            )}
                            <h2 className="text-2xl font-bold text-white">Quick Check</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 overflow-y-auto">

                        {/* Step 1: Selection */}
                        {step === 'SELECTION' && (
                            <div className="space-y-8">
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                                    <AlertTriangle className="text-yellow-500 shrink-0 mt-1" />
                                    <p className="text-yellow-200/80 text-sm">
                                        This feature currently works only for Mobile Phones and Laptops. You can search using the device's unique identifier (IMEI or Serial Number).
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button
                                        onClick={() => handleDeviceSelect('PHONE')}
                                        className="group relative h-48 bg-gray-800 rounded-2xl border border-gray-700 hover:border-cyan-500 transition-all duration-300 flex flex-col items-center justify-center gap-4 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-700 group-hover:border-cyan-500/50">
                                            <Smartphone className="w-8 h-8 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                                        </div>
                                        <span className="text-xl font-bold text-gray-300 group-hover:text-white">Mobile Phone</span>
                                    </button>

                                    <button
                                        onClick={() => handleDeviceSelect('LAPTOP')}
                                        className="group relative h-48 bg-gray-800 rounded-2xl border border-gray-700 hover:border-blue-500 transition-all duration-300 flex flex-col items-center justify-center gap-4 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-700 group-hover:border-blue-500/50">
                                            <Laptop className="w-8 h-8 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                        </div>
                                        <span className="text-xl font-bold text-gray-300 group-hover:text-white">Laptop</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Input */}
                        {step === 'INPUT' && (
                            <div className="space-y-6 max-w-md mx-auto py-8">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 rounded-full bg-gray-800 mx-auto flex items-center justify-center mb-4 border border-gray-700">
                                        {deviceType === 'PHONE' ? (
                                            <Smartphone className="w-8 h-8 text-cyan-400" />
                                        ) : (
                                            <Laptop className="w-8 h-8 text-blue-400" />
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-white">
                                        Enter {deviceType === 'PHONE' ? 'IMEI Number' : 'Serial Number'}
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-2">
                                        {deviceType === 'PHONE'
                                            ? 'Enter the 15-digit IMEI number of the lost phone.'
                                            : 'Enter the unique serial number (S/N) of the lost laptop.'}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={deviceType === 'PHONE' ? "Enter IMEI Number" : "Enter Serial Number"}
                                        className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-center text-lg tracking-wider focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all placeholder-gray-600"
                                    />
                                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                                    <button
                                        onClick={handleSearch}
                                        disabled={loading}
                                        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <span className="animate-pulse">Searching...</span>
                                        ) : (
                                            <>
                                                <Search size={20} />
                                                Check Now
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Result */}
                        {step === 'RESULT' && (
                            <div className="py-4">
                                {resultPost ? (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <div className="w-16 h-16 rounded-full bg-green-500/20 mx-auto flex items-center justify-center mb-4 border border-green-500/50">
                                                <CheckCircle className="w-8 h-8 text-green-400" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white">Match Found!</h3>
                                            <p className="text-gray-400 mt-2">We found a lost item matching your details.</p>
                                        </div>
                                        <div className="max-w-sm mx-auto cursor-pointer transition-transform hover:scale-105" onClick={() => setSelectedDetailPost(resultPost)}>
                                            <PostCard post={resultPost} onClick={() => setSelectedDetailPost(resultPost)} />
                                        </div>
                                        <p className="text-center text-sm text-gray-500">Click on the card to view full details</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 space-y-6">
                                        <div className="w-20 h-20 rounded-full bg-gray-800 mx-auto flex items-center justify-center border border-gray-700">
                                            <Search className="w-10 h-10 text-gray-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Item Not Found</h3>
                                            <p className="text-gray-400 mt-2 max-w-xs mx-auto">
                                                We couldn't find any lost item matching that {deviceType === 'PHONE' ? 'IMEI' : 'Serial Number'}.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setStep('INPUT');
                                                setInputValue('');
                                            }}
                                            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors border border-gray-700"
                                        >
                                            Try Another ID
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Post Detail Modal */}
            {selectedDetailPost && (
                <PostDetailModal
                    post={selectedDetailPost}
                    onClose={() => setSelectedDetailPost(null)}
                />
            )}
        </>
    );
}
