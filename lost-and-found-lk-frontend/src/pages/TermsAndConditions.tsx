import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Scale, 
    Mail, 
    Phone, 
    FileText, 
    ChevronDown, 
    ChevronUp,
    Shield,
    AlertCircle,
    Lock,
    Users,
    CheckCircle,
    Clock
} from 'lucide-react';

interface TermSection {
    title: string;
    content: string;
    category: string;
}

const terms: TermSection[] = [
    {
        category: 'Acceptance',
        title: 'Acceptance of Terms',
        content: 'By accessing and using TraceBack Lost & Found platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
    },
    {
        category: 'Acceptance',
        title: 'Service Description',
        content: 'TraceBack is a community-driven platform that helps users report, search, and recover lost or found items. Our service facilitates connections between users who have lost items and those who have found them. We provide tools for reporting, searching, and matching items through various methods including IMEI matching for phones and serial number matching for laptops.'
    },
    {
        category: 'User Accounts',
        title: 'Account Registration',
        content: 'To use certain features of our platform, you must register for an account. You agree to provide accurate, current, and complete information during the registration process. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.'
    },
    {
        category: 'User Accounts',
        title: 'Account Responsibilities',
        content: 'You are responsible for all content you post, including lost and found reports, images, and personal information. You agree not to post false, misleading, or fraudulent information. You must be at least 18 years old or have parental consent to use this service. We reserve the right to suspend or terminate accounts that violate these terms.'
    },
    {
        category: 'Privacy & Data',
        title: 'Personal Information',
        content: 'We collect and process personal information as described in our Privacy Policy. Sensitive information such as IMEI numbers are encrypted and stored securely. Contact information is only shared when you choose to interact with other users. We do not sell your personal data to third parties.'
    },
    {
        category: 'Privacy & Data',
        title: 'Data Security',
        content: 'While we implement security measures to protect your data, no method of transmission over the internet is 100% secure. You acknowledge that you provide information at your own risk. We are not liable for any unauthorized access to your account or data breach beyond our reasonable control.'
    },
    {
        category: 'User Conduct',
        title: 'Prohibited Activities',
        content: 'You agree not to: (1) Post false, misleading, or fraudulent information; (2) Harass, threaten, or harm other users; (3) Use the service for illegal purposes; (4) Attempt to gain unauthorized access to our systems; (5) Interfere with or disrupt the service; (6) Collect user information without consent; (7) Impersonate others or provide false identity information.'
    },
    {
        category: 'User Conduct',
        title: 'Content Guidelines',
        content: 'All content posted must be accurate, lawful, and respectful. You may not post content that is defamatory, obscene, discriminatory, or violates any laws. We reserve the right to remove any content that violates these guidelines without notice. Repeated violations may result in account termination.'
    },
    {
        category: 'Item Matching',
        title: 'Matching Process',
        content: 'Our platform uses various methods to match lost and found items, including IMEI matching for phones and serial number matching for laptops. Matches are based on information provided by users. We do not guarantee matches and are not responsible for the accuracy of user-provided information. Users are responsible for verifying item ownership before returning items.'
    },
    {
        category: 'Item Matching',
        title: 'Item Verification',
        content: 'When a match is found, both parties are responsible for verifying the item details before meeting. We recommend meeting in a public place and verifying ownership through additional details. TraceBack is not responsible for disputes between users regarding item ownership or condition. We are not liable for any losses or damages resulting from item exchanges.'
    },
    {
        category: 'Liability',
        title: 'Service Disclaimer',
        content: 'TraceBack provides the platform "as is" without warranties of any kind. We do not guarantee that you will find your lost item or that matches are accurate. We are not responsible for the actions of other users, including fraud, misrepresentation, or failure to return items. Use of the service is at your own risk.'
    },
    {
        category: 'Liability',
        title: 'Limitation of Liability',
        content: 'To the maximum extent permitted by law, TraceBack and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or use, arising from your use of the service. Our total liability shall not exceed the amount you paid to use the service (if any).'
    },
    {
        category: 'Intellectual Property',
        title: 'Platform Ownership',
        content: 'All content, features, and functionality of the TraceBack platform, including but not limited to text, graphics, logos, icons, images, and software, are owned by TraceBack and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.'
    },
    {
        category: 'Intellectual Property',
        title: 'User Content License',
        content: 'By posting content on our platform, you grant TraceBack a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content for the purpose of operating and promoting the service. You retain ownership of your content and can remove it at any time by deleting your posts.'
    },
    {
        category: 'Modifications',
        title: 'Service Changes',
        content: 'We reserve the right to modify, suspend, or discontinue any part of the service at any time without notice. We may update these Terms & Conditions from time to time. Continued use of the service after changes constitutes acceptance of the new terms. We recommend reviewing these terms periodically.'
    },
    {
        category: 'Modifications',
        title: 'Termination',
        content: 'We may terminate or suspend your account and access to the service immediately, without prior notice, for any breach of these Terms & Conditions. You may also terminate your account at any time by contacting us. Upon termination, your right to use the service will cease immediately.'
    },
    {
        category: 'Contact',
        title: 'Contact Information',
        content: 'If you have questions about these Terms & Conditions, please contact us at: Email: trackback.help@gmail.com | Phone: +94 713 731 404. We will respond to your inquiries within a reasonable timeframe.'
    },
    {
        category: 'Legal',
        title: 'Governing Law',
        content: 'These Terms & Conditions shall be governed by and construed in accordance with the laws of Sri Lanka. Any disputes arising from these terms or your use of the service shall be subject to the exclusive jurisdiction of the courts of Sri Lanka.'
    }
];

