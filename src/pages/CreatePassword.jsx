import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout';

const CreatePassword = () => {
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Get email from URL params if available
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        // Validate password strength
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/create-password', {
                email,
                password
            });

            toast.success(response.data.message || 'Password created successfully!');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Create Password">
            <div className="mb-6">
                <p className="text-sm text-gray-600 text-center">
                    Your account has been approved! Please create a password to complete your registration.
                </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-500 mb-1">
                        Email Address <span className="text-red-500">*</span> :
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        required
                        className="block w-full rounded border border-gray-300 py-2 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-primary-600"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-xs font-medium text-gray-500 mb-1">
                        Password <span className="text-red-500">*</span> :
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Password (min 8 characters)"
                        required
                        className="block w-full rounded border border-gray-300 py-2 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-primary-600"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-500 mb-1">
                        Confirm Password <span className="text-red-500">*</span> :
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                        required
                        className="block w-full rounded border border-gray-300 py-2 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-primary-600"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="rounded bg-[#81D4FA] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#4FC3F7]"
                    >
                        Back to Login
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded bg-[#4FC3F7] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#29B6F6] disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Password'}
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
};

export default CreatePassword;
