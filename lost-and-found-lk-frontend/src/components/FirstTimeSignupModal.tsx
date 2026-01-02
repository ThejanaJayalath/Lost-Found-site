import { useState } from 'react';
import { Phone, Shield, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getApiBaseUrl } from '../services/api';
import { Link } from 'react-router-dom';

interface FirstTimeSignupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FirstTimeSignupModal({ isOpen, onClose }: FirstTimeSignupModalProps) {
    const { user, syncUserWithBackend } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const validatePhoneNumber = (phone: string): boolean => {
        // Basic phone validation - accepts digits, spaces, dashes, parentheses, and + sign
        const phoneRegex = /^[\d\s\-+()]+$/;
        const digitsOnly = phone.replace(/\D/g, '');
        return phoneRegex.test(phone) && digitsOnly.length >= 8 && digitsOnly.length <= 15;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!phoneNumber.trim()) {
            setError('Phone number is required');
            return;
        }

        if (!validatePhoneNumber(phoneNumber)) {
            setError('Please enter a valid phone number (8-15 digits)');
            return;
        }

        if (!termsAgreed) {
            setError('You must agree to the Terms and Conditions to continue');
            return;
        }

        if (!user?.email) {
            setError('User email not found. Please try logging in again.');
            return;
        }

        setLoading(true);

        try {
            const apiUrl = getApiBaseUrl();
            const response = await fetch(`${apiUrl}/users/${user.email}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: phoneNumber.trim(),
                    termsAgreed: true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            // Also sync with backend to ensure consistency
            await syncUserWithBackend(user, {
                phoneNumber: phoneNumber.trim(),
                termsAgreed: true,
            });

            onClose();
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div
                className="bg-gray-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-800 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Welcome to TrackBack!</h2>
                            <p className="text-blue-100 text-xs">Complete your profile to get started</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-5 space-y-4">
                        {/* Important Rules Section */}
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-bold text-yellow-400 mb-2">Important Rules</h3>
                                    <ul className="space-y-1.5 text-gray-300 text-xs">
                                        <li className="flex items-start gap-1.5">
                                            <CheckCircle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                                            <span><strong>Verify Before Meeting:</strong> Always verify item details before meeting.</span>
                                        </li>
                                        <li className="flex items-start gap-1.5">
                                            <CheckCircle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                                            <span><strong>Accurate Information:</strong> Provide truthful information when reporting items.</span>
                                        </li>
                                        <li className="flex items-start gap-1.5">
                                            <CheckCircle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                                            <span><strong>Safe Meetings:</strong> Meet in public places and bring a friend.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Privacy Policy Summary */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-bold text-blue-400 mb-1">Privacy & Data Protection</h3>
                                    <p className="text-gray-300 text-xs mb-2">
                                        Your privacy is important. Contact info is only shared when you interact with other users. Sensitive data is encrypted and stored securely.
                                    </p>
                                    <Link
                                        to="/privacy-policy"
                                        target="_blank"
                                        className="text-blue-400 hover:text-blue-300 text-xs font-medium inline-flex items-center gap-1"
                                    >
                                        Read Full Privacy Policy <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Phone Number Input */}
                        <div className="space-y-1.5">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                                Phone Number <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="phone"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="Enter your phone number (e.g., +94 77 123 4567)"
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Terms and Conditions Checkbox */}
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                            <label className="flex items-start gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={termsAgreed}
                                    onChange={(e) => setTermsAgreed(e.target.checked)}
                                    className="mt-0.5 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                    disabled={loading}
                                    required
                                />
                                <div className="flex-1">
                                    <span className="text-gray-300 text-xs">
                                        I agree to the{' '}
                                        <Link
                                            to="/terms-and-conditions"
                                            target="_blank"
                                            className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                                        >
                                            Terms and Conditions <ExternalLink className="w-3 h-3" />
                                        </Link>
                                        {' '}and{' '}
                                        <Link
                                            to="/privacy-policy"
                                            target="_blank"
                                            className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                                        >
                                            Privacy Policy <ExternalLink className="w-3 h-3" />
                                        </Link>
                                        .
                                    </span>
                                </div>
                            </label>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-red-400 text-xs">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-2 pt-3 border-t border-gray-800">
                            <button
                                type="submit"
                                disabled={loading || !phoneNumber.trim() || !termsAgreed}
                                className="w-full py-2.5 px-4 rounded-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                            >
                                {loading ? 'Saving...' : 'Continue'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
