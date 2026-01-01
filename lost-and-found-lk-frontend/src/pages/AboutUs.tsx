import { useEffect } from 'react';
import { 
    Info, 
    Users, 
    Target, 
    Heart,
    Shield,
    Globe,
    Mail,
    Phone,
    CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutUs() {
    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

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
                <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm"></div>
            </div>

            {/* Animated Background Patterns */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <svg className="absolute top-0 left-0 w-1/2 h-full opacity-10" viewBox="0 0 500 800">
                    <path d="M50,0 V200 L150,300 V500 L50,600 V800" stroke="#06B6D4" strokeWidth="2" fill="none" />
                    <circle cx="150" cy="300" r="4" fill="#06B6D4" />
                </svg>
                <svg className="absolute top-0 right-0 w-1/2 h-full opacity-10" viewBox="0 0 500 800">
                    <path d="M450,0 V250 L350,350 V450 L450,550 V800" stroke="#8B5CF6" strokeWidth="2" fill="none" />
                    <circle cx="350" cy="350" r="4" fill="#8B5CF6" />
                </svg>
            </div>

            {/* Content Container */}
            <main className="relative z-10 container mx-auto px-6 py-12 md:py-20 max-w-5xl">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/20 mb-6">
                        <Info className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400">
                        About TrackBack
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Connecting lost items with their owners through community-driven technology.
                    </p>
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="relative group bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-400 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                                <Target className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Our Mission</h3>
                            <p className="text-gray-400">Help reunite lost items with their owners</p>
                        </div>
                    </div>

                    <div className="relative group bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-400 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Community Driven</h3>
                            <p className="text-gray-400">Built by the community, for the community</p>
                        </div>
                    </div>

                    <div className="relative group bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-400 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Secure & Safe</h3>
                            <p className="text-gray-400">Your privacy and data are protected</p>
                        </div>
                    </div>
                </div>

                {/* About Content */}
                <div className="space-y-8 mb-16">
                    {/* Our Story */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Heart className="w-6 h-6 text-cyan-400" />
                            <h2 className="text-2xl font-bold text-white">Our Story</h2>
                        </div>
                        <div className="space-y-3 text-gray-300 leading-relaxed">
                            <p>
                                TrackBack was born from a simple idea: what if we could use technology to help people recover their lost belongings? Every day, countless items are lost in Sri Lanka - from phones and laptops to wallets, ID cards, and even pets.
                            </p>
                            <p>
                                We created TrackBack as a community-driven platform where people can report lost items, search for found items, and connect with others who might have found what they're looking for. Our advanced matching system uses IMEI numbers for phones and serial numbers for laptops to help make accurate matches.
                            </p>
                            <p>
                                What makes TrackBack special is our community. Every user who reports a found item or helps someone recover their belongings is making a difference. Together, we're building a network of helpful people dedicated to reuniting lost items with their owners.
                            </p>
                        </div>
                    </div>

                    {/* What We Do */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="w-6 h-6 text-cyan-400" />
                            <h2 className="text-2xl font-bold text-white">What We Do</h2>
                        </div>
                        <div className="space-y-4 text-gray-300">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Lost Item Reporting</h3>
                                    <p>Report your lost items with detailed descriptions, photos, and location information. For phones and laptops, add IMEI or serial numbers for better matching.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Found Item Reporting</h3>
                                    <p>Found something? Report it on TrackBack so the owner can find it. Your good deed helps someone recover what they thought was lost forever.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Smart Matching</h3>
                                    <p>Our system uses IMEI matching for phones and serial number matching for laptops to help connect lost items with found items automatically.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Community Support</h3>
                                    <p>Join thousands of helpful Sri Lankans working together to reunite lost items with their owners. Every report matters, every connection helps.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Our Values */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Heart className="w-6 h-6 text-cyan-400" />
                            <h2 className="text-2xl font-bold text-white">Our Values</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                            <div>
                                <h3 className="font-semibold text-white mb-2">🤝 Community First</h3>
                                <p>We believe in the power of community. Every user is part of a network of helpful people working together.</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-2">🔒 Privacy & Security</h3>
                                <p>Your personal information is protected. We use encryption for sensitive data and never share your information without permission.</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-2">✨ Free & Accessible</h3>
                                <p>TrackBack is free to use for everyone. We believe everyone deserves a chance to recover their lost belongings.</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-2">🌍 Made for Sri Lanka</h3>
                                <p>Built specifically for Sri Lankans, with support for local languages and understanding of local needs.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Globe className="w-8 h-8 text-cyan-400" />
                        <h2 className="text-3xl font-bold text-white">Get in Touch</h2>
                    </div>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                        Have questions about TrackBack? Want to share feedback or suggestions? We'd love to hear from you!
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <div>
                                <p className="text-gray-400 text-sm">Email</p>
                                <a href="mailto:trackback.help@gmail.com" className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    trackback.help@gmail.com
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <div>
                                <p className="text-gray-400 text-sm">Phone</p>
                                <a href="tel:+94724041555" className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    +94 724 041 555
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-700">
                        <Link
                            to="/support"
                            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                            Visit our Customer Support page
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

