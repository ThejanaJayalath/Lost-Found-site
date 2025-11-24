import React, { useState } from 'react';
import { Lock, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        console.log('Attempting login with:', { email, password }); // Debug log

        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();

        // TODO: Implement actual admin authentication logic here
        if (cleanEmail === 'admin@example.com' && cleanPassword === 'admin123') {
            console.log('Login successful');
            localStorage.setItem('adminToken', 'true'); // Set auth token
            navigate('/admin/dashboard');
        } else {
            console.log('Login failed. Expected: admin@example.com / admin123');
            alert('Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <div className="w-full max-w-md bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                            <Shield className="text-blue-500" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
                        <p className="text-gray-400">Enter your credentials to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#2d2d2d] border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Enter email"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#2d2d2d] border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 text-white rounded-lg font-bold text-lg shadow-lg transform transition-transform hover:scale-[1.02]"
                            style={{
                                background: 'linear-gradient(-45deg, #e81cff 0%, #40c9ff 100%)'
                            }}
                        >
                            Sign In
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
