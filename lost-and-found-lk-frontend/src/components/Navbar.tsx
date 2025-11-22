import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-[#FDFDF5] px-8 py-4 relative z-50">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-orange-100 rounded-md flex items-center justify-center border border-orange-200">
                        {/* Placeholder for logo icon */}
                        <span className="text-xl">📦</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-xl tracking-wide text-gray-800">I FOUND</span>
                        <span className="text-[0.6rem] text-gray-500 uppercase tracking-wider">Lost Items, Found People</span>
                    </div>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 font-medium text-gray-700">
                    <Link to="/" className="hover:text-gray-900">Home</Link>
                    <Link to="/lost" className="hover:text-gray-900">Lost</Link>
                    <Link to="/found" className="hover:text-gray-900">Found</Link>
                    <Link to="/profile" className="hover:text-gray-900">Profile</Link>
                </div>

                <div className="hidden md:block">
                    <button className="flex items-center gap-2 px-6 py-2 bg-gray-200 rounded-full text-gray-700 hover:bg-gray-300 transition-colors">
                        Sign Out
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-700"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 py-4 px-8 flex flex-col gap-4">
                    <Link to="/" className="text-gray-700 hover:text-gray-900 py-2" onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link to="/lost" className="text-gray-700 hover:text-gray-900 py-2" onClick={() => setIsMenuOpen(false)}>Lost</Link>
                    <Link to="/found" className="text-gray-700 hover:text-gray-900 py-2" onClick={() => setIsMenuOpen(false)}>Found</Link>
                    <Link to="/profile" className="text-gray-700 hover:text-gray-900 py-2" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                    <button className="w-full text-left py-2 text-red-500 font-medium">
                        Sign Out
                    </button>
                </div>
            )}
        </nav>
    );
}
