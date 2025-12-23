import React, { useState } from 'react';
import { Lock, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getApiBaseUrl } from '../../services/api';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${getApiBaseUrl()}/auth/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password: password.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store tokens
            localStorage.setItem('adminAccessToken', data.accessToken);
            localStorage.setItem('adminRefreshToken', data.refreshToken);
            
            // Navigate to dashboard
            navigate('/admin/dashboard');
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
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

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

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
                            disabled={loading}
                            className="w-full py-3 text-white rounded-lg font-bold text-lg shadow-lg transform transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: 'linear-gradient(-45deg, #e81cff 0%, #40c9ff 100%)'
                            }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
