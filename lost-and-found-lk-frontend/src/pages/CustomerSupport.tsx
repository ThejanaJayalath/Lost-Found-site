import { useState, useEffect } from 'react';
import { 
    HelpCircle, 
    Mail, 
    Phone, 
    MessageSquare, 
    ChevronDown, 
    ChevronUp,
    CheckCircle,
    AlertCircle,
    FileText,
    Search,
    Clock,
    Send
} from 'lucide-react';

interface FAQ {
    question: string;
    answer: string;
    category: string;
}

const faqs: FAQ[] = [
    {
        category: 'Getting Started',
        question: 'How do I report a lost item?',
        answer: 'Click on the "Report Lost" button on the Lost page. Fill in the required details including item type, description, location, and upload images. For phones, you can add your IMEI number for better matching. Once submitted, your report will be visible to all users.'
    },
    {
        category: 'Getting Started',
        question: 'How do I report a found item?',
        answer: 'Click on the "Report Found" button on the Found page. Provide details about the item you found, including location, description, and images. This helps the owner identify their lost item.'
    },
    {
        category: 'Account',
        question: 'How do I create an account?',
        answer: 'Click on the "Sign Up" button in the navigation bar. You can sign up using your Google account or create an account with your email address. Having an account allows you to report items and contact other users.'
    },
    {
        category: 'Searching',
        question: 'How can I search for my lost item?',
        answer: 'Use the search bar on the Lost or Found pages to search by keywords. You can also use filters to narrow down by date, category, or location. For phones and laptops, use the Quick Check feature to search by IMEI or Serial Number.'
    },
    {
        category: 'Matching',
        question: 'How does IMEI matching work?',
        answer: 'When you report a lost phone with an IMEI number, our system can match it with found phones that have the same IMEI. This is done securely - your IMEI is encrypted and never displayed publicly. Only exact matches will be shown to you.'
    },
    {
        category: 'Matching',
        question: 'What if someone claims they found my item?',
        answer: 'When someone clicks "I Found This!" on your lost post, you will receive a notification. You can then contact them through the provided contact information to verify and arrange pickup. Always verify the item details before meeting.'
    },
    {
        category: 'Privacy',
        question: 'Is my personal information safe?',
        answer: 'Yes, we take privacy seriously. Your IMEI numbers are encrypted, and contact information is only shared when you choose to interact with other users. We never share your personal data with third parties.'
    },
    {
        category: 'Facebook Posts',
        question: 'How do I request a Facebook post for my report?',
        answer: 'When creating a lost or found report, check the "Create Facebook post for this report" checkbox. Your request will be sent to our admin team for approval. Once approved, your post will be published on our Facebook page to reach a wider audience.'
    },
    {
        category: 'Account',
        question: 'How do I edit or delete my report?',
        answer: 'Go to your Profile page and find your reports. Click on the edit or delete button next to the report you want to modify. You can update details, add more images, or remove the report if your item has been found.'
    },
    {
        category: 'General',
        question: 'What items can I report?',
        answer: 'You can report various items including phones, laptops, wallets, purses, ID cards, documents, pets, bags, and other personal belongings. The more details you provide, the better chance of recovery.'
    }
];

const categories = ['All', 'Getting Started', 'Account', 'Searching', 'Matching', 'Privacy', 'Facebook Posts', 'General'];

export default function CustomerSupport() {
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [formSubmitted, setFormSubmitted] = useState(false);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const filteredFAQs = selectedCategory === 'All' 
        ? faqs 
        : faqs.filter(faq => faq.category === selectedCategory);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the form data to your backend
        console.log('Support request:', formData);
        setFormSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setFormSubmitted(false), 5000);
    };

    const toggleFAQ = (index: number) => {
        setOpenFAQ(openFAQ === index ? null : index);
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
                        <HelpCircle className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400">
                        Customer Support
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        We're here to help you recover what matters. Find answers to common questions or reach out to our support team.
                    </p>
                </div>

                {/* Quick Contact Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="relative group bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-400 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                                <Phone className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Phone Support</h3>
                            <p className="text-gray-400 mb-3">Call us directly</p>
                            <a href="tel:+94713731404" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                                +94 713 731 404
                            </a>
                            <p className="text-sm text-gray-500 mt-2">Mon - Fri, 9 AM - 6 PM</p>
                        </div>
                    </div>

                    <div className="relative group bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-400 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                                <Mail className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Email Support</h3>
                            <p className="text-gray-400 mb-3">Send us an email</p>
                            <a href="mailto:trackback.help@gmail.com" className="text-cyan-400 hover:text-cyan-300 font-semibold break-all">
                                trackback.help@gmail.com
                            </a>
                            <p className="text-sm text-gray-500 mt-2">We respond within 24 hours</p>
                        </div>
                    </div>

                    <div className="relative group bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-400 transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                                <Clock className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Response Time</h3>
                            <p className="text-gray-400 mb-3">Average response</p>
                            <p className="text-cyan-400 font-semibold text-lg">Within 24 Hours</p>
                            <p className="text-sm text-gray-500 mt-2">For urgent matters, call us</p>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-8">
                        <FileText className="w-8 h-8 text-cyan-400" />
                        <h2 className="text-4xl font-bold text-white">Frequently Asked Questions</h2>
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

                    {/* FAQ List */}
                    <div className="space-y-4">
                        {filteredFAQs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl overflow-hidden transition-all duration-300 hover:border-cyan-400"
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                                >
                                    <div className="flex-1">
                                        <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wide mb-2 block">
                                            {faq.category}
                                        </span>
                                        <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                                    </div>
                                    <div className="ml-4">
                                        {openFAQ === index ? (
                                            <ChevronUp className="w-6 h-6 text-cyan-400" />
                                        ) : (
                                            <ChevronDown className="w-6 h-6 text-cyan-400" />
                                        )}
                                    </div>
                                </button>
                                {openFAQ === index && (
                                    <div className="px-6 pb-4 border-t border-gray-700/50">
                                        <p className="text-gray-300 mt-4 leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Form Section */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-8">
                        <MessageSquare className="w-8 h-8 text-cyan-400" />
                        <h2 className="text-4xl font-bold text-white">Send us a Message</h2>
                    </div>

                    {formSubmitted && (
                        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                            <p className="text-green-400">Thank you! Your message has been sent. We'll get back to you soon.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                    Your Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                                Subject
                            </label>
                            <input
                                type="text"
                                id="subject"
                                required
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                placeholder="What can we help you with?"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                                Message
                            </label>
                            <textarea
                                id="message"
                                required
                                rows={6}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
                                placeholder="Tell us more about your question or issue..."
                            />
                        </div>
                        <button
                            type="submit"
                            className="group relative w-full md:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold text-white hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2"
                        >
                            <Send className="w-5 h-5" />
                            Send Message
                        </button>
                    </form>
                </div>

                {/* Quick Help Section */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Search className="w-6 h-6 text-cyan-400" />
                            <h3 className="text-xl font-bold text-white">Can't Find Your Answer?</h3>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Try using the search function on the Lost or Found pages. You can filter by date, category, or location to narrow down results.
                        </p>
                        <a
                            href="/lost"
                            className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-2"
                        >
                            Browse Lost Items
                            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                        </a>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-6 h-6 text-purple-400" />
                            <h3 className="text-xl font-bold text-white">Report an Issue</h3>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Found a bug or have a suggestion? Use the contact form above or email us directly. We appreciate your feedback!
                        </p>
                        <a
                            href="mailto:trackback.help@gmail.com"
                            className="text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-2"
                        >
                            Email Us
                            <Mail className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}

