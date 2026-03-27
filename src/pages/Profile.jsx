import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS_URL } from '../config/apiConfig';
import { toast } from 'react-toastify';
import api from '../services/api';
import {
    UserIcon,
    ArrowLeftIcon,
    BuildingOfficeIcon,
    CameraIcon
} from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';

const Profile = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [selectedTab, setSelectedTab] = useState(0);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/profile');
            setProfileData(res.data.data);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            toast.error('Failed to load profile');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const endpoint = type === 'profile' ? '/users/profile-image' : '/users/company-logo';

            const res = await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setProfileData(prev => ({
                ...prev,
                [type === 'profile' ? 'profile_image' : 'company_logo']: res.data.data[type === 'profile' ? 'profile_image' : 'company_logo'] || res.data.imageUrl
            }));

            toast.success(`${type === 'profile' ? 'Profile' : 'Company'} image uploaded successfully`);

            if (refreshUser) {
                await refreshUser();
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Failed to upload ${type} image`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Personal and corporate fields
            const updateData = {
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                dob: profileData.dob,
                gender: profileData.gender,
                email: profileData.email,
                contact_number: profileData.contact_number,
                country: profileData.country,
                state: profileData.state,
                city: profileData.city,
                zip_code: profileData.zip_code,
                address: profileData.address,
                company_name: profileData.company_name,
                company_title: profileData.company_title,
                company_linkedin: profileData.company_linkedin,
                company_email: profileData.company_email,
                company_website: profileData.company_website,
                company_size: profileData.company_size,
                company_contact: profileData.company_contact,
                company_country: profileData.company_country,
                company_state: profileData.company_state,
                company_city: profileData.company_city,
                company_zip: profileData.company_zip,
                company_address: profileData.company_address
            };

            await api.put('/users/me', updateData);

            toast.success('Profile updated successfully');

            if (refreshUser) {
                await refreshUser();
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!profileData) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Role-based tabs: Admin no membership, Chapter Admin includes membership
    const tabs = user?.role === 'chapter_admin'
        ? ['Personal', 'Corporate', 'Membership']
        : ['Personal', 'Corporate'];

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
                <div className="w-20"></div>
            </div>

            {/* Profile Header Card */}
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl bg-white/20 overflow-hidden flex items-center justify-center backdrop-blur-sm">
                            {profileData.profile_image ? (
                                <img
                                    src={`${ASSETS_URL}${profileData.profile_image}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserIcon className="w-12 h-12 text-white" />
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-white text-primary-600 p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-all shadow-lg">
                            <CameraIcon className="w-4 h-4" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'profile')}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold">{profileData.name || 'N/A'}</h2>
                        <p className="text-primary-100 mt-1">{profileData.email}</p>
                        <p className="text-primary-200 text-sm mt-2">
                            {profileData.role?.replace('_', ' ').toUpperCase()} • {profileData.status?.toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabbed Form */}
            <form onSubmit={handleSubmit}>
                <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                    <Tab.List className="flex space-x-2 bg-gray-100 p-1 rounded-xl">
                        {tabs.map((tab) => (
                            <Tab
                                key={tab}
                                className={({ selected }) =>
                                    `flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all ${selected
                                        ? 'bg-white text-primary-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`
                                }
                            >
                                {tab}
                            </Tab>
                        ))}
                    </Tab.List>

                    <Tab.Panels className="mt-6">
                        {/* Personal Tab */}
                        <Tab.Panel className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={profileData.first_name || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={profileData.last_name || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={profileData.dob || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                                    <select
                                        name="gender"
                                        value={profileData.gender || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                                    <input
                                        type="tel"
                                        name="contact_number"
                                        value={profileData.contact_number || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={profileData.address || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={profileData.city || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={profileData.state || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={profileData.country || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
                                    <input
                                        type="text"
                                        name="zip_code"
                                        value={profileData.zip_code || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </div>
                        </Tab.Panel>

                        {/* Corporate Tab */}
                        <Tab.Panel className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Corporate Information</h3>
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                                        {profileData.company_logo ? (
                                            <img
                                                src={`${ASSETS_URL}${profileData.company_logo}`}
                                                alt="Company Logo"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-primary-700 transition-all shadow-lg">
                                        <CameraIcon className="w-3 h-3" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, 'company')}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                                    <input
                                        type="text"
                                        name="company_name"
                                        value={profileData.company_name || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        name="company_title"
                                        value={profileData.company_title || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn</label>
                                    <input
                                        type="url"
                                        name="company_linkedin"
                                        value={profileData.company_linkedin || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company Email</label>
                                    <input
                                        type="email"
                                        name="company_email"
                                        value={profileData.company_email || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                                    <input
                                        type="url"
                                        name="company_website"
                                        value={profileData.company_website || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company Size</label>
                                    <input
                                        type="text"
                                        name="company_size"
                                        value={profileData.company_size || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company Contact</label>
                                    <input
                                        type="tel"
                                        name="company_contact"
                                        value={profileData.company_contact || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company Address</label>
                                    <input
                                        type="text"
                                        name="company_address"
                                        value={profileData.company_address || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company City</label>
                                    <input
                                        type="text"
                                        name="company_city"
                                        value={profileData.company_city || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company State</label>
                                    <input
                                        type="text"
                                        name="company_state"
                                        value={profileData.company_state || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company Country</label>
                                    <input
                                        type="text"
                                        name="company_country"
                                        value={profileData.company_country || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company ZIP</label>
                                    <input
                                        type="text"
                                        name="company_zip"
                                        value={profileData.company_zip || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </div>
                        </Tab.Panel>

                        {/* Membership Tab (Read-only) */}
                        <Tab.Panel className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                                <p className="text-sm text-blue-900 font-semibold">
                                    ℹ️ Membership details are managed by administrators and cannot be edited.
                                </p>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Membership Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-500 mb-2">Plan & Category</label>
                                    <p className="text-gray-900 font-medium">{profileData.plan_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-500 mb-2">Chapter</label>
                                    <p className="text-gray-900 font-medium">{profileData.chapter || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-500 mb-2">Status</label>
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${profileData.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        profileData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {profileData.status?.toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-500 mb-2">Joined Date</label>
                                    <p className="text-gray-900 font-medium">
                                        {profileData.membership_start_date ? new Date(profileData.membership_start_date).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || selectedTab === 2}
                        className="flex-1 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
