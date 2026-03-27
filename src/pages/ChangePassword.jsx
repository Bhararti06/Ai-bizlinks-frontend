import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { toast } from 'react-toastify';
import {
    KeyIcon,
    ShieldCheckIcon,
    ArrowPathIcon,
    ChevronLeftIcon
} from '@heroicons/react/24/outline';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error('New passwords do not match');
        }

        if (formData.newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            await authService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            toast.success('Password changed successfully');
            navigate('/admin/profile');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-8 px-4">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 font-medium transition-colors"
            >
                <ChevronLeftIcon className="w-4 h-4" />
                Back
            </button>

            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Security</h1>
                <p className="text-gray-500 mt-1">Change your account password securely</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8 border border-blue-100">
                    <ShieldCheckIcon className="w-8 h-8" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <KeyIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50 transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 my-2"></div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <KeyIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50 transition-all font-medium"
                                placeholder="At least 6 characters"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <KeyIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50 transition-all font-medium"
                                placeholder="Confirm your new password"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3.5 rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 font-bold disabled:opacity-50"
                        >
                            {loading ? (
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            ) : (
                                <CheckIcon className="w-5 h-5" />
                            )}
                            Update Password
                        </button>
                    </div>
                </form>

                <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Security Tips</h4>
                    <ul className="text-[11px] text-gray-400 space-y-1 list-disc ml-4">
                        <li>Use a combination of upper and lower case letters</li>
                        <li>Include at least one number or special character</li>
                        <li>Don't reuse passwords from other accounts</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

// Internal icon since it was missing in the header import but referenced
const CheckIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

export default ChangePassword;
