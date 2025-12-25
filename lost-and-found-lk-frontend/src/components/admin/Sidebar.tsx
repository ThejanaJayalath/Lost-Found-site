
import { useState } from 'react';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X } from 'lucide-react';
import Logo from '../../components/Logo';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: 'overview' | 'tracks' | 'meta' | 'roles') => void;
    handleLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, handleLogout }: SidebarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const menuItems = [
        { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'tracks', label: 'Tracks', icon: <Users size={20} /> },
        { id: 'meta', label: 'Meta', icon: <FileText size={20} /> },
        { id: 'roles', label: 'Roles', icon: <Settings size={20} /> },
    ];

    const handleTabClick = (tab: 'overview' | 'tracks' | 'meta' | 'roles') => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false); // Close mobile menu when tab is selected
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#1E1E1E] border border-gray-800 rounded-lg text-white"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:sticky top-0 left-0 z-40
                w-64 bg-[#1E1E1E] h-screen flex flex-col border-r border-gray-800
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                    <Logo />
                </div>

                <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleTabClick(item.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.id
                                    ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/10 text-orange-400 border border-orange-500/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span className={`${activeTab === item.id ? 'text-orange-400' : 'text-gray-400 group-hover:text-white'}`}>
                                {item.icon}
                            </span>
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </div>
        </>
    );
}
