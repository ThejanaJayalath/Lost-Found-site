import { Facebook, Linkedin, Youtube, Github, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#FDFDF5] pt-12 pb-8 px-8 border-t border-gray-100">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Logo & Copyright */}
                <div className="flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-md flex items-center justify-center border border-orange-200">
                            <span className="text-xl">📦</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-xl tracking-wide text-gray-800">I FOUND</span>
                        </div>
                    </div>
                </div>

                {/* Site Links */}
                <div>
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Site</h3>
                    <ul className="space-y-2 text-gray-600">
                        <li><a href="#" className="hover:text-gray-900">Lost</a></li>
                        <li><a href="#" className="hover:text-gray-900">Report Lost</a></li>
                        <li><a href="#" className="hover:text-gray-900">Found</a></li>
                        <li><a href="#" className="hover:text-gray-900">Report Found</a></li>
                    </ul>
                </div>

                {/* Help */}
                <div>
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Help</h3>
                    <ul className="space-y-2 text-gray-600">
                        <li><a href="#" className="hover:text-gray-900">Customer Support</a></li>
                        <li><a href="#" className="hover:text-gray-900">Terms & Conditions</a></li>
                        <li><a href="#" className="hover:text-gray-900">Privacy Policy</a></li>
                    </ul>
                </div>

                {/* Contact & Links */}
                <div>
                    <div className="mb-6">
                        <h3 className="font-bold text-lg mb-4 text-gray-800">Links</h3>
                        <ul className="space-y-2 text-gray-600">
                            <li><a href="#" className="hover:text-gray-900">LinkedIn</a></li>
                            <li><a href="#" className="hover:text-gray-900">Facebook</a></li>
                            <li><a href="#" className="hover:text-gray-900">YouTube</a></li>
                            <li><a href="#" className="hover:text-gray-900">About Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2 text-gray-800">Contact</h3>
                        <p className="text-gray-600">Tel: +94 716320680</p>
                        <p className="text-gray-600">Email: kaloynujiraka@gmail.com</p>
                        <div className="flex gap-4 mt-4 text-gray-600">
                            <Twitter size={20} />
                            <Facebook size={20} />
                            <Instagram size={20} />
                            <Github size={20} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-center mt-12 text-gray-500 text-sm">
                © Copyright 2024 Lost and Found<br />All Right Reserved
            </div>
        </footer>
    );
}
