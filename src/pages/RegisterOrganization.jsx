import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const RegisterOrganization = () => {
    const [formData, setFormData] = useState({
        organizationName: '',
        adminName: '',
        adminEmail: '',
    });
    const [loading, setLoading] = useState(false);
    const { registerOrganization } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log('Registering organization - Sending request:', formData);
            const response = await registerOrganization(formData);
            console.log('Registering organization - Full Response received:', response);

            if (response.success || response.organizationId) {
                console.log('Registration marked as success, showing toast');
                toast.success('Organization registered successfully. Admin will set password on first login.');

                // Add a small delay for the toast to be seen before navigating
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                console.warn('Response received but success flag missing:', response);
                toast.error('Registration might have failed. Please check.');
            }
        } catch (error) {
            console.error('Registration frontend error caught:', error);
            const errMsg = error.response?.data?.message || 'Registration failed. Please check your connection.';
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Register New Organization
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md glass p-8 rounded-2xl shadow-xl">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="organizationName" className="block text-sm font-medium leading-6 text-gray-900">
                            Organization Name
                        </label>
                        <div className="mt-2">
                            <input
                                id="organizationName"
                                name="organizationName"
                                type="text"
                                required
                                className="block w-full rounded-md border border-gray-300 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                                value={formData.organizationName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="adminName" className="block text-sm font-medium leading-6 text-gray-900">
                            Admin Name
                        </label>
                        <div className="mt-2">
                            <input
                                id="adminName"
                                name="adminName"
                                type="text"
                                required
                                className="block w-full rounded-md border border-gray-300 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                                value={formData.adminName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="adminEmail" className="block text-sm font-medium leading-6 text-gray-900">
                            Admin Email
                        </label>
                        <div className="mt-2">
                            <input
                                id="adminEmail"
                                name="adminEmail"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full rounded-md border border-gray-300 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                                value={formData.adminEmail}
                                onChange={handleChange}
                            />
                        </div>
                    </div>



                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Registering...' : 'Register Organization'}
                        </button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold leading-6 text-primary-600 hover:text-primary-500">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterOrganization;
