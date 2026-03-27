import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS_URL } from '../config/apiConfig';
import { createPortal } from 'react-dom';
import dataService from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
    InboxIcon,
    PaperAirplaneIcon,
    CalendarIcon,
    CurrencyRupeeIcon,
    UserIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    CheckBadgeIcon,
    ChatBubbleBottomCenterTextIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const ThankYouNotes = () => {
    const { user } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    const [activeTab, setActiveTab] = useState('received');
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewModal, setViewModal] = useState({ isOpen: false, data: null });
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        fetchSettings();
        fetchNotes();
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

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const res = await dataService.getThankYouNotes();
            setNotes(res.data.data);
        } catch (error) {
            console.error('Failed to load thank you notes', error);
            toast.error('Failed to load thank you notes');
        } finally {
            setLoading(false);
        }
    };

    const filteredNotes = notes.filter(note => {
        const activeRole = localStorage.getItem('activeRole');
        const isActingAsChapterAdmin = user.role === 'chapter_admin' && activeRole !== 'member';
        const isAdminView = user.role === 'admin' || isActingAsChapterAdmin;

        let matchesTab = true;
        if (!isAdminView) {
            const isReceived = note.referred_to === user.name;
            const isSent = note.user_id === user.id || note.sender_name === user.name;

            if (activeTab === 'received' && !isReceived) matchesTab = false;
            if (activeTab === 'sent' && !isSent) matchesTab = false;
        }

        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = (
            (note.sender_name || '').toLowerCase().includes(searchLower) ||
            (note.receiver_name || note.referred_to || '').toLowerCase().includes(searchLower) ||
            (note.reference_name || '').toLowerCase().includes(searchLower)
        );

        return matchesTab && matchesSearch;
    });

    const activeRole = localStorage.getItem('activeRole');
    const isActingAsChapterAdmin = user.role === 'chapter_admin' && activeRole !== 'member';
    const isAdmin = user.role === 'admin' || isActingAsChapterAdmin;

    return (
        <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">Thank You Notes</h1>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Confirmed business success within the community</p>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {!isAdmin && (
                    <div className="flex p-1.5 bg-gray-50 rounded-2xl w-full lg:w-fit border border-gray-100/50">
                        <button
                            onClick={() => setActiveTab('received')}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95",
                                activeTab === 'received' ? "bg-white text-gray-900 shadow-md border border-gray-100" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <InboxIcon className="w-4 h-4" />
                            Received
                        </button>
                        <button
                            onClick={() => setActiveTab('sent')}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ml-1",
                                activeTab === 'sent' ? "bg-white text-gray-900 shadow-md border border-gray-100" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <PaperAirplaneIcon className="w-4 h-4" />
                            Sent
                        </button>
                    </div>
                )}

                <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, company or note..."
                        className="w-full bg-gray-50 border border-transparent rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-gray-100 focus:bg-white focus:border-gray-200 transition-all shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-1 items-center justify-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-gray-100/50">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-yellow-500"></div>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex-1 flex flex-col">
                    {filteredNotes.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <ChatBubbleBottomCenterTextIcon className="w-10 h-10 opacity-20" />
                            </div>
                            <p className="text-xl font-black uppercase tracking-widest opacity-30 italic px-8 text-center">No thank you notes found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="min-w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                            {isAdmin ? 'Sender' : (activeTab === 'received' ? 'Sent By' : 'Sent To')}
                                        </th>
                                        {isAdmin && (
                                            <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Receiver</th>
                                        )}
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Revenue Confirmed</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredNotes.map((note) => {
                                        const displayedName = isAdmin ? note.sender_name : (activeTab === 'received' ? note.sender_name : (note.receiver_name || note.referred_to));
                                        const displayedImage = isAdmin ? note.sender_image : (activeTab === 'received' ? note.sender_image : note.receiver_image);

                                        return (
                                            <tr key={note.id} className="group hover:bg-gray-50/50 transition-all duration-300">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-white overflow-hidden border-2 border-white shadow-lg ring-2 ring-slate-100 group-hover:ring-primary-200 transition-all flex items-center justify-center">
                                                            {displayedImage ? (
                                                                <img
                                                                    src={`${ASSETS_URL}${displayedImage}`}
                                                                    alt={displayedName}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                                                                    <UserIcon className="w-6 h-6" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 leading-tight">
                                                                {displayedName}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-tighter italic">Member Profile</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {isAdmin && (
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white overflow-hidden border border-gray-100 flex items-center justify-center">
                                                                {note.receiver_image ? (
                                                                    <img
                                                                        src={`${ASSETS_URL}${note.receiver_image}`}
                                                                        alt={note.receiver_name || note.referred_to}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                                                                        <UserIcon className="w-5 h-5" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-gray-900 leading-tight">
                                                                    {note.receiver_name || note.referred_to}
                                                                </p>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">Receiver</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="px-8 py-6">
                                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-50">
                                                        <CurrencyRupeeIcon className="w-5 h-5 text-emerald-600" />
                                                        <span className="text-lg font-black text-emerald-900 tracking-tight">
                                                            {parseFloat(note.business_done_amount || 0).toLocaleString('en-IN')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <p className="text-[13px] font-bold text-gray-900">{new Date(note.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(note.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    {(user?.role !== 'chapter_admin' || settings?.referralDataChapterAdmin !== false) && (
                                                        <button
                                                            onClick={() => setViewModal({ isOpen: true, data: note })}
                                                            className="p-2 bg-white border border-gray-200 text-gray-400 rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all shadow-sm active:scale-95 group relative"
                                                            title="View Note"
                                                        >
                                                            <EyeIcon className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}


            {(mounted && viewModal.isOpen) && createPortal(
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative border border-gray-100">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-6 text-white relative">
                            <button
                                onClick={() => setViewModal({ isOpen: false, data: null })}
                                className="absolute top-6 right-6 p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all text-white border border-white/20 active:scale-90"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
                                    <CheckBadgeIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black italic tracking-tight">Thank You Note</h2>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Reference Success</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 px-1">Source / Sender</label>
                                    <p className="text-sm font-black text-gray-900 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">{viewModal.data.sender_name}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 px-1">Recipient / Receiver</label>
                                    <p className="text-sm font-black text-gray-900 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">{viewModal.data.receiver_name || viewModal.data.referred_to}</p>
                                </div>
                                <div className="col-span-2 p-6 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100 flex items-center justify-between">
                                    <div>
                                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Total Business Amount</label>
                                        <div className="flex items-center gap-1.5 text-2xl font-black text-emerald-900">
                                            <CurrencyRupeeIcon className="w-8 h-8" />
                                            {parseFloat(viewModal.data.business_done_amount || 0).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                    <div className="h-14 w-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 rotate-6 transition-transform hover:rotate-0">
                                        <CheckBadgeIcon className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">Note Context</label>
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 relative shadow-inner">
                                    <div className="absolute top-2 left-4 text-4xl text-gray-200 font-serif leading-none italic">“</div>
                                    <p className="text-sm font-medium text-gray-700 leading-relaxed px-2 py-1 italic relative z-10">
                                        {viewModal.data.description || 'Confirmed business transaction completed successfully.'}
                                    </p>
                                    <div className="absolute bottom-2 right-4 text-4xl text-gray-200 font-serif leading-none italic rotate-180">“</div>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-between items-center border-t border-gray-50 uppercase tracking-tighter">
                                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold">
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                    System Timestamp: {new Date(viewModal.data.created_at).toLocaleString()}
                                </div>
                                <p className="text-[10px] font-black text-emerald-600">Verified Read-Only</p>
                            </div>

                            <button
                                onClick={() => setViewModal({ isOpen: false, data: null })}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-[0.98] shadow-lg shadow-gray-200"
                            >
                                Close Note
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ThankYouNotes;
