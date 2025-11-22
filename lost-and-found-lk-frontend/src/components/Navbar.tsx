import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
    onOpenLogin: () => void;
    onOpenSignup: () => void;
}

export default function Navbar({ onOpenLogin, onOpenSignup }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            setIsMenuOpen(false);
        } catch (error) {
            console.error('Failed to logout', error);
        }
    };

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
                    {user && <Link to="/profile" className="hover:text-gray-900">Profile</Link>}
                </div>

                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">Hi, {user.displayName || 'User'}</span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-6 py-2 bg-gray-200 rounded-full text-gray-700 hover:bg-gray-300 transition-colors"
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={onOpenLogin}
                                className="text-gray-700 hover:text-gray-900 font-medium"
                            >
                                Login
                            </button>
                            <button
                                onClick={onOpenSignup}
                                className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                            >
                                Sign Up
                            </button>
                        </>
                    )}
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
                    {user && <Link to="/profile" className="text-gray-700 hover:text-gray-900 py-2" onClick={() => setIsMenuOpen(false)}>Profile</Link>}

                    <div className="border-t border-gray-100 pt-4 mt-2">
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="w-full text-left py-2 text-red-500 font-medium flex items-center gap-2"
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        onOpenLogin();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-center py-2 border border-gray-200 rounded-lg text-gray-700 font-medium"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => {
                                        onOpenSignup();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-center py-2 bg-red-500 text-white rounded-lg font-medium shadow-lg shadow-red-500/30"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
