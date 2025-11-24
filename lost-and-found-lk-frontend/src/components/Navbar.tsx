import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, LogOut, LogIn, User, Info, MessageSquare, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

interface NavbarProps {
    onOpenLogin: () => void;
    onOpenSignup: () => void;
}

export default function Navbar({ onOpenLogin }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, logout } = useAuth();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const handleLogoutClick = () => {
        setIsDropdownOpen(false);
        setShowLogoutConfirm(true);
        setIsMenuOpen(false);
    };

    const confirmLogout = async () => {
        try {
            await logout();
            setShowLogoutConfirm(false);
        } catch (error) {
            console.error('Failed to logout', error);
        }
    };

    return (
        <>
            <nav className="bg-transparent absolute top-0 left-0 right-0 z-50 px-8 py-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    {/* Logo Section */}
                    <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                        <Logo />
                    </Link>

                    {/* Desktop Menu - Centered */}
                    <div className="hidden md:flex items-center gap-12 font-medium text-gray-300 absolute left-1/2 transform -translate-x-1/2">
                        <Link to="/" className="hover:text-white transition-colors text-sm uppercase tracking-wide">Home</Link>
                        <Link to="/lost" className="hover:text-white transition-colors text-sm uppercase tracking-wide">Lost</Link>
                        <Link to="/found" className="hover:text-white transition-colors text-sm uppercase tracking-wide">Found</Link>
                        {user && <Link to="/profile" className="hover:text-white transition-colors text-sm uppercase tracking-wide">Profile</Link>}
                    </div>

                    {/* Right Side - User/Auth */}
                    <div className="hidden md:flex items-center gap-6">
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-3 focus:outline-none group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold neon-avatar transition-colors overflow-hidden">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                                        ) : (
                                            user.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'U'
                                        )}
                                    </div>
                                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-4 w-64 z-50">
                                        <div className="magic-box w-full">
                                            <div className="bg-[#1c1c1c] rounded-xl overflow-hidden p-2">
                                                <div className="p-3 border-b border-gray-800 mb-2">
                                                    <p className="text-white font-medium truncate">{user.displayName || 'User'}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                </div>

                                                <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                                    <User size={18} />
                                                    <span>Profile</span>
                                                </Link>
                                                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left">
                                                    <Info size={18} />
                                                    <span>About Us</span>
                                                </button>
                                                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left">
                                                    <MessageSquare size={18} />
                                                    <span>Feedback</span>
                                                </button>
                                                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left">
                                                    <Shield size={18} />
                                                    <span>Privacy Policies</span>
                                                </button>

                                                <div className="h-px bg-gray-800 my-2"></div>

                                                <button
                                                    onClick={handleLogoutClick}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                                                >
                                                    <LogOut size={18} />
                                                    <span>Sign Out</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={onOpenLogin}
                                className="flex items-center gap-2 px-6 py-2.5 text-white rounded-full text-sm font-medium shadow-[0_0_20px_rgba(64,201,255,0.3)] hover:shadow-[0_0_25px_rgba(64,201,255,0.5)] transition-all transform hover:scale-105"
                                style={{
                                    background: 'linear-gradient(-45deg, #e81cff 0%, #40c9ff 100%)'
                                }}
                            >
                                <LogIn size={16} />
                                Sign In
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-300 hover:text-white"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 shadow-2xl py-6 px-8 flex flex-col gap-6 z-50">
                        <Link to="/" className="text-gray-300 hover:text-white py-2 text-lg" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/lost" className="text-gray-300 hover:text-white py-2 text-lg" onClick={() => setIsMenuOpen(false)}>Lost</Link>
                        <Link to="/found" className="text-gray-300 hover:text-white py-2 text-lg" onClick={() => setIsMenuOpen(false)}>Found</Link>
                        {user && <Link to="/profile" className="text-gray-300 hover:text-white py-2 text-lg" onClick={() => setIsMenuOpen(false)}>Profile</Link>}

                        <div className="border-t border-gray-800 pt-6 mt-2">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-3 mb-6 px-2">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold neon-avatar overflow-hidden">
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                                            ) : (
                                                user.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'U'
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{user.displayName || 'User'}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogoutClick}
                                        className="w-full text-center py-3 bg-red-500/10 text-red-400 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
                                    >
                                        <LogOut size={20} />
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        onOpenLogin();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-center py-3 text-white rounded-lg font-medium shadow-lg flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(64,201,255,0.4)] transition-all"
                                    style={{
                                        background: 'linear-gradient(-45deg, #e81cff 0%, #40c9ff 100%)'
                                    }}
                                >
                                    <LogIn size={20} />
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
                    <div className="magic-box w-full max-w-sm">
                        <div className="bg-[#1c1c1c] rounded-[20px] w-full relative overflow-hidden flex flex-col p-6 text-center">
                            <h3 className="text-xl font-bold text-white mb-2">Sign Out?</h3>
                            <p className="text-gray-400 mb-6">Are you sure you want to sign out of your account?</p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 py-2.5 bg-[#2d2d2d] hover:bg-[#363636] text-white rounded-lg font-medium transition-colors border border-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 py-2.5 text-white rounded-lg font-medium transition-transform transform hover:scale-105 shadow-lg"
                                    style={{
                                        background: 'linear-gradient(-45deg, #e81cff 0%, #40c9ff 100%)'
                                    }}
                                >
                                    Yes, Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
