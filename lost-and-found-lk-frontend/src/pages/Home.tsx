import { CheckCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import QuickCheckModal from '../components/QuickCheckModal';

interface HomeProps {
    onOpenSignup?: () => void;
}

export default function Home({ onOpenSignup }: HomeProps) {
    const navigate = useNavigate();
    const [isQuickCheckOpen, setIsQuickCheckOpen] = useState(false);

    return (
        <div className="min-h-screen relative overflow-hidden font-sans text-white bg-gray-900">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: "url('/bgimage.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm"></div>
            </div>

            {/* Animated Background Patterns */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Circuit Lines - Left */}
                <svg className="absolute top-0 left-0 w-1/2 h-full opacity-20" viewBox="0 0 500 800">
                    <path d="M50,0 V200 L150,300 V500 L50,600 V800" stroke="#06B6D4" strokeWidth="2" fill="none" className="animate-dash" />
                    <path d="M100,0 V150 L200,250 V550 L100,650 V800" stroke="#06B6D4" strokeWidth="1" fill="none" className="animate-dash-reverse opacity-50" />
                    <circle cx="150" cy="300" r="4" fill="#06B6D4" className="animate-ping" />
                </svg>

                {/* Circuit Lines - Right */}
                <svg className="absolute top-0 right-0 w-1/2 h-full opacity-20" viewBox="0 0 500 800">
                    <path d="M450,0 V250 L350,350 V450 L450,550 V800" stroke="#8B5CF6" strokeWidth="2" fill="none" className="animate-dash" />
                    <path d="M400,0 V200 L300,300 V500 L400,600 V800" stroke="#8B5CF6" strokeWidth="1" fill="none" className="animate-dash-reverse opacity-50" />
                    <circle cx="350" cy="350" r="4" fill="#8B5CF6" className="animate-ping" />
                </svg>
            </div>

            {/* Content Container */}
            <main className="relative z-10 container mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-center min-h-screen pt-20 md:pt-32 gap-12 md:gap-24">

                {/* Left Section: Hero Text */}
                <div className="w-full md:w-5/12 relative p-8 md:p-12">
                    {/* Neon Bracket Border */}
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Top Left */}
                        <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-blue-500 rounded-tl-3xl shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
                        {/* Bottom Right */}
                        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-blue-500 rounded-br-3xl shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
                        {/* Decorative Dots */}
                        <div className="absolute top-0 left-32 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                        <div className="absolute left-0 top-32 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                        <div className="absolute bottom-0 right-32 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                        <div className="absolute right-0 bottom-32 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                    </div>

                    <div className="relative z-10">
                        <h1 className="text-6xl md:text-8xl font-bold leading-tight tracking-tight text-white">
                            Reclaim <br />
                            What <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                                Matters
                            </span>
                        </h1>
                        <p className="mt-8 text-gray-300 text-xl max-w-md leading-relaxed font-light">
                            Experience effortless recovery with our dedicated lost and found service.
                        </p>
                    </div>
                </div>

                {/* Right Section: Action Buttons */}
                <div className="w-full md:w-4/12 flex flex-col items-center justify-center">
                    <div className="flex flex-col gap-6 w-full max-w-sm">

                        {/* Lost Button */}
                        <button
                            onClick={() => navigate('/lost')}
                            className="group relative w-full h-20 rounded-2xl bg-gray-900 transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Gradient Border via Pseudo-element or Container */}
                            <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-red-500 via-pink-500 to-red-500 opacity-80 group-hover:opacity-100 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-300">
                                <div className="w-full h-full bg-gray-900 rounded-[14px] flex items-center justify-between px-8">
                                    <span className="text-3xl font-bold text-white tracking-wide">Lost</span>
                                    <div className="w-10 h-10 rounded-full border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                                        <CheckCircle className="w-6 h-6 text-cyan-400" />
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Found Button */}
                        <button
                            onClick={() => navigate('/found')}
                            className="group relative w-full h-20 rounded-2xl bg-gray-900 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 opacity-80 group-hover:opacity-100 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-300">
                                <div className="w-full h-full bg-gray-900 rounded-[14px] flex items-center justify-between px-8">
                                    <span className="text-3xl font-bold text-white tracking-wide">Found</span>
                                    <div className="w-10 h-10 rounded-full border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_10px_rgba(52,211,153,0.5)]">
                                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Quick Check Button */}
                        <button
                            onClick={() => setIsQuickCheckOpen(true)}
                            className="group relative w-full h-20 rounded-2xl bg-gray-900 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 opacity-80 group-hover:opacity-100 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all duration-300">
                                <div className="w-full h-full bg-gray-900 rounded-[14px] flex items-center justify-between px-8">
                                    <span className="text-3xl font-bold text-white tracking-wide">Quick Check</span>
                                    <div className="w-10 h-10 rounded-full border-0 flex items-center justify-center">
                                        <Search className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
                                    </div>
                                </div>
                            </div>
                        </button>

                    </div>
                </div>

            </main>

            {/* Quick Check Modal */}
            <QuickCheckModal isOpen={isQuickCheckOpen} onClose={() => setIsQuickCheckOpen(false)} onOpenSignup={onOpenSignup} />
        </div>
    );
}
