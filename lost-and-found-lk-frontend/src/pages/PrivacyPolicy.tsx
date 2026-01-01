import { useEffect } from 'react';
import { 
    Shield, 
    Mail, 
    Lock, 
    Eye, 
    Database,
    CheckCircle,
    AlertCircle,
    FileText,
    UserCheck
} from 'lucide-react';

export default function PrivacyPolicy() {
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
            <main className="relative z-10 container mx-auto px-6 py-12 md:py-20 max-w-4xl">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/20 mb-6">
                        <Shield className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400">
                        Privacy Policy
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
                    </p>
                    <p className="text-sm text-gray-400 mt-4">
                        Last Updated: January 1, 2026
                    </p>
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="relative group bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-400 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                                <Lock className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Data Security</h3>
                            <p className="text-gray-400">Your information is encrypted and stored securely</p>
                        </div>
                    </div>

                    <div className="relative group bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-400 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                                <Eye className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">No Sharing</h3>
                            <p className="text-gray-400">We never sell your data to third parties</p>
                        </div>
                    </div>

                    <div className="relative group bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-400 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                                <UserCheck className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Your Control</h3>
                            <p className="text-gray-400">You can access and delete your data anytime</p>
                        </div>
                    </div>
                </div>

                {/* Privacy Policy Content */}
                <div className="space-y-8 mb-16">
                    {/* Information We Collect */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="w-6 h-6 text-cyan-400" />
                            <h2 className="text-2xl font-bold text-white">Information We Collect</h2>
                        </div>
                        <div className="space-y-3 text-gray-300">
                            <p>We collect information that you provide directly to us, including:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Account information (name, email, phone number)</li>
                                <li>Lost and found item reports (descriptions, images, location)</li>
                                <li>Device identifiers (IMEI numbers for phones, serial numbers for laptops)</li>
                                <li>Contact information when you interact with other users</li>
                            </ul>
                            <p className="mt-4">We also automatically collect technical information such as IP address, browser type, and device information when you use our service.</p>
                        </div>
                    </div>

                    {/* How We Use Your Information */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Eye className="w-6 h-6 text-cyan-400" />
                            <h2 className="text-2xl font-bold text-white">How We Use Your Information</h2>
                        </div>
                        <div className="space-y-3 text-gray-300">
                            <p>We use your information to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Provide and improve our lost and found matching service</li>
                                <li>Match lost items with found items using IMEI and serial numbers</li>
                                <li>Facilitate communication between users</li>
                                <li>Send you notifications about matches and account activity</li>
                                <li>Ensure platform security and prevent fraud</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </div>
                    </div>

                    {/* Data Protection */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="w-6 h-6 text-cyan-400" />
                            <h2 className="text-2xl font-bold text-white">Data Protection</h2>
                        </div>
                        <div className="space-y-3 text-gray-300">
                            <p>We implement security measures to protect your information:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong className="text-white">Encryption:</strong> Sensitive data like IMEI numbers are encrypted before storage</li>
                                <li><strong className="text-white">Secure Storage:</strong> Data is stored on secure servers with access controls</li>
                                <li><strong className="text-white">Limited Access:</strong> Only authorized personnel can access your data</li>
                                <li><strong className="text-white">Regular Updates:</strong> We regularly update our security practices</li>
                            </ul>
                            <p className="mt-4 text-yellow-400">
                                <AlertCircle className="w-5 h-5 inline mr-2" />
                                No method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                            </p>
                        </div>
                    </div>

                    {/* Information Sharing */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-cyan-400" />
                            <h2 className="text-2xl font-bold text-white">Information Sharing</h2>
                        </div>
                        <div className="space-y-3 text-gray-300">
                            <p>We do <strong className="text-white">NOT</strong> sell your personal information to third parties.</p>
                            <p>We may share your information only in these cases:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong className="text-white">With Other Users:</strong> When you interact with other users (e.g., reporting a found item), we share necessary contact information</li>
                                <li><strong className="text-white">Service Providers:</strong> With trusted service providers who help us operate our platform (hosting, analytics)</li>
                                <li><strong className="text-white">Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                            </ul>
                        </div>
                    </div>

                    {/* Your Rights */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <UserCheck className="w-6 h-6 text-cyan-400" />
                            <h2 className="text-2xl font-bold text-white">Your Rights</h2>
                        </div>
                        <div className="space-y-3 text-gray-300">
                            <p>You have the right to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong className="text-white">Access:</strong> Request a copy of your personal data</li>
                                <li><strong className="text-white">Update:</strong> Correct or update your information through your profile</li>
                                <li><strong className="text-white">Delete:</strong> Request deletion of your account and data</li>
                                <li><strong className="text-white">Opt-out:</strong> Unsubscribe from non-essential communications</li>
                            </ul>
                            <p className="mt-4">To exercise these rights, contact us at <a href="mailto:trackback.help@gmail.com" className="text-cyan-400 hover:text-cyan-300">trackback.help@gmail.com</a></p>
                        </div>
                    </div>

                    {/* Cookies and Tracking */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-6 h-6 text-cyan-400" />
                            <h2 className="text-2xl font-bold text-white">Cookies and Tracking</h2>
                        </div>
                        <div className="space-y-3 text-gray-300">
                            <p>We use cookies and similar technologies to:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Remember your preferences and settings</li>
                                <li>Analyze how you use our service</li>
                                <li>Improve our platform's functionality</li>
                            </ul>
                            <p className="mt-4">You can control cookies through your browser settings, but this may affect some features of our service.</p>
                        </div>
                    </div>

                    {/* Changes to This Policy */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-6 h-6 text-cyan-400" />
                            <h2 className="text-2xl font-bold text-white">Changes to This Policy</h2>
                        </div>
                        <div className="space-y-3 text-gray-300">
                            <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Posting the new policy on this page</li>
                                <li>Updating the "Last Updated" date</li>
                                <li>Sending you an email notification (for major changes)</li>
                            </ul>
                            <p className="mt-4">Your continued use of our service after changes are posted constitutes acceptance of the updated policy.</p>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Mail className="w-8 h-8 text-cyan-400" />
                        <h2 className="text-3xl font-bold text-white">Questions About Privacy?</h2>
                    </div>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                        If you have any questions about this Privacy Policy or how we handle your data, please contact us:
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <div>
                                <p className="text-gray-400 text-sm">Email</p>
                                <a href="mailto:trackback.help@gmail.com" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                                    trackback.help@gmail.com
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <div>
                                <p className="text-gray-400 text-sm">Phone</p>
                                <a href="tel:+94713731404" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                                    +94 713 731 404
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