const categories = ['All', 'Acceptance', 'User Accounts', 'Privacy & Data', 'User Conduct', 'Item Matching', 'Liability', 'Intellectual Property', 'Modifications', 'Contact', 'Legal'];

export default function TermsAndConditions() {
    const [openTerm, setOpenTerm] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const filteredTerms = selectedCategory === 'All' 
        ? terms 
        : terms.filter(term => term.category === selectedCategory);

    const toggleTerm = (index: number) => {
        setOpenTerm(openTerm === index ? null : index);
    };

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
            <main className="relative z-10 container mx-auto px-6 py-12 md:py-20">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/20 mb-6">
                        <Scale className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400">
                        Terms & Conditions
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Please read these terms carefully before using TraceBack. By using our service, you agree to be bound by these terms.
                    </p>
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="relative group bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-400 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Your Rights</h3>
                            <p className="text-gray-400 mb-3">Understand your rights</p>
                            <p className="text-cyan-400 font-semibold">Protected by Law</p>
                            <p className="text-sm text-gray-500 mt-2">We respect your privacy</p>
                        </div>
                    </div>

                    <div className="relative group bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-400 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                                <Lock className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Data Security</h3>
                            <p className="text-gray-400 mb-3">Your information is safe</p>
                            <p className="text-cyan-400 font-semibold">Encrypted & Secure</p>
                            <p className="text-sm text-gray-500 mt-2">We protect your data</p>
                        </div>
                    </div>

                    <div className="relative group bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-400 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">User Responsibilities</h3>
                            <p className="text-gray-400 mb-3">Your obligations</p>
                            <p className="text-cyan-400 font-semibold">Fair Use Policy</p>
                            <p className="text-sm text-gray-500 mt-2">Use responsibly</p>
                        </div>
                    </div>
                </div>

                {/* Terms Section */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-8">
                        <FileText className="w-8 h-8 text-cyan-400" />
                        <h2 className="text-4xl font-bold text-white">Terms & Conditions</h2>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                    selectedCategory === category
                                        ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Terms List */}
                    <div className="space-y-4">
                        {filteredTerms.map((term, index) => (
                            <div
                                key={index}
                                className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl overflow-hidden transition-all duration-300 hover:border-cyan-400"
                            >
                                <button
                                    onClick={() => toggleTerm(index)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                                >
                                    <div className="flex-1">
                                        <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wide mb-2 block">
                                            {term.category}
                                        </span>
                                        <h3 className="text-lg font-semibold text-white">{term.title}</h3>
                                    </div>
                                    <div className="ml-4">
                                        {openTerm === index ? (
                                            <ChevronUp className="w-6 h-6 text-cyan-400" />
                                        ) : (
                                            <ChevronDown className="w-6 h-6 text-cyan-400" />
                                        )}
                                    </div>
                                </button>
                                {openTerm === index && (
                                    <div className="px-6 pb-4 border-t border-gray-700/50">
                                        <p className="text-gray-300 mt-4 leading-relaxed">{term.content}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Important Notice Section */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-8">
                        <AlertCircle className="w-8 h-8 text-cyan-400" />
                        <h2 className="text-4xl font-bold text-white">Important Notice</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-2">Last Updated</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    These Terms & Conditions were last updated on January 1, 2026. We reserve the right to modify these terms at any time. Your continued use of the service after changes are posted constitutes acceptance of the new terms.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-2">Agreement to Terms</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    By using TraceBack, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must not use our service.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-2">Questions or Concerns</h3>
                                <p className="text-gray-300 leading-relaxed mb-3">
                                    If you have any questions about these Terms & Conditions, please contact us:
                                </p>
                                <div className="space-y-2">
                                    <a href="mailto:trackback.help@gmail.com" className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        trackback.help@gmail.com
                                    </a>
                                    <br />
                                    <a href="tel:+94713731404" className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        +94 713 731 404
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links Section */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-6 h-6 text-cyan-400" />
                            <h3 className="text-xl font-bold text-white">Privacy Policy</h3>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Learn how we collect, use, and protect your personal information. Our Privacy Policy explains our data practices in detail.
                        </p>
                        <Link
                            to="/privacy"
                            className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-2"
                        >
                            View Privacy Policy
                            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                        </Link>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="w-6 h-6 text-purple-400" />
                            <h3 className="text-xl font-bold text-white">Need Help?</h3>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Have questions about our terms or need assistance? Visit our Customer Support page for help and answers to common questions.
                        </p>
                        <Link
                            to="/support"
                            className="text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-2"
                        >
                            Visit Support
                            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

