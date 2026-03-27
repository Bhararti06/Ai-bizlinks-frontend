import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import dataService from '../services/dataService';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS_URL } from '../config/apiConfig';
import { toast } from 'react-toastify';
import {
    EyeIcon,
    ChatBubbleOvalLeftEllipsisIcon as CommentIcon,
    PencilSquareIcon,
    XMarkIcon,
    PaperAirplaneIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const ReferralsSent = () => {
    const { user } = useAuth();
    const activeRole = localStorage.getItem('activeRole');
    const isActingAsChapterAdmin = user?.role === 'chapter_admin' && activeRole !== 'member';
    const [referrals, setReferrals] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterName, setFilterName] = useState('');
    const [settings, setSettings] = useState(null);

    // Modal States
    const [viewModal, setViewModal] = useState({ isOpen: false, data: null });
    const [commentModal, setCommentModal] = useState({ isOpen: false, data: null, comments: [], newComment: '' });
    const [editModal, setEditModal] = useState({ isOpen: false, data: null });
    const [sendModal, setSendModal] = useState({ isOpen: false });

    // Form states for Send/Edit
    const [formData, setFormData] = useState({
        referredTo: '',
        referralName: '',
        email: '',
        contactNo: '',
        companyName: '',
        referralDescription: '',
        referralFlag: 'Select Flag',
        status: 'Open',
        businessDoneAmount: ''
    });

    useEffect(() => {
        fetchSettings();
        fetchReferrals();
        fetchMembers();
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

    const fetchReferrals = async () => {
        try {
            const res = await dataService.getSentReferrals();
            setReferrals(res.data.data.filter(ref => ref.referral_flag !== '0'));
        } catch (error) {
            toast.error('Failed to load referrals');
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const res = await dataService.getUsers();
            let allMembers = res.data.data.filter(u => u.status === 'approved');

            // Apply "Give Referral Within Chapter Members Only" setting
            // Note: settings might not be loaded yet on first mount, so we check if it's there
            // If it's not there, we'll re-run or handle it. Better to fetch settings first.
            setMembers(allMembers);
        } catch (error) {
            console.error('Failed to load members');
        }
    };

    // Re-filter members when settings or user data changes
    useEffect(() => {
        if (settings && members.length > 0) {
            if (settings.referralChapterOnly && user?.chapter) {
                setMembers(prev => prev.filter(m => m.chapter === user.chapter));
            }
        }
    }, [settings]);

    const handleSendReferral = async (e) => {
        e.preventDefault();
        console.log("Submitting referral...", formData);
        try {
            const payload = {
                referenceName: formData.referralName, // Mapping to backend field
                refOrganizationName: formData.companyName,
                contactEmail: formData.email,
                contactPhone: formData.contactNo,
                description: formData.referralDescription,
                referralFlag: formData.referralFlag === 'Select Flag' ? '' : formData.referralFlag,
                referredTo: formData.referredTo
            };
            console.log("Payload:", payload);
            await dataService.createReference(payload);
            toast.success('Referral sent successfully');
            setSendModal({ isOpen: false });
            resetForm();
            fetchReferrals();
        } catch (error) {
            console.error("Submission error:", error);
            toast.error('Failed to send referral');
        }
    };

    const handleEditReferral = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                reference_name: formData.referralName,
                ref_organization_name: formData.companyName,
                contact_email: formData.email,
                contact_phone: formData.contactNo,
                description: formData.referralDescription,
                status: formData.status,
                referral_flag: formData.referralFlag,
                referred_to: formData.referredTo,
                business_done_amount: formData.businessDoneAmount
            };
            await dataService.updateReference(editModal.data.id, payload);
            toast.success('Referral updated successfully');
            setEditModal({ isOpen: false, data: null });
            fetchReferrals();
        } catch (error) {
            console.error("Update error:", error);
            const msg = error.response?.data?.message || 'Failed to update referral';
            toast.error(msg);
        }
    };

    const fetchComments = async (referralId) => {
        try {
            const res = await dataService.getReferralComments(referralId);
            setCommentModal(prev => ({ ...prev, comments: res.data.data }));
        } catch (error) {
            console.error('Failed to load comments');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentModal.newComment.trim()) return;
        try {
            await dataService.addReferralComment(commentModal.data.id, commentModal.newComment);
            setCommentModal(prev => ({ ...prev, newComment: '' }));
            fetchComments(commentModal.data.id);
        } catch (error) {
            toast.error('Failed to add comment');
        }
    };

    const resetForm = () => {
        setFormData({
            referredTo: '',
            referralName: '',
            email: '',
            contactNo: '',
            companyName: '',
            referralDescription: '',
            referralFlag: 'Select Flag',
            status: 'Open',
            businessDoneAmount: ''
        });
    };

    const openEdit = (ref) => {
        setFormData({
            referredTo: ref.referred_to || '',
            referralName: ref.reference_name || '',
            email: ref.contact_email || '',
            contactNo: ref.contact_phone || '',
            companyName: ref.ref_organization_name || '',
            referralDescription: ref.description || '',
            referralFlag: ref.referral_flag || 'Select Flag',
            status: ref.status || 'Open',
            businessDoneAmount: ref.business_done_amount || ''
        });
        setEditModal({ isOpen: true, data: ref });
    };

    const filteredReferrals = referrals.filter(ref => {
        const matchesSearch = (ref.reference_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ref.referred_to || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = (ref.referred_to || '').toLowerCase().includes(filterName.toLowerCase());
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">Referral Send</h1>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Track and manage business opportunities you've shared</p>
                </div>
                {!isActingAsChapterAdmin && (
                    <button
                        onClick={() => { resetForm(); setSendModal({ isOpen: true }); }}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-gray-200 hover:bg-[#4eb7f5] transition-all active:scale-95"
                    >
                        <PaperAirplaneIcon className="w-5 h-5 shadow-sm shadow-white/20" />
                        Send a Referral
                    </button>
                )}
            </div>

            {/* Premium Controls */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="relative flex-1 max-w-xl">
                    <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, organization or referred member..."
                        className="w-full bg-gray-50 border border-transparent rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-gray-100 focus:bg-white focus:border-gray-200 transition-all shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        Total Sent: {referrals.length}
                    </div>
                </div>
            </div>

            {/* Premium Table Content */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex-1 flex flex-col">
                {filteredReferrals.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <PaperAirplaneIcon className="w-10 h-10 opacity-20" />
                        </div>
                        <p className="text-xl font-black uppercase tracking-widest opacity-30 italic px-8 text-center">No referrals sent yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="min-w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {isActingAsChapterAdmin && (
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Referred By</th>
                                    )}
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Referred To</th>
                                    {(!isActingAsChapterAdmin || settings?.referralDataChapterAdmin !== false) && (
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Client Name</th>
                                    )}
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">VIEW ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredReferrals.map((ref) => (
                                    <tr key={ref.id} className="group hover:bg-gray-50/50 transition-all duration-300">
                                        {isActingAsChapterAdmin && (
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden">
                                                        {ref.created_by_image ? (
                                                            <img src={`${ASSETS_URL}${ref.created_by_image}`} alt={ref.created_by_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserIcon className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-700">{ref.created_by_name}</span>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white overflow-hidden border-2 border-white shadow-lg ring-2 ring-slate-100 group-hover:ring-primary-200 transition-all flex items-center justify-center">
                                                    {ref.receiver_image ? (
                                                        <img
                                                            src={`${ASSETS_URL}${ref.receiver_image}`}
                                                            alt={ref.receiver_name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                                            <UserIcon className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 leading-tight">{ref.receiver_name || ref.referred_to}</p>
                                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter italic">Member</p>
                                                </div>
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
                                                    ref.status === 'Business Done' ? "bg-emerald-500" :
                                                        ref.status === 'Closed' ? "bg-gray-400" : "bg-blue-500"
                                                )} />
                                                {ref.status || 'Open'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-[13px] font-bold text-gray-600">
                                            {new Date(ref.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-6 text-right space-x-2">
                                            {(!isActingAsChapterAdmin || settings?.referralDataChapterAdmin !== false) && (
                                                <button
                                                    onClick={() => { setViewModal({ isOpen: true, data: ref }); setCommentModal({ isOpen: false }); }}
                                                    className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all active:scale-95"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { setCommentModal({ isOpen: true, data: ref, comments: [], newComment: '' }); setViewModal({ isOpen: false }); fetchComments(ref.id); }}
                                                className="p-3 text-gray-400 hover:text-[#4eb7f5] hover:bg-blue-50 rounded-2xl transition-all active:scale-95"
                                                title="View Comments"
                                            >
                                                <CommentIcon className="w-5 h-5" />
                                            </button>
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => openEdit(ref)}
                                                    className="p-3 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all active:scale-95"
                                                    title="Edit Referral"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Inline sections removed - now using modals below */}

            {/* Modals for Edit, Send, View and Comments (Centered pop-ups) */}
            {(editModal.isOpen || sendModal.isOpen || viewModal.isOpen || commentModal.isOpen) && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-gray-100">
                        {/* Global Close Button */}
                        <button
                            onClick={() => {
                                setEditModal({ isOpen: false, data: null });
                                setSendModal({ isOpen: false });
                                setViewModal({ isOpen: false, data: null });
                                setCommentModal({ isOpen: false, data: null, comments: [], newComment: '' });
                            }}
                            className={clsx(
                                "absolute top-6 right-8 z-10 p-2 rounded-2xl bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 transition-all active:scale-90 shadow-sm",
                                (viewModal.isOpen || commentModal.isOpen) ? "text-white/80 hover:text-white hover:bg-white/10" : ""
                            )}
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        {/* View Content */}
                        {viewModal.isOpen && (
                            <div className="animate-in zoom-in-95 duration-400">
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-10 py-8 mb-4">
                                    <div className="flex items-center gap-4 text-white">
                                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
                                            <EyeIcon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black italic tracking-tight">Referral Details</h2>
                                            <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest">Business opportunity overview</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-10 space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block ml-1">Referred To</label>
                                            <p className="text-xl font-black text-gray-900 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100">{viewModal.data?.receiver_name || viewModal.data?.referred_to}</p>
                                        </div>
                                        {(!isActingAsChapterAdmin || settings?.referralDataChapterAdmin !== false) && (
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block ml-1">Client Name</label>
                                                <p className="text-xl font-black text-gray-900 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100">{viewModal.data?.reference_name}</p>
                                            </div>
                                        )}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Company Name</label>
                                            <p className="text-[15px] font-bold text-gray-800 px-1 ml-1">{viewModal.data?.ref_organization_name || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Status</label>
                                            <div className="pt-1">
                                                <span className={clsx(
                                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                                    viewModal.data?.status === 'Business Done' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                        "bg-blue-50 text-blue-700 border-blue-100"
                                                )}>
                                                    <div className={clsx("w-1.5 h-1.5 rounded-full", viewModal.data?.status === 'Business Done' ? "bg-emerald-500" : "bg-blue-500")} />
                                                    {viewModal.data?.status || 'Open'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Description / Notes</label>
                                        <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 italic relative">
                                            <p className="text-[15px] font-medium text-gray-700 leading-relaxed px-2">
                                                {viewModal.data?.description || 'No notes provided.'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-8 border-t border-gray-100">
                                        <button onClick={() => setViewModal({ isOpen: false, data: null })} className="px-10 py-4 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all hover:bg-gray-800 active:scale-95 shadow-lg">Close View</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Comment Content */}
                        {commentModal.isOpen && (
                            <div className="animate-in zoom-in-95 duration-400">
                                <div className="bg-gradient-to-r from-[#4eb7f5] to-[#3da6e4] px-10 py-8 mb-4">
                                    <div className="flex items-center gap-4 text-white">
                                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
                                            <CommentIcon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black italic tracking-tight">Timeline</h2>
                                            <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest">Discussion & updates log</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-10">
                                    <div className="min-h-[300px] max-h-[500px] overflow-y-auto mb-10 pr-4 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-gray-200">
                                        {commentModal.comments.length === 0 ? (
                                            <div className="flex flex-1 flex-col items-center justify-center py-20 text-gray-400">
                                                <p className="text-sm font-black uppercase tracking-widest opacity-20 italic">No activity recorded yet</p>
                                            </div>
                                        ) : (
                                            commentModal.comments.map(c => (
                                                <div key={c.id} className={clsx("max-w-[85%] rounded-[1.5rem] p-5 shadow-sm relative transition-all", c.user_id === user.id ? "ml-auto bg-blue-50 text-blue-900 border border-blue-100" : "mr-auto bg-gray-50 text-gray-800 border border-gray-100")}>
                                                    <div className="flex justify-between items-center mb-2 gap-8">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">{c.author_name}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                    <p className="text-sm leading-relaxed font-bold">{c.comment}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <form onSubmit={handleAddComment} className="flex gap-4 items-center">
                                        <input
                                            type="text"
                                            value={commentModal.newComment}
                                            onChange={(e) => setCommentModal(prev => ({ ...prev, newComment: e.target.value }))}
                                            placeholder="Add a comment or update..."
                                            className="flex-1 bg-gray-50 rounded-2xl border-transparent border-0 px-6 py-4 text-sm focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all shadow-inner"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!commentModal.newComment.trim()}
                                            className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 disabled:opacity-20 transition-all shadow-lg active:scale-95"
                                        >
                                            Post
                                        </button>
                                    </form>

                                    <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end">
                                        <button
                                            onClick={() => setCommentModal({ isOpen: false, data: null, comments: [], newComment: '' })}
                                            className="px-10 py-4 bg-gray-100 text-gray-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                                        >
                                            Close Timeline
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Edit/Send Forms */}
                        {(editModal.isOpen || sendModal.isOpen) && (
                            <div className="p-10 animate-in zoom-in-95 duration-400">
                                <div className="mb-10">
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight italic">
                                        {editModal.isOpen ? 'Edit Referral' : 'Send Referral'}
                                    </h2>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                        {editModal.isOpen ? 'Modify shared opportunity details' : 'Share a new business lead'}
                                    </p>
                                </div>

                                <form onSubmit={editModal.isOpen ? handleEditReferral : handleSendReferral} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Referred To Member</label>
                                            <select
                                                required
                                                disabled={editModal.isOpen}
                                                value={formData.referredTo}
                                                onChange={(e) => setFormData({ ...formData, referredTo: e.target.value })}
                                                className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                                            >
                                                <option value="">Select a member</option>
                                                {members.map(m => (
                                                    <option key={m.id} value={m.name}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Client Full Name</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. John Doe"
                                                value={formData.referralName}
                                                onChange={(e) => setFormData({ ...formData, referralName: e.target.value })}
                                                className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Contact Number</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. +91 99999 00000"
                                                value={formData.contactNo}
                                                onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                                                className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Priority Level</label>
                                            <select
                                                value={formData.referralFlag}
                                                onChange={(e) => setFormData({ ...formData, referralFlag: e.target.value })}
                                                className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                                            >
                                                <option value="Select Flag">Select Level</option>
                                                <option value="Hot">Hot (High)</option>
                                                <option value="Warm">Warm (Medium)</option>
                                                <option value="Cold">Cold (Low)</option>
                                            </select>
                                        </div>
                                        <div className="col-span-1 md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Company / Organization</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Acme Corp"
                                                value={formData.companyName}
                                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Additional Notes</label>
                                            <textarea
                                                rows="3"
                                                placeholder="Provide any context to help the receiver..."
                                                value={formData.referralDescription}
                                                onChange={(e) => setFormData({ ...formData, referralDescription: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all shadow-sm resize-none h-32"
                                            />
                                        </div>
                                        {editModal.isOpen && (
                                            <div className="col-span-1 md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Current Status</label>
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-6 py-5 border border-gray-100 italic">
                                                    <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                                                        {formData.status || 'Open'}
                                                    </span>
                                                    <p className="text-[11px] font-bold text-gray-400">Status updates are restricted to the receiver only.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                        <button
                                            type="button"
                                            onClick={() => { setEditModal({ isOpen: false, data: null }); setSendModal({ isOpen: false }); }}
                                            className="flex-1 px-8 py-5 border-2 border-gray-100 text-gray-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-[2] px-8 py-5 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-gray-300 hover:bg-[#4eb7f5] hover:shadow-[#4eb7f5]/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            {editModal.isOpen ? 'Update Details' : 'Send Referral'}
                                            <PaperAirplaneIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferralsSent;
