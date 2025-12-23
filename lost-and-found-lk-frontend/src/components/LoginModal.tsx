import { useState } from 'react';
import { X, Mail, Lock } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToSignup: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }: LoginModalProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { googleSignIn } = useAuth();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Admin login removed - use /admin/login page instead

            await signInWithEmailAndPassword(auth, email, password);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError('Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            setLoading(true);
            await googleSignIn();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError('Failed to sign in with Google.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="magic-box w-full max-w-md">
                <div className="bg-[#1c1c1c] rounded-[20px] w-full h-full relative overflow-hidden flex flex-col">
                    <div className="p-6 flex justify-between items-center relative z-10">
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#e81cff] to-[#40c9ff]">Welcome Back</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-8 pt-2 relative z-10">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#40c9ff] transition-colors" size={20} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-10 p-3 bg-[#2d2d2d] border border-gray-700 rounded-lg focus:border-[#40c9ff] focus:ring-1 focus:ring-[#40c9ff] outline-none text-white placeholder-gray-600 transition-all"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#40c9ff] transition-colors" size={20} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-10 p-3 bg-[#2d2d2d] border border-gray-700 rounded-lg focus:border-[#40c9ff] focus:ring-1 focus:ring-[#40c9ff] outline-none text-white placeholder-gray-600 transition-all"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                style={{
                                    background: 'linear-gradient(-45deg, #e81cff 0%, #40c9ff 100%)'
                                }}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-[#1c1c1c] text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <button
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="w-full mt-4 py-3 bg-[#2d2d2d] border border-gray-700 text-gray-300 font-medium rounded-lg hover:bg-[#363636] hover:border-gray-600 transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-.19-.58z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Sign in with Google
                            </button>
                        </div>

                        <div className="mt-6 text-center text-sm text-gray-500">
                            Don't have an account?{' '}
                            <button onClick={onSwitchToSignup} className="text-[#40c9ff] font-medium hover:underline">
                                Sign up
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
