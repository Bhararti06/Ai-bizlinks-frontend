import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import dataService from '../services/dataService';
import { toast } from 'react-toastify';
import {
    PlusIcon,
    EyeIcon,
    XMarkIcon,
    PencilSquareIcon,
    IdentificationIcon,
    BuildingOfficeIcon,
    EnvelopeIcon,
    PhoneIcon,
    ChatBubbleLeftEllipsisIcon,
    CurrencyRupeeIcon,
    CheckCircleIcon,
    InboxIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS_URL } from '../config/apiConfig';

const References = () => {
    const { user } = useAuth();
    const location = useLocation();
    const activeRole = localStorage.getItem('activeRole');
    const isActingAsChapterAdmin = user?.role === 'chapter_admin' && activeRole !== 'member';
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    const [references, setReferences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewModal, setViewModal] = useState({ isOpen: false, data: null });
    const [statusModal, setStatusModal] = useState({ isOpen: false, data: null });
    const [statusForm, setStatusForm] = useState({ status: '', business_done_amount: '' });
    const [settings, setSettings] = useState(null);

    // activeTab: 'received' or 'sent'
    let initialTab = location.state?.tab || 'received';
    if (initialTab !== 'received' && initialTab !== 'sent') initialTab = 'received';
    const [activeTab, setActiveTab] = useState(initialTab);

    // Update tab when location state changes
    useEffect(() => {
        if (location.state?.tab) {
            let tab = location.state.tab;
            if (tab !== 'received' && tab !== 'sent') tab = 'received';
            setActiveTab(tab);
        }
    }, [location.state]);

    useEffect(() => {
        fetchSettings();
        fetchReferences();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await dataService.getOrgSettings();
            if (res.data.success) {
                const orgSettings = typeof res.data.data.settings === 'string'
                    ? JSON.parse(res.data.data.settings || '{}')
                    : (res.data.data.settings || {});
                setSettings(orgSettings);
            }
        } catch (error) {
            console.error('Failed to load settings');
        }
    };

    const fetchReferences = async () => {
        try {
            setLoading(true);
            let res;
            if (user?.role === 'admin') {
                res = await dataService.getReferences();
            } else {
                res = await dataService.getReceivedReferrals();
            }
            const allData = res.data.data;
            const filteredData = allData.filter(ref => ref.referral_flag !== '0');
            setReferences(filteredData);
        } catch (error) {
            console.error('Failed to load references', error);
            toast.error('Failed to load referrals');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (e) => {
        e.preventDefault();

        if (statusForm.status === 'Business Done') {
            if (!statusForm.business_done_amount || parseFloat(statusForm.business_done_amount) <= 0) {
                toast.error('Business Done Amount is required');
                return;
            }
        }

        try {
            await dataService.updateReference(statusModal.data.id, {
                ...statusModal.data,
                status: statusForm.status,
                business_done_amount: statusForm.status === 'Business Done' ? statusForm.business_done_amount : 0
            });
            toast.success('Status updated successfully');
            fetchReferences();
            setStatusModal({ isOpen: false, data: null });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">Chapter Referrals</h1>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Status and management for your chapter's referrals</p>
                </div>
                {isActingAsChapterAdmin && (
                    <div className="flex p-1 bg-gray-100 rounded-xl overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('received')}
                            className={clsx(
                                "px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                activeTab === 'received' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            Received Referrals
                        </button>
                        <button
                            onClick={() => setActiveTab('sent')}
                            className={clsx(
                                "px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                activeTab === 'sent' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            Sent Referrals
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex flex-1 items-center justify-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-gray-100/50">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-[#4eb7f5]"></div>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex-1 flex flex-col">
                    {references.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <InboxIcon className="w-10 h-10 opacity-20" />
                            </div>
                            <p className="text-xl font-black uppercase tracking-widest opacity-30 italic px-8 text-center">No referrals received yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="min-w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Referred By</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Referred To</th>
                                        {(!isActingAsChapterAdmin || settings?.referralDataChapterAdmin !== false) && (
                                            <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Client Name</th>
                                        )}
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                        {(!isActingAsChapterAdmin || settings?.referralDataChapterAdmin !== false) && (
                                            <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">VIEW ACTION</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {references.filter(ref => {
                                        if (!isActingAsChapterAdmin) return true;
                                        
                                        const userChap = String(user?.chapter || '').trim().toLowerCase();
                                        const recChap = String(ref.receiver_chapter || '').trim().toLowerCase();
                                        const senChap = String(ref.sender_chapter || '').trim().toLowerCase();

                                        if (activeTab === 'received') {
                                            // Handle cases where SQL returned it successfully but JS strict match fails
                                            return recChap === userChap || (!recChap && senChap !== userChap); 
                                        } else if (activeTab === 'sent') {
                                            return senChap === userChap;
                                        }
                                        return true;
                                    }).map((ref) => (
                                        <tr key={ref.id} className="group hover:bg-gray-50/50 transition-all duration-300">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-white overflow-hidden border-2 border-white shadow-lg ring-2 ring-slate-100 group-hover:ring-primary-200 transition-all flex items-center justify-center">
                                                        {ref.created_by_image ? (
                                                            <img
                                                                src={`${ASSETS_URL}${ref.created_by_image}`}
                                                                alt={ref.created_by_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                                                <UserIcon className="w-6 h-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 leading-tight">{ref.created_by_name}</p>
                                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter italic">Source Member</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-800 tracking-tight">{ref.receiver_name || ref.referred_to}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 italic">Recipient</span>
                                                </div>
                                            </td>
                                            {(!isActingAsChapterAdmin || settings?.referralDataChapterAdmin !== false) && (
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-gray-800 tracking-tight">{ref.reference_name}</span>
                                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{ref.ref_organization_name}</span>
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-8 py-6">
                                                <span className={clsx(
                                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                                    ref.status === 'Business Done' ? "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm" :
                                                        ref.status === 'Closed' ? "bg-gray-50 text-gray-500 border-gray-100" :
                                                            "bg-blue-50 text-blue-700 border-blue-100 shadow-sm shadow-blue-50"
                                                )}>
                                                    <div className={clsx("w-1.5 h-1.5 rounded-full",
                                                        ref.status === 'Business Done' ? "bg-emerald-500 animate-pulse" :
                                                            ref.status === 'Closed' ? "bg-gray-400" : "bg-blue-500"
                                                    )} />
                                                    {ref.status || 'Open'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-[13px] font-bold text-gray-600">
                                                {new Date(ref.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            {(!isActingAsChapterAdmin || settings?.referralDataChapterAdmin !== false) && (
                                                <td className="px-8 py-6 text-right space-x-2">
                                                    <button
                                                        onClick={() => setViewModal({ isOpen: true, data: ref })}
                                                        className="p-2 bg-white border border-gray-200 text-gray-400 rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all shadow-sm active:scale-95"
                                                        title="View Details"
                                                    >
                                                        <EyeIcon className="w-5 h-5" />
                                                    </button>
                                                    {(ref.referred_to === user.name && user.role !== 'admin') && (
                                                        <button
                                                            onClick={() => {
                                                                setStatusModal({ isOpen: true, data: ref });
                                                                setStatusForm({
                                                                    status: ref.status || 'Open',
                                                                    business_done_amount: ref.business_done_amount || ''
                                                                });
                                                            }}
                                                            className="p-2 bg-[#4eb7f5] text-white rounded-xl hover:bg-[#3da6e4] transition-all shadow-lg shadow-blue-100 active:scale-95"
                                                            title="Update Status"
                                                        >
                                                            <PencilSquareIcon className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Premium Centralized Modal Container */}
            {(mounted && (viewModal.isOpen || statusModal.isOpen)) && createPortal(
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative border border-gray-100/50">
                        {/* Global Close Button */}
                        <button
                            onClick={() => {
                                setViewModal({ isOpen: false, data: null });
                                setStatusModal({ isOpen: false, data: null });
                            }}
                            className="absolute top-4 right-6 z-10 p-2 rounded-2xl bg-white/20 text-white hover:bg-white/30 transition-all active:scale-90 shadow-sm border border-white/20"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>

                        {/* View Content */}
                        {viewModal.isOpen && (
                            <div className="animate-in zoom-in-95 duration-400">
                                <div className="bg-gradient-to-r from-[#4eb7f5] to-[#3da6e4] px-6 py-6 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md border border-white/20">
                                            <EyeIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white tracking-tight italic">Referral Details</h2>
                                            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Comprehensive log</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                        {(!isActingAsChapterAdmin || settings?.referralDataChapterAdmin !== false) && (
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-[#4eb7f5] uppercase tracking-widest block ml-1">Client Name</label>
                                                <p className="text-sm font-black text-gray-900 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">{viewModal.data?.reference_name}</p>
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-[#4eb7f5] uppercase tracking-widest block ml-1">Organization</label>
                                            <p className="text-sm font-black text-gray-900 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">{viewModal.data?.ref_organization_name || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1 flex items-center gap-1.5">
                                                <EnvelopeIcon className="w-3 h-3 text-[#4eb7f5]" />
                                                Email Address
                                            </label>
                                            <p className="text-[13px] font-bold text-gray-800 px-1 ml-1">{viewModal.data?.contact_email || 'Not provided'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1 flex items-center gap-1.5">
                                                <PhoneIcon className="w-3 h-3 text-[#4eb7f5]" />
                                                Contact Number
                                            </label>
                                            <p className="text-[13px] font-bold text-gray-800 px-1 ml-1">{viewModal.data?.contact_phone || 'Not provided'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Source Member</label>
                                            <p className="text-[13px] font-black text-blue-600 px-1 ml-1 italic">{viewModal.data?.created_by_name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Date Received</label>
                                            <p className="text-[13px] font-bold text-gray-800 px-1 ml-1">{new Date(viewModal.data?.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Referred To</label>
                                            <p className="text-[13px] font-black text-emerald-600 px-1 ml-1 italic">{viewModal.data?.receiver_name || viewModal.data?.referred_to || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {viewModal.data?.description && (
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1 flex items-center gap-1.5">
                                                <ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5 text-[#4eb7f5]" />
                                                Notes & Context
                                            </label>
                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 italic relative">
                                                <p className="text-[13px] font-medium text-gray-700 leading-relaxed px-2">
                                                    {viewModal.data.description}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {viewModal.data?.status === 'Business Done' && (
                                        <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-100 flex items-center justify-between">
                                            <div>
                                                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block ml-1">Revenue Generated</label>
                                                <div className="flex items-center gap-1 text-xl font-black text-emerald-900 mt-1">
                                                    <CurrencyRupeeIcon className="w-5 h-5" />
                                                    {parseFloat(viewModal.data.business_done_amount || 0).toLocaleString('en-IN')}
                                                </div>
                                            </div>
                                            <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 rotate-6 transition-transform hover:rotate-0">
                                                <CheckCircleIcon className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Modal Footer Close Button */}
                                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                                        <button
                                            onClick={() => setViewModal({ isOpen: false, data: null })}
                                            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200"
                                        >
                                            Close Detail
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Status Content */}
                        {statusModal.isOpen && (
                            <div className="p-10 animate-in zoom-in-95 duration-400">
                                <div className="mb-10">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight italic">Update Status</h3>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Manage the lifecycle of this referral</p>
                                </div>

                                <form onSubmit={handleStatusUpdate} className="space-y-8">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Current Status</label>
                                                <select
                                                    value={statusForm.status}
                                                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
                                                >
                                                    <option value="Open">Open</option>
                                                    <option value="Contacted">Contacted</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Business Done">Business Done</option>
                                                    <option value="Closed">Closed</option>
                                                </select>
                                            </div>

                                            {statusForm.status === 'Business Done' && (
                                                <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Business Done Amount (₹)</label>
                                                    <div className="relative">
                                                        <CurrencyRupeeIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type="number"
                                                            value={statusForm.business_done_amount}
                                                            onChange={(e) => setStatusForm({ ...statusForm, business_done_amount: e.target.value })}
                                                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-6 border-t border-gray-50">
                                        <button
                                            type="button"
                                            onClick={() => setStatusModal({ isOpen: false, data: null })}
                                            className="flex-1 px-8 py-4 bg-gray-50 text-gray-500 rounded-[1.5rem] text-[13px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-8 py-4 bg-[#4eb7f5] text-white rounded-[1.5rem] text-[13px] font-black uppercase tracking-widest hover:bg-[#3da6e4] transition-all shadow-xl shadow-blue-100 active:scale-95"
                                        >
                                            Update Referral
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default References;
