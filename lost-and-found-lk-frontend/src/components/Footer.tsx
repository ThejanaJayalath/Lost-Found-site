import { Link } from 'react-router-dom';
import { Facebook, Github, Twitter, Instagram } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
    return (
        <footer className="bg-gray-900 border-t border-gray-800 pt-12 pb-8 px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Logo & Contact */}
                <div className="flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4">
                        <Logo />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2 text-white">Contact</h3>
                        <p className="text-gray-400">Tel: +94 713731404</p>
                        <p className="text-gray-400">Email: thejanajayalath2003@gmail.com</p>
                        <div className="flex gap-4 mt-4 text-gray-400">
                            <Twitter size={20} className="hover:text-cyan-400 cursor-pointer transition-colors" />
                            <Facebook size={20} className="hover:text-cyan-400 cursor-pointer transition-colors" />
                            <Instagram size={20} className="hover:text-cyan-400 cursor-pointer transition-colors" />
                            <Github size={20} className="hover:text-cyan-400 cursor-pointer transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Site Links */}
                <div>
                    <h3 className="font-bold text-lg mb-4 text-white">Site</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-cyan-400 transition-colors">Lost</a></li>
                        <li><a href="#" className="hover:text-cyan-400 transition-colors">Report Lost</a></li>
                        <li><a href="#" className="hover:text-cyan-400 transition-colors">Found</a></li>
                        <li><a href="#" className="hover:text-cyan-400 transition-colors">Report Found</a></li>
                    </ul>
                </div>

                {/* Help */}
                <div>
                    <h3 className="font-bold text-lg mb-4 text-white">Help</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><Link to="/support" className="hover:text-cyan-400 transition-colors">Customer Support</Link></li>
                        <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms & Conditions</a></li>
                        <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                    </ul>
                </div>

                {/* Links */}
                <div>
                    <h3 className="font-bold text-lg mb-4 text-white">Links</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-cyan-400 transition-colors">LinkedIn</a></li>
                        <li><a href="#" className="hover:text-cyan-400 transition-colors">Facebook</a></li>
                        <li><a href="#" className="hover:text-cyan-400 transition-colors">YouTube</a></li>
                        <li><a href="#" className="hover:text-cyan-400 transition-colors">About Us</a></li>
                    </ul>
                </div>
            </div>
            <div className="text-center mt-12 text-gray-500 text-sm border-t border-gray-800 pt-8">
                © Copyright 2026 TraceBack<br />All Right Reserved
            </div>
        </footer>
    );
}
