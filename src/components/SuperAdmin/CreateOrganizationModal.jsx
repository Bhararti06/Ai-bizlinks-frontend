import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Toggle = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between py-3">
        <span className="text-sm text-gray-700">{label}</span>
        <button
            type="button"
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${checked ? 'bg-primary-600' : 'bg-gray-200'}`}
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
    </div>
);

const CreateOrganizationModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        organizationName: '',
        adminName: '', // Owner Name
        contact: '',
        adminEmail: '', // Email
        subDomain: '',
        settings: {
            memberOnboardingAuthority: false,
            postsDisplayWithinChapter: false,
            trainingsPostDisplayWithinChapter: false,
            referralDataDisplayToChapterAdmin: false,
            eventsPostDisplayWithinChapter: false,
            createMeetingsWithinChapter: false,
            giveReferralWithinChapter: false
        }
    });
    const [loading, setLoading] = useState(false);
    const [createdOrg, setCreatedOrg] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSettingChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            settings: { ...prev.settings, [key]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/super-admin/organizations', formData);
            if (res.data.success) {
                toast.success('Organization created successfully! Admin will set password on first login.');
                // Store created org details for display
                setCreatedOrg({
                    ...res.data.data
                    // link is already in res.data.data from the backend controller
                });

                // We do NOT call onSuccess/onClose immediately anymore
            }
        } catch (error) {
            console.error("Failed to create org", error);
            toast.error(error.response?.data?.message || "Failed to create organization");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSuccess = () => {
        onSuccess(createdOrg);
        onClose();
        setCreatedOrg(null);
        setFormData({
            organizationName: '',
            adminName: '',
            contact: '',
            adminEmail: '',
            subDomain: '',
            settings: {
                memberOnboardingAuthority: false,
                postsDisplayWithinChapter: false,
                trainingsPostDisplayWithinChapter: false,
                referralDataDisplayToChapterAdmin: false,
                eventsPostDisplayWithinChapter: false,
                createMeetingsWithinChapter: false,
                giveReferralWithinChapter: false
            }
        });
    };

    if (createdOrg) {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                    <div className="text-center mb-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <span className="text-2xl">✓</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Organization Registered Successfully!</h3>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                        <div>
                            <span className="text-sm text-gray-500 block">Organization Name</span>
                            <span className="text-sm font-medium text-gray-900">{createdOrg.organizationName}</span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 block">Organization URL</span>
                            {(() => {
                                const subDomain = createdOrg.subDomain || createdOrg.organizationName?.toLowerCase().replace(/\s+/g, '-') || 'org';
                                const dynamicLink = `${window.location.origin}/login?org=${subDomain}`;
                                return (
                                    <span className="text-sm font-medium text-blue-600 break-all">{dynamicLink}</span>
                                );
                            })()}
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                            <span className="text-sm text-xs font-semibold text-gray-500 uppercase block mb-2">Admin Credentials</span>
                            <div>
                                <span className="text-sm text-gray-500 block">UID (Email)</span>
                                <span className="text-sm font-medium text-gray-900">{createdOrg.adminEmail}</span>
                            </div>
                            <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-3">
                                <span className="text-xs text-blue-700 font-medium">Admin will set password on first login</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={handleCloseSuccess}
                            className="w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900">Create an Organization</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Organization *</label>
                            <input
                                type="text"
                                name="organizationName"
                                value={formData.organizationName}
                                onChange={handleChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                                placeholder="Enter organization name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                            <input
                                type="text"
                                name="adminName"
                                value={formData.adminName}
                                onChange={handleChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                                placeholder="Enter owner name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact *</label>
                            <input
                                type="text"
                                name="contact"
                                value={formData.contact}
                                onChange={handleChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                                placeholder="Enter contact number"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                name="adminEmail"
                                value={formData.adminEmail}
                                onChange={handleChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                                placeholder="Enter email"
                                required
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Domain Name *</label>
                            <input
                                type="text"
                                name="subDomain"
                                value={formData.subDomain}
                                onChange={handleChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                                placeholder="Enter domain name"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Settings (Optional)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                            <Toggle
                                label="Member Onboarding Authority For Chapter Admin (Y/N)"
                                checked={formData.settings.memberOnboardingAuthority}
                                onChange={(val) => handleSettingChange('memberOnboardingAuthority', val)}
                            />
                            <Toggle
                                label="Events Post Display Within Chapter Only (Y/N)"
                                checked={formData.settings.eventsPostDisplayWithinChapter}
                                onChange={(val) => handleSettingChange('eventsPostDisplayWithinChapter', val)}
                            />
                            <Toggle
                                label="Posts Display Within Chapter Only (Y/N)"
                                checked={formData.settings.postsDisplayWithinChapter}
                                onChange={(val) => handleSettingChange('postsDisplayWithinChapter', val)}
                            />
                            <Toggle
                                label="Create Meetings Within Chapter Members Only (Y/N)"
                                checked={formData.settings.createMeetingsWithinChapter}
                                onChange={(val) => handleSettingChange('createMeetingsWithinChapter', val)}
                            />
                            <Toggle
                                label="Trainings Post Display Within Chapter Only (Y/N)"
                                checked={formData.settings.trainingsPostDisplayWithinChapter}
                                onChange={(val) => handleSettingChange('trainingsPostDisplayWithinChapter', val)}
                            />
                            <Toggle
                                label="Give Referral Within Chapter Members Only (Y/N)"
                                checked={formData.settings.giveReferralWithinChapter}
                                onChange={(val) => handleSettingChange('giveReferralWithinChapter', val)}
                            />
                            <Toggle
                                label="Referral Data Display To The Chapter Admin (Y/N)"
                                checked={formData.settings.referralDataDisplayToChapterAdmin}
                                onChange={(val) => handleSettingChange('referralDataDisplayToChapterAdmin', val)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, organizationName: '', adminName: '', contact: '', adminEmail: '', subDomain: '' })}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-400 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateOrganizationModal;
