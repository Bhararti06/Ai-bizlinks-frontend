import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import { toast } from 'react-toastify';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const NamingConvention = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Store all organization data to preserve other settings when updating
    const [orgData, setOrgData] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        chapterLabel: '',
        meetingLabel: '',
        planLabel: '',
        categoryLabel: ''
    });

    // Saved conventions (displayed in list)
    const [savedConventions, setSavedConventions] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await dataService.getOrgSettings();
            if (res.data.success) {
                const data = res.data.data;
                setOrgData(data); // specific fields: name, admin_name, settings (json/obj)

                // Parse settings
                const settings = typeof data.settings === 'string'
                    ? JSON.parse(data.settings || '{}')
                    : (data.settings || {});

                const naming = settings.naming_convention || {};

                // Set saved conventions
                if (Object.keys(naming).length > 0) {
                    setSavedConventions(naming);
                } else {
                    setSavedConventions(null);
                }
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            // toast.error('Failed to load naming conventions');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete the naming convention? All tabs will revert to their default names.')) {
            return;
        }

        setSubmitting(true);
        try {
            // Prepare update payload
            // Must preserve existing settings but REMOVE naming_convention
            const currentSettings = typeof orgData.settings === 'string'
                ? JSON.parse(orgData.settings || '{}')
                : (orgData.settings || {});

            const updatedSettings = { ...currentSettings };
            delete updatedSettings.naming_convention;

            const payload = {
                name: orgData.name,
                admin_name: orgData.admin_name,
                admin_email: orgData.admin_email,
                contact_number: orgData.contact_number,
                settings: updatedSettings
            };

            await dataService.updateOrgSettings(payload);
            toast.success('Naming convention deleted. Tabs reverted to default.');

            // Update local state
            setSavedConventions(null);

            // Immediate UI update via Context
            if (updateUser) {
                updateUser({ namingConvention: {} });
            }

            // Clear form
            setFormData({
                chapterLabel: '',
                meetingLabel: '',
                planLabel: '',
                categoryLabel: ''
            });

            // Refresh orgData to reflect local changes
            setOrgData({ ...orgData, settings: updatedSettings });

        } catch (error) {
            console.error('Failed to delete:', error);
            toast.error('Failed to delete naming convention');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Prepare update payload
            // Must preserve existing settings
            const currentSettings = typeof orgData.settings === 'string'
                ? JSON.parse(orgData.settings || '{}')
                : (orgData.settings || {});

            const newNamingConventions = {
                chapterLabel: formData.chapterLabel || 'Chapter',
                meetingLabel: formData.meetingLabel || 'Meeting',
                planLabel: formData.planLabel || 'Membership Plan',
                categoryLabel: formData.categoryLabel || 'Membership Category'
            };

            const updatedSettings = {
                ...currentSettings,
                naming_convention: newNamingConventions
            };

            const payload = {
                name: orgData.name,
                admin_name: orgData.admin_name,
                admin_email: orgData.admin_email,
                contact_number: orgData.contact_number,
                settings: updatedSettings
            };

            await dataService.updateOrgSettings(payload);
            toast.success('Naming convention saved successfully');

            // Update local state
            setSavedConventions(newNamingConventions);

            // Immediate UI update via Context
            if (updateUser) {
                updateUser({ namingConvention: newNamingConventions });
            }

            // Clear form to show it moved to list/is saved
            setFormData({
                chapterLabel: '',
                meetingLabel: '',
                planLabel: '',
                categoryLabel: ''
            });

            // Refresh orgData
            setOrgData({ ...orgData, settings: updatedSettings });

        } catch (error) {
            console.error('Failed to save:', error);
            toast.error('Failed to save naming convention');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({
            chapterLabel: '',
            meetingLabel: '',
            planLabel: '',
            categoryLabel: ''
        });
    };

    const handleEdit = () => {
        if (savedConventions) {
            setFormData({
                chapterLabel: savedConventions.chapterLabel || '',
                meetingLabel: savedConventions.meetingLabel || '',
                planLabel: savedConventions.planLabel || '',
                categoryLabel: savedConventions.categoryLabel || ''
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Naming Convention</h1>
                    <p className="text-sm text-gray-500">Define custom labels for key terms across your organization portal</p>
                </div>
            </div>

            {/* 1. Form Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-50 px-8 py-5">
                    <h2 className="text-lg font-bold text-gray-900">Organization Naming Convention</h2>
                </div>
                <div className="p-8">
                    <form onSubmit={handleCreate}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <label className="text-xs uppercase font-bold tracking-widest text-gray-400 ml-1">
                                    Alternative Label for Chapter
                                </label>
                                <input
                                    type="text"
                                    name="chapterLabel"
                                    value={formData.chapterLabel}
                                    onChange={handleChange}
                                    placeholder="e.g. Branch, Group"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-gray-50/50 hover:bg-white transition-all shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold tracking-widest text-gray-400 ml-1">
                                    Alternative Label for Meeting
                                </label>
                                <input
                                    type="text"
                                    name="meetingLabel"
                                    value={formData.meetingLabel}
                                    onChange={handleChange}
                                    placeholder="e.g. Session, Gathering"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-gray-50/50 hover:bg-white transition-all shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold tracking-widest text-gray-400 ml-1">
                                    Alternative Label for Membership Plan
                                </label>
                                <input
                                    type="text"
                                    name="planLabel"
                                    value={formData.planLabel}
                                    onChange={handleChange}
                                    placeholder="e.g. Subscription Tier"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-gray-50/50 hover:bg-white transition-all shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold tracking-widest text-gray-400 ml-1">
                                    Alternative Label for Membership Category
                                </label>
                                <input
                                    type="text"
                                    name="categoryLabel"
                                    value={formData.categoryLabel}
                                    onChange={handleChange}
                                    placeholder="e.g. Industry, Sector"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-gray-50/50 hover:bg-white transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex gap-4 justify-end">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-6 py-3 text-sm text-gray-500 hover:text-gray-900 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-all active:scale-95"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-10 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-200 active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? (savedConventions ? 'Updating...' : 'Saving...') : (savedConventions ? 'Update' : 'Create')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* 2. List Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-50 px-8 py-5">
                    <h2 className="text-lg font-bold text-gray-900">Alternative Name List</h2>
                </div>
                <div className="p-0">
                    {!savedConventions ? (
                        <div className="p-8 text-center text-gray-500">
                            No naming conventions defined yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50">
                                    <tr className="text-[11px] uppercase text-gray-400 font-bold tracking-widest border-b border-gray-50">
                                        <th className="px-8 py-4">Chapter Name Label</th>
                                        <th className="px-8 py-4">Meeting Name Label</th>
                                        <th className="px-8 py-4">Membership Plan Label</th>
                                        <th className="px-8 py-4">Membership Category Label</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    <tr className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 text-sm font-bold text-gray-900">
                                            {savedConventions.chapterLabel || 'Chapter'}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-semibold text-gray-600">
                                            {savedConventions.meetingLabel || 'Meeting'}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-semibold text-gray-600">
                                            {savedConventions.planLabel || 'Membership Plan'}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-semibold text-gray-600">
                                            {savedConventions.categoryLabel || 'Membership Category'}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={handleEdit}
                                                    className="p-2 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-xl transition-all active:scale-95"
                                                    title="Edit"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={handleDelete}
                                                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all active:scale-95"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default NamingConvention;
