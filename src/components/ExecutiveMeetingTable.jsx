import React from 'react';
import { format } from 'date-fns';
import {
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    VideoCameraIcon,
    EyeIcon,
    TrashIcon,
    UserCircleIcon,
    ChevronRightIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../context/AuthContext';

const ExecutiveMeetingTable = ({ meetings, onView, onDelete, onRSVP, onManageMembers, onEdit, onAddVisitor }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin' || user?.role === 'chapter_admin';
    const isChapterAdmin = user?.role === 'chapter_admin';

    const getStatusStyles = (rsvp) => {
        switch (rsvp) {
            case 'attending': return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
            case 'maybe': return 'bg-amber-50 text-amber-700 ring-amber-600/20';
            case 'not_attending': return 'bg-rose-50 text-rose-700 ring-rose-600/20';
            case 'invited': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
            default: return 'bg-slate-50 text-slate-600 ring-slate-500/10';
        }
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100/80">
                            <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Meeting Schedule</th>
                            <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Title & Organizer</th>
                            <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Mode & Venue</th>
                            <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Your Response</th>
                            <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {meetings.map((meeting) => (
                            <tr key={meeting.id} className="group hover:bg-slate-50/30 transition-all duration-300">
                                {/* Date & Time */}
                                <td className="px-8 py-6 whitespace-nowrap">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center group-hover:bg-white group-hover:border-primary-100 group-hover:shadow-sm transition-all">
                                            <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-0.5">
                                                {format(new Date(meeting.meeting_date), 'MMM')}
                                            </span>
                                            <span className="text-lg font-black text-slate-900 leading-none">
                                                {format(new Date(meeting.meeting_date), 'dd')}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">
                                                {format(new Date(meeting.meeting_date), 'EEEE')}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                                <ClockIcon className="w-3.5 h-3.5" />
                                                {format(new Date(meeting.meeting_date), 'hh:mm a')}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Title & Organizer */}
                                <td className="px-8 py-6 max-w-xs">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[15px] font-black text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                                                {meeting.title}
                                            </span>
                                            {meeting.status && (
                                                <span className={twMerge(
                                                    "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest whitespace-nowrap",
                                                    meeting.status === 'Completed' ? "bg-emerald-100 text-emerald-700" :
                                                        meeting.status === 'Not Completed' ? "bg-rose-100 text-rose-700" :
                                                            "bg-blue-100 text-blue-700"
                                                )}>
                                                    {meeting.status}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <UserCircleIcon className="w-4 h-4 text-slate-300" />
                                            <span className="text-[12px] font-bold text-slate-400">
                                                {meeting.created_by_name || meeting.creator_name}
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                {/* Mode & Venue */}
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className={twMerge(
                                            "p-2 rounded-xl border transition-all",
                                            meeting.meeting_link
                                                ? "bg-blue-50/50 border-blue-100 text-blue-600"
                                                : "bg-emerald-50/50 border-emerald-100 text-emerald-600"
                                        )}>
                                            {meeting.meeting_link ? <VideoCameraIcon className="w-4 h-4" /> : <MapPinIcon className="w-4 h-4" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[12px] font-black text-slate-900">
                                                {meeting.meeting_link ? 'Virtual Session' : (meeting.location || 'In-Person')}
                                            </span>
                                            {meeting.meeting_link && (
                                                <span className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">
                                                    {meeting.meeting_link}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* RSVP Status */}
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        {/* Quick RSVP Toggles */}
                                        <div className="flex items-center p-1 bg-slate-50 border border-slate-100 rounded-xl">
                                            {/* For Chapter Meetings (Registration system) */}
                                            {meeting.isRegistered !== undefined ? (
                                                <button
                                                    onClick={() => onRSVP(meeting.id, 'attending')}
                                                    className={twMerge(
                                                        "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                        meeting.isRegistered
                                                            ? "bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100"
                                                            : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                                    )}
                                                >
                                                    {meeting.isRegistered ? 'Registered' : 'Register'}
                                                </button>
                                            ) : (
                                                /* For Standard Meetings (RSVP system) */
                                                ['attending', 'maybe', 'not_attending'].map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() => onRSVP(meeting.id, s)}
                                                        title={s.replace('_', ' ')}
                                                        className={twMerge(
                                                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                            meeting.user_rsvp === s
                                                                ? (s === 'attending' ? "bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100" :
                                                                    s === 'maybe' ? "bg-white text-amber-600 shadow-sm ring-1 ring-amber-100" :
                                                                        "bg-white text-rose-600 shadow-sm ring-1 ring-rose-100")
                                                                : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                                        )}
                                                    >
                                                        {s === 'attending' ? 'Yes' : s === 'maybe' ? '?' : 'No'}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-8 py-6 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onView(meeting)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-black text-slate-600 hover:border-primary-600 hover:text-primary-600 hover:shadow-lg hover:shadow-primary-100 transition-all group/view"
                                        >
                                            <EyeIcon className="w-4 h-4 text-slate-400 group-hover/view:text-primary-600" />
                                            Details
                                        </button>
                                        {isChapterAdmin && onManageMembers && (
                                            <button
                                                onClick={() => onManageMembers(meeting)}
                                                className="flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-xl text-[12px] font-black text-primary-600 hover:bg-primary-100 transition-all"
                                            >
                                                Members
                                            </button>
                                        )}
                                        {isChapterAdmin && onAddVisitor && (
                                            <button
                                                onClick={() => onAddVisitor(meeting)}
                                                className="p-2.5 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-xl transition-all"
                                                title="Add Visitor"
                                            >
                                                <UserCircleIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                        {isChapterAdmin && onEdit && (
                                            <button
                                                onClick={() => onEdit(meeting)}
                                                className="p-2.5 text-slate-300 hover:text-amber-500 hover:bg-amber-50 border border-transparent hover:border-amber-100 rounded-xl transition-all"
                                                title="Edit Meeting"
                                            >
                                                <PencilSquareIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                        {isChapterAdmin && (
                                            <button
                                                onClick={() => onDelete(meeting.id)}
                                                className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExecutiveMeetingTable;
