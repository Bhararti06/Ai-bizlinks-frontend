import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import AuthLayout from '../components/AuthLayout';
import api from '../services/api';

const Login = () => {
    const [step, setStep] = useState(1); // 1 = email, 2 = password, 3 = create password
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [userInfo, setUserInfo] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Trigger role selection if they are already authenticated as chapter admin
    // but haven't selected an active role yet (caught by PublicRoute)
    useEffect(() => {
        if (user && user.role === 'chapter_admin' && !localStorage.getItem('activeRole')) {
            setStep(4);
            setLoggedInUser(user);
        }
    }, [user]);

    // Store organization context from URL parameter
    useEffect(() => {
        console.log('=== LOGIN PAGE LOAD ===');
        console.log('Current URL:', window.location.href);
        const searchParams = new URLSearchParams(location.search);
        const orgIdentifier = searchParams.get('org');
        console.log('Extracted org parameter:', orgIdentifier);

        if (orgIdentifier) {
            localStorage.setItem('orgContext', orgIdentifier);
            console.log('Stored orgContext in localStorage:', orgIdentifier);
        } else {
            console.log('No org parameter found in URL');
        }

        console.log('Current localStorage.orgContext:', localStorage.getItem('orgContext'));
        console.log('=== LOGIN PAGE LOAD END ===');
    }, [location]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/validate-email', {
                email: formData.email
            });

            if (response.data.success) {
                setUserInfo(response.data.data);

                // Check if password is set
                if (!response.data.data.passwordSet) {
                    // Show password creation step
                    setStep(3);
                } else {
                    // Move to password step
                    setStep(2);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Email validation failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await login(formData.email, formData.password);

            // Check if password setup is required (backward compatibility)
            if (res?.requirePasswordSetup) {
                setStep(3);
                return;
            }

            toast.success('Login successful');

            const userRole = res?.data?.user?.role;
            const userEmail = res?.data?.user?.email;
            const orgPrefix = res?.data?.user?.subDomain || res?.data?.user?.organizationName;

            setLoggedInUser(res.data.user);

            if (userRole === 'chapter_admin') {
                setStep(4);
                return;
            }

            // Super Admin Verification Check
            if (userEmail === 'superadmin@bizlinks.in' || userRole === 'super_admin') {
                navigate('/super-admin/dashboard');
            } else if (userRole === 'admin') {
                navigate(`/${orgPrefix}/admin/dashboard`);
            } else {
                navigate(`/${orgPrefix}/userDashboard`);
            }
        } catch (error) {
            // Check if error is specifically about password not being set
            if (error.response?.data?.requirePasswordSetup) {
                setStep(3);
            } else {
                toast.error(error.response?.data?.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePasswordSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        // Validate password strength
        if (formData.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/create-password', {
                email: formData.email,
                password: formData.newPassword
            });

            toast.success(response.data.message || 'Password created successfully!');

            // Auto-login after password creation
            const res = await login(formData.email, formData.newPassword);
            toast.success('Login successful');

            // Redirection logic
            const userRole = res?.data?.user?.role;
            const userEmail = res?.data?.user?.email;
            const orgPrefix = res?.data?.user?.subDomain || res?.data?.user?.organizationName;

            setLoggedInUser(res.data.user);

            if (userRole === 'chapter_admin') {
                setStep(4);
                return;
            }

            if (userEmail === 'superadmin@bizlinks.in' || userRole === 'super_admin') {
                navigate('/super-admin/dashboard');
            } else if (userRole === 'admin') {
                navigate(`/${orgPrefix}/admin/dashboard`);
            } else {
                navigate(`/${orgPrefix}/userDashboard`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create password');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToEmail = () => {
        setStep(1);
        setFormData({ email: formData.email, password: '', newPassword: '', confirmPassword: '' });
        setUserInfo(null);
    };

    const handleRoleSelection = (selectedRole) => {
        localStorage.setItem('activeRole', selectedRole);
        const targetUser = loggedInUser || user;
        if (targetUser) {
            const orgPrefix = targetUser.subDomain || targetUser.organizationName;
            if (selectedRole === 'chapter_admin') {
                navigate(`/${orgPrefix}/admin/dashboard`);
            } else {
                navigate(`/${orgPrefix}/userDashboard`);
            }
        }
    };

    return (
        <AuthLayout>
            {step === 1 ? (
                // Step 1: Email Input
                <form className="space-y-6" onSubmit={handleEmailSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-500 mb-1">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter email"
                            autoComplete="email"
                            required
                            className="block w-full rounded-md border border-gray-200 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-1 focus:ring-primary-600 sm:text-sm px-4"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-[#2196F3] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Validating...' : 'Continue'}
                        </button>
                    </div>

                    Don't have an account?{' '}
                    <Link to={`/register-user${location.search}`} className="font-semibold text-primary-500 hover:text-primary-600">
                        Sign up
                    </Link>
                </form>
            ) : step === 2 ? (
                // Step 2: Password Input
                <form className="space-y-6" onSubmit={handlePasswordSubmit}>
                    <div>
                        <label className="block text-sm font-medium leading-6 text-gray-700 mb-1">
                            Signing in as
                        </label>
                        <div className="flex items-center justify-between bg-gray-50 rounded-md px-4 py-2.5 border border-gray-200">
                            <span className="text-sm text-gray-900">{formData.email}</span>
                            <button
                                type="button"
                                onClick={handleBackToEmail}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Change
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-500 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Password"
                                autoComplete="current-password"
                                required
                                className="block w-full rounded-md border border-gray-200 py-2.5 pr-10 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-1 focus:ring-primary-600 sm:text-sm px-4"
                                value={formData.password}
                                onChange={handleChange}
                                autoFocus
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-4 w-4" />
                                ) : (
                                    <EyeIcon className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <Link to="/forgot-password" size="sm" className="text-sm font-medium text-primary-500 hover:text-primary-600">
                            Forgot Password?
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-md bg-[#2196F3] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                        >
                        </button>
                    </div>
                </form>
            ) : step === 3 ? (
                // Step 3: Create Password
                <form className="space-y-6" onSubmit={handleCreatePasswordSubmit}>
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-700 font-medium">
                            Please create a password to complete your registration
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium leading-6 text-gray-700 mb-1">
                            Account
                        </label>
                        <div className="flex items-center justify-between bg-gray-50 rounded-md px-4 py-2.5 border border-gray-200">
                            <span className="text-sm text-gray-900">{formData.email}</span>
                            <button
                                type="button"
                                onClick={handleBackToEmail}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Change
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium leading-6 text-gray-500 mb-1">
                            New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="newPassword"
                                name="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Enter new password (min 8 characters)"
                                required
                                className="block w-full rounded-md border border-gray-200 py-2.5 pr-10 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-1 focus:ring-primary-600 sm:text-sm px-4"
                                value={formData.newPassword}
                                onChange={handleChange}
                                autoFocus
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? (
                                    <EyeSlashIcon className="h-4 w-4" />
                                ) : (
                                    <EyeIcon className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-500 mb-1">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                required
                                className="block w-full rounded-md border border-gray-200 py-2.5 pr-10 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-1 focus:ring-primary-600 sm:text-sm px-4"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeSlashIcon className="h-4 w-4" />
                                ) : (
                                    <EyeIcon className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-[#2196F3] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Creating Password...' : 'Create Password & Sign In'}
                        </button>
                    </div>
                </form>
            ) : step === 4 ? (
                // Step 4: Role Selection for Chapter Admin
                <div className="space-y-6">
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800 font-medium text-center">
                            You have dual roles in this organization. How would you like to proceed?
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <button
                            type="button"
                            onClick={() => handleRoleSelection('chapter_admin')}
                            className="w-full rounded-md bg-green-500 px-6 py-4 text-white shadow-sm hover:bg-green-600 flex flex-col items-center justify-center gap-1 transition-colors"
                        >
                            <span className="text-lg font-bold">Chapter Admin</span>
                            <span className="text-sm font-normal opacity-90">Manage Chapter & View Reports</span>
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => handleRoleSelection('member')}
                            className="w-full rounded-md bg-[#2196F3] px-6 py-4 text-white shadow-sm hover:bg-blue-600 flex flex-col items-center justify-center gap-1 transition-colors"
                        >
                            <span className="text-lg font-bold">Member</span>
                            <span className="text-sm font-normal opacity-90">Network & Personal Dashboard</span>
                        </button>
                    </div>
                </div>
            ) : null}
        </AuthLayout>
    );
};

export default Login;
