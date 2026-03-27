import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Cog6ToothIcon, ClipboardDocumentCheckIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import CreateOrganizationModal from '../../components/SuperAdmin/CreateOrganizationModal';
import { OrganizationSettings } from '../../pages/AdminPlaceholders';
import { XMarkIcon } from '@heroicons/react/24/outline';

const SuperAdminOrganizations = () => {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [selectedOrgId, setSelectedOrgId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrganizations = async () => {
        setLoading(true);
        try {
            const res = await api.get('/super-admin/organizations');
            if (res.data.success) {
                setOrganizations(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch organizations", error);
            toast.error("Failed to load organizations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const handleCreateSuccess = (newOrg) => {
        fetchOrganizations(); // Refresh list
    };

    // Filter organizations
    const filteredOrgs = organizations.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.admin_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.admin_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Create Organization
                    </button>

                    {/* Search Mockup */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 p-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#56B3FA]">
                            {/* Blue header based on screenshot kind of, though screenshot is white with blue header text? No, screenshot has blue header background on table. */}
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Organization</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Owner</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Link</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrgs.map((org) => (
                                <tr key={org.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{org.admin_name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{org.admin_email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const subDomain = org.sub_domain || org.name.toLowerCase().replace(/\s+/g, '-');
                                                const dynamicLink = `${window.location.origin}/register-user?org=${subDomain}`;
                                                return (
                                                    <>
                                                        <a href={dynamicLink} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-blue-600 truncate block max-w-xs">
                                                            {dynamicLink}
                                                        </a>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(dynamicLink);
                                                                toast.success('Signup link copied!');
                                                            }}
                                                            className="text-gray-400 hover:text-blue-500 transition-colors"
                                                            title="Copy Signup URL"
                                                        >
                                                            <ClipboardDocumentCheckIcon className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-4">
                                            <a
                                                href={`/${org.sub_domain || org.name.toLowerCase().replace(/\s+/g, '-')}/admin/dashboard`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-green-500 hover:text-green-700 transition-colors"
                                                title="View Dashboard"
                                            >
                                                <ChartBarIcon className="w-5 h-5" />
                                            </a>
                                            <button
                                                onClick={() => {
                                                    setSelectedOrgId(org.id);
                                                    setIsSettingsModalOpen(true);
                                                }}
                                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                                title="Settings"
                                            >
                                                <Cog6ToothIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrgs.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                                        {loading ? 'Loading...' : 'No organizations found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateOrganizationModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            {/* Settings Modal */}
            {isSettingsModalOpen && selectedOrgId && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white z-10">
                            <h3 className="text-lg font-bold text-slate-800">Organization Configuration</h3>
                            <button
                                onClick={() => setIsSettingsModalOpen(false)}
                                className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6 text-slate-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-0 bg-slate-50">
                            <div className="transform scale-90 origin-top">
                                <OrganizationSettings
                                    organizationId={selectedOrgId}
                                    onClose={() => setIsSettingsModalOpen(false)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminOrganizations;
