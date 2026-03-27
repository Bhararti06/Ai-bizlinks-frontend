import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import dataService from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS_URL } from '../config/apiConfig';
import { toast } from 'react-toastify';
import {
    CheckCircleIcon,
    XCircleIcon,
    UserIcon,
    MapPinIcon,
    EllipsisVerticalIcon,
    EyeIcon,
    PencilSquareIcon,
    NoSymbolIcon,
    TrashIcon,
    PhoneIcon,
    EnvelopeIcon,
    BriefcaseIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import MemberDetailsModal from '../components/MemberDetailsModal';
import MemberEditForm from '../components/MemberEditForm';
import { twMerge } from 'tailwind-merge';

const ManageUsers = () => {
    const navigate = useNavigate();
    const { orgCode } = useParams();
    const { user: currentUser } = useAuth();
    const location = useLocation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    // Check if there's a defaultTab in navigation state, otherwise default to 'approved'
    const [activeTab, setActiveTab] = useState(location.state?.defaultTab || 'approved'); // approved, pending, inactive, deleted, deactivation-pending
    const [deactivationRequests, setDeactivationRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const handleActivate = async (id) => {
        try {
            await dataService.activateUser(id);
            setUsers(users.filter(u => u.id !== id));
            toast.success('User activated');
        } catch (error) {
            toast.error('Activation failed');
        }
    };

    // Modal State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalMode, setModalMode] = useState('view'); // view, edit

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    // Reset to page 1 when search or tab changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeTab]);

    const isExpired = (user) => {
        if (!user || user.status !== 'approved') return false;
        if (!user.membership_renewal_date) return false;
        const renewalDate = new Date(user.membership_renewal_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return renewalDate < today;
    };

    const fetchData = async () => {
        setLoading(true);
        console.log('Fetching data for tab:', activeTab);
        try {
            let res;
            if (activeTab === 'approved') {
                res = await dataService.getApprovedUsers();
                const allApproved = res.data.data || [];
                // ONLY show active (non-expired) members
                setUsers(allApproved.filter(u => !isExpired(u)));
            } else if (activeTab === 'inactive') {
                // Fetch deactivated members
                const deactRes = await dataService.getDeactivatedUsers();
                const deactivated = deactRes.data.data || [];

                // ALSO fetch approved members to find expired ones
                const approvedRes = await dataService.getApprovedUsers();
                const expired = (approvedRes.data.data || []).filter(u => isExpired(u));

                // Combine deactivated + expired
                setUsers([...deactivated, ...expired]);
            } else if (activeTab === 'deleted') {
                res = await dataService.getDeletedUsers();
                setUsers(res.data.data || []);
            } else if (activeTab === 'deactivation-pending') {
                res = await dataService.getPendingDeactivationRequests();
                const requestsData = res.data.data || [];
                setDeactivationRequests(requestsData);
                setUsers([]);
                setLoading(false);
                return;
            }

        } catch (error) {
            console.error('Fetch error:', error);
            let errorMsg = 'Failed to fetch users';

            if (error.response) {
                // Server responded with a status code
                errorMsg = error.response.data?.message || `Server Error(${error.response.status})`;
            } else if (error.request) {
                // Request made but no response
                errorMsg = 'Network Error: No response from server';
            } else {
                // Something else happened
                errorMsg = error.message;
            }

            toast.error(errorMsg, { autoClose: 5000 });
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await dataService.approveUser(id);
            setUsers(users.filter(u => u.id !== id));
            toast.success('User approved');
        } catch (error) {
            toast.error('Approval failed');
        }
    };

    const handleReject = async (id) => {
        try {
            await dataService.rejectUser(id);
            setUsers(users.filter(u => u.id !== id));
            toast.success('User rejected');
        } catch (error) {
            toast.error('Rejection failed');
        }
    };

    const handleDeactivate = async (id) => {
        const reason = prompt('Please provide a reason for deactivation:');
        if (!reason) {
            toast.info('Deactivation cancelled');
            return;
        }

        try {
            const res = await dataService.deactivateUser(id, { reason });

            if (res.data.isPending) {
                // Chapter Admin - request created
                toast.info(res.data.message);
                // Don't remove from list, just refresh
                fetchData();
            } else {
                // Org Admin - directly deactivated
                setUsers(users.filter(u => u.id !== id));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Deactivation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) return;
        try {
            await dataService.deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
            toast.success('User deleted');
        } catch (error) {
            toast.error('Deletion failed');
        }
    };

    const handleUpdateMember = async (id, data) => {
        try {
            await dataService.adminUpdateUser(id, data);
            toast.success('Member details updated');
            setIsDetailsModalOpen(false);
            fetchData(); // Refresh list
        } catch (error) {
            toast.error('Update failed');
        }
    };

    const handleApproveDeactivation = async (requestId) => {
        if (!window.confirm('Approve this deactivation request? The user will be deactivated.')) return;
        try {
            await dataService.approveDeactivationRequest(requestId);
            toast.success('Deactivation request approved');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve request');
        }
    };

    const handleRejectDeactivation = async (requestId) => {
        if (!window.confirm('Reject this deactivation request?')) return;
        try {
            await dataService.rejectDeactivationRequest(requestId);
            toast.success('Deactivation request rejected');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject request');
        }
    };

    const openModal = (user, mode) => {
        setSelectedUser(user);
        setModalMode(mode);
        setIsDetailsModalOpen(true);
    };

    const tabs = [
        { id: 'approved', label: 'All Members' },
        { id: 'inactive', label: 'Deactivated Members' },
        { id: 'deactivation-pending', label: 'Deactivation Requests' },
        { id: 'deleted', label: 'Deleted Members' },
    ];

    // Filter users based on search query
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.chapter && user.chapter.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Pagination logic for approved tab
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = activeTab === 'approved' ? filteredUsers.slice(startIndex, endIndex) : filteredUsers;
    const displayUsers = activeTab === 'approved' ? paginatedUsers : filteredUsers;

    return (
        <div className="space-y-8">
            <div className="premium-card p-8 bg-white">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="animate-fade-in">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Member Directory</h1>
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
                            <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">
                                {filteredUsers.length} {activeTab === 'approved' ? 'Active' : activeTab} members
                            </p>
                        </div>
                    </div>

                    {/* Search Bar - Only show for approved tab */}
                    {activeTab === 'approved' && (
                        <div className="w-full md:w-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search members..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full md:w-80 px-4 py-3 pl-11 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-300 focus:bg-white transition-all"
                                />
                                <svg
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner backdrop-blur-sm self-stretch xl:self-auto overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={twMerge(
                                "px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 uppercase tracking-widest",
                                activeTab === tab.id
                                    ? "bg-white shadow-md text-primary-600 ring-1 ring-slate-100"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 premium-card">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-primary-600 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary-600 animate-ping" />
                        </div>
                    </div>
                    <p className="mt-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Synchronizing</p>
                </div>
            ) : (
                <div className="premium-card transition-all duration-500">
                    {users.length === 0 && activeTab !== 'deactivation-pending' ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-4">
                                <UserIcon className="w-12 h-12 opacity-20" />
                            </div>
                            <p className="text-sm font-bold uppercase tracking-widest opacity-40">No records found</p>
                            <p className="text-[10px] uppercase tracking-tighter mt-2 opacity-30">Tab: {activeTab} | Count: {users.length}</p>
                        </div>
                    ) : activeTab === 'deactivation-pending' ? (
                        <div className="p-6">
                            {deactivationRequests.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-4">
                                        <NoSymbolIcon className="w-12 h-12 opacity-20" />
                                    </div>
                                    <p className="text-sm font-bold uppercase tracking-widest opacity-40">No pending deactivation requests</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {deactivationRequests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="group relative bg-white border-2 border-slate-100 rounded-3xl p-6 hover:border-orange-200 hover:shadow-xl transition-all duration-300"
                                        >
                                            <div className="flex items-start gap-4 mb-6">
                                                <div className="relative flex-shrink-0">
                                                    <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden border-2 border-white shadow-lg ring-2 ring-slate-100 group-hover:ring-orange-200 transition-all">
                                                        {request.user_profile_image ? (
                                                            <img
                                                                src={`${ASSETS_URL}${request.user_profile_image}`}
                                                                alt={request.user_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
                                                                <UserIcon className="w-8 h-8" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-orange-400 border-2 border-white shadow-sm" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-black text-slate-900 mb-1 truncate">
                                                        {request.user_name}
                                                    </h3>
                                                    <p className="text-sm font-semibold text-slate-500 truncate mb-2">
                                                        {request.user_email}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-100">
                                                            Deactivation Pending
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                                        Requested By
                                                    </p>
                                                    <p className="text-sm font-bold text-slate-700">
                                                        {request.requested_by_name} {request.requested_by_chapter && `(${request.requested_by_chapter})`}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                                        Chapter
                                                    </p>
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPinIcon className="w-3.5 h-3.5 text-primary-400" />
                                                        <p className="text-sm font-bold text-slate-700">
                                                            {request.user_chapter || 'Not assigned'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {request.reason && (
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                                            Reason
                                                        </p>
                                                        <p className="text-sm text-slate-600 italic">
                                                            "{request.reason}"
                                                        </p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                                        Requested On
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {new Date(request.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            {currentUser?.role === 'admin' ? (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={() => handleApproveDeactivation(request.id)}
                                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/30"
                                                    >
                                                        <CheckCircleIcon className="w-5 h-5" />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectDeactivation(request.id)}
                                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-red-500/30"
                                                    >
                                                        <XCircleIcon className="w-5 h-5" />
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center py-2 px-4 bg-amber-50 rounded-xl border border-amber-100">
                                                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                                                        Awaiting Admin Approval
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {displayUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="premium-card group hover:shadow-lg transition-all duration-300 border border-slate-100 hover:border-primary-200"
                                >
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 w-full">
                                            <div className="relative flex-shrink-0">
                                                <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden border-2 border-white shadow-sm ring-2 ring-slate-100 group-hover:ring-primary-200 transition-all">
                                                    {user.profile_image ? (
                                                        <img
                                                            src={`${ASSETS_URL}${user.profile_image}`}
                                                            alt={user.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                                            <UserIcon className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={twMerge(
                                                    "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm",
                                                    isExpired(user) ? 'bg-amber-500' :
                                                        user.status === 'approved' ? 'bg-emerald-500' :
                                                            user.status === 'inactive' ? 'bg-red-500' :
                                                                user.status === 'deleted' ? 'bg-gray-500' : 'bg-amber-400'
                                                )} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                    <h3 className="text-[17px] font-black text-slate-900 group-hover:text-primary-600 transition-colors tracking-tight">
                                                        {user.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className={twMerge(
                                                            "inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                                            isExpired(user)
                                                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                                : user.status === 'approved'
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                                    : user.status === 'inactive'
                                                                        ? 'bg-red-50 text-red-700 border-red-100'
                                                                        : user.status === 'deleted'
                                                                            ? 'bg-gray-50 text-gray-700 border-gray-100'
                                                                            : 'bg-amber-50 text-amber-700 border-amber-100'
                                                        )}>
                                                            {isExpired(user) ? 'Membership Expired' : user.status === 'approved' ? 'Active' : user.status}
                                                        </span>

                                                        {user.status === 'approved' && user.created_at && (new Date() - new Date(user.created_at)) / (1000 * 60 * 60) <= 48 && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-primary-50 text-primary-600 border border-primary-100 shadow-sm animate-pulse">
                                                                <span className="w-1 h-1 rounded-full bg-primary-500" />
                                                                New Member
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[13px] text-slate-500">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <EnvelopeIcon className="w-4 h-4 text-slate-400 shrink-0" />
                                                        <span className="font-medium truncate max-w-[150px] sm:max-w-[200px]">{user.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPinIcon className="w-4 h-4 text-slate-400 shrink-0" />
                                                        <span className="font-bold">{user.chapter || 'Global'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-lg">
                                                            {user.category_name || user.category_title || 'Member'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-50 md:ml-4">
                                            <Menu as="div" className="relative inline-block text-left">
                                                <Menu.Button className="p-3 text-slate-400 hover:text-slate-900 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 shadow-sm">
                                                    <EllipsisVerticalIcon className="w-5 h-5" />
                                                </Menu.Button>
                                                <Transition
                                                    as={Fragment}
                                                    enter="transition ease-out duration-200"
                                                    enterFrom="transform opacity-0 scale-95 translate-y-2"
                                                    enterTo="transform opacity-100 scale-100 translate-y-0"
                                                    leave="transition ease-in duration-150"
                                                    leaveFrom="transform opacity-100 scale-100 translate-y-0"
                                                    leaveTo="transform opacity-0 scale-95 translate-y-2"
                                                >
                                                    <Menu.Items className="absolute right-0 mt-3 w-56 origin-top-right bg-white rounded-2xl shadow-2xl border border-slate-100 focus:outline-none z-50 overflow-hidden py-1.5">
                                                        <div className="px-1.5 space-y-0.5">
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <button
                                                                        onClick={() => navigate(`/${orgCode}/admin/members/${user.id}`)}
                                                                        className={twMerge(
                                                                            "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all",
                                                                            active ? "bg-primary-50 text-primary-600" : "text-slate-700"
                                                                        )}
                                                                    >
                                                                        <EyeIcon className={twMerge("h-4 w-4", active ? "text-primary-600" : "text-slate-400")} />
                                                                        View Profile
                                                                    </button>
                                                                )}
                                                            </Menu.Item>
                                                            {activeTab !== 'deleted' && (
                                                                <Menu.Item>
                                                                    {({ active }) => (
                                                                        <button
                                                                            onClick={() => openModal(user, 'edit')}
                                                                            className={twMerge(
                                                                                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all",
                                                                                active ? "bg-primary-50 text-primary-600" : "text-slate-700"
                                                                            )}
                                                                        >
                                                                            <PencilSquareIcon className={twMerge("h-4 w-4", active ? "text-primary-600" : "text-slate-400")} />
                                                                            Modify Details
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                            )}
                                                        </div>

                                                        {(activeTab === 'approved' || activeTab === 'pending') && (
                                                            <div className="px-1.5 pt-1.5 mt-1.5 border-t border-slate-50">
                                                                <Menu.Item>
                                                                    {({ active }) => (
                                                                        <button
                                                                            onClick={() => handleDeactivate(user.id)}
                                                                            className={twMerge(
                                                                                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all",
                                                                                active ? "bg-red-50 text-red-600" : "text-slate-700"
                                                                            )}
                                                                        >
                                                                            <NoSymbolIcon className={twMerge("h-4 w-4", active ? "text-red-500" : "text-slate-400")} />
                                                                            Deactivate
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                            </div>
                                                        )}

                                                        {activeTab === 'inactive' && currentUser?.role === 'admin' && (
                                                            <div className="px-1.5 pt-1.5 mt-1.5 border-t border-slate-50">
                                                                <Menu.Item>
                                                                    {({ active }) => (
                                                                        <button
                                                                            onClick={() => handleActivate(user.id)}
                                                                            className={twMerge(
                                                                                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all",
                                                                                active ? "bg-emerald-50 text-emerald-600" : "text-slate-700"
                                                                            )}
                                                                        >
                                                                            <ArrowPathIcon className={twMerge("h-4 w-4", active ? "text-emerald-500" : "text-slate-400")} />
                                                                            Activate Member
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                            </div>
                                                        )}

                                                        {currentUser?.role === 'admin' && (
                                                            <div className="px-1.5 pt-1.5 mt-1.5 border-t border-slate-50">
                                                                <Menu.Item>
                                                                    {({ active }) => (
                                                                        <button
                                                                            onClick={() => handleDelete(user.id)}
                                                                            className={twMerge(
                                                                                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all",
                                                                                active ? "bg-red-50 text-red-600" : "text-slate-700 hover:text-red-500"
                                                                            )}
                                                                        >
                                                                            <TrashIcon className={twMerge("h-4 w-4", active ? "text-red-500" : "text-slate-400")} />
                                                                            Purge Record
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                            </div>
                                                        )}
                                                    </Menu.Items>
                                                </Transition>
                                            </Menu>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <MemberDetailsModal
                isOpen={isDetailsModalOpen && modalMode === 'view'}
                onClose={() => setIsDetailsModalOpen(false)}
                member={selectedUser}
                mode="view"
                onUpdate={handleUpdateMember}
            />

            <MemberEditForm
                isOpen={isDetailsModalOpen && modalMode === 'edit'}
                onClose={() => setIsDetailsModalOpen(false)}
                memberId={selectedUser?.id}
                onSave={() => {
                    setIsDetailsModalOpen(false);
                    fetchData();
                }}
            />
        </div>
    );
};

export default ManageUsers;
