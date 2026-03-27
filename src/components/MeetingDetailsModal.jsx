import React, { useState, useEffect, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, VideoCameraIcon, MapPinIcon, ClockIcon, UserIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import dataService from '../services/dataService';

const MeetingDetailsModal = ({ isOpen, onClose, meeting }) => {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && meeting?.id) {
            fetchParticipants();
        }
    }, [isOpen, meeting]);

    const fetchParticipants = async () => {
        setLoading(true);
        try {
            const res = await dataService.getMeetingRSVPs(meeting.id);
            if (res.data.success) {
                setParticipants(res.data.data.rsvps);
            }
        } catch (error) {
            console.error("Failed to fetch meeting participants", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !meeting) return null;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const modalContent = (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{meeting.title}</h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Meeting Details</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Member / Creator */}
                        <div className="col-span-1 md:col-span-2 flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                <UserIcon className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Created By</h4>
                                <p className="text-sm font-bold text-slate-700">{meeting.created_by_name || 'Organization Member'}</p>
                                <p className="text-[11px] font-semibold text-primary-600 uppercase tracking-wider">
                                    {meeting.created_by_role === 'member' ? 'Member' : 'Chapter Admin'}
                                </p>
                            </div>
                        </div>

                        {/* Timing */}
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                <ClockIcon className="w-3 h-3" /> Schedule
                            </h4>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">Start Date & Time</p>
                                    <p className="text-sm font-bold text-slate-700">{formatDate(meeting.meeting_date)} | {formatTime(meeting.meeting_date)}</p>
                                </div>
                                {/* Note: Assuming end_date exists or fallback to +1 hour if not specified in basic model */}
                                <div>
                                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">End Date & Time</p>
                                    <p className="text-sm font-bold text-slate-700">
                                        {meeting.end_date ? formatDate(meeting.end_date) : formatDate(meeting.meeting_date)} |
                                        {meeting.end_date ? formatTime(meeting.end_date) : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mode & Location */}
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                {meeting.meeting_link ? <VideoCameraIcon className="w-3 h-3" /> : <MapPinIcon className="w-3 h-3" />} Meeting Mode
                            </h4>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">Type</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${meeting.meeting_link ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                        {meeting.meeting_link ? 'Virtual' : 'In-Person'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">Location / Link</p>
                                    {meeting.meeting_link ? (
                                        <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary-600 hover:underline break-all">
                                            {meeting.meeting_link}
                                        </a>
                                    ) : (
                                        <p className="text-sm font-bold text-slate-700">{meeting.location || 'Not Specified'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</h4>
                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                                "{meeting.description || 'No description provided.'}"
                            </p>
                        </div>
                    </div>

                    {/* Participants */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <UserGroupIcon className="w-3 h-3" /> Members Involved
                            </h4>
                            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                                {participants.length} Active
                            </span>
                        </div>

                        {loading ? (
                            <div className="animate-pulse flex gap-2 overflow-x-auto pb-2">
                                {[1, 2, 3].map(i => <div key={i} className="h-8 w-24 bg-slate-100 rounded-full flex-shrink-0" />)}
                            </div>
                        ) : participants.length === 0 ? (
                            <p className="text-[11px] text-slate-400 font-bold italic">No specific members registered for this meeting.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {participants.map((p, idx) => (
                                    <div
                                        key={idx}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-primary-100 transition-all group"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center text-[10px] font-black text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                            {p.user_name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-slate-700">{p.user_name}</span>
                                            <span className={`text-[9px] font-bold uppercase tracking-wider ${p.status === 'attending' ? 'text-emerald-600' :
                                                    p.status === 'maybe' ? 'text-amber-600' :
                                                        p.status === 'not_attending' ? 'text-rose-600' : 'text-slate-400'
                                                }`}>
                                                {p.status === 'attending' ? 'Attending' :
                                                    p.status === 'not_attending' ? 'Not Attending' :
                                                        p.status === 'maybe' ? 'Maybe' : 'Invited'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Close Button */}
                    <div className="mt-10 pt-6 border-t border-gray-100 flex justify-center">
                        <button
                            onClick={onClose}
                            className="px-10 py-3 bg-slate-900 text-white rounded-2xl text-[13px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
                        >
                            Close Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default MeetingDetailsModal;
