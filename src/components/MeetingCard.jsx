import React from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import {
    CalendarIcon,
    MapPinIcon,
    VideoCameraIcon,
    TrashIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const MeetingCard = ({ meeting, onDelete, onRSVP, onViewDetails, index }) => {
    const { user } = useAuth();
    const isAdmin = user.role === 'admin';

    const getStatusColor = (status) => {
        switch (status) {
            case 'attending': return 'text-emerald-600 bg-emerald-50 ring-emerald-500/20';
            case 'not_attending': return 'text-rose-600 bg-rose-50 ring-rose-500/20';
            case 'maybe': return 'text-amber-600 bg-amber-50 ring-amber-500/20';
            default: return 'text-slate-600 bg-slate-50 ring-slate-500/10';
        }
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors border border-slate-100 group-hover:border-primary-100">
                        <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 leading-tight">{meeting.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                By {meeting.created_by_name}
                            </p>
                        </div>
                    </div>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => onDelete(meeting.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                )}
            </div>

            <p className="text-slate-500 text-sm font-medium mb-8 line-clamp-2 leading-relaxed italic">
                "{meeting.description || 'No description provided.'}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                        <ClockIcon className="w-4 h-4 text-primary-500" />
                        {format(new Date(meeting.meeting_date), 'PPp')}
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mode / Location</p>
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                        {meeting.meeting_link ? <VideoCameraIcon className="w-4 h-4 text-primary-500" /> : <MapPinIcon className="w-4 h-4 text-emerald-500" />}
                        <span className="truncate">{meeting.meeting_link ? 'Virtual' : (meeting.location || 'In-Person')}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-1 bg-slate-50 rounded-2xl border border-slate-100">
                    <button
                        onClick={() => onRSVP(meeting.id, 'attending')}
                        className={`flex-1 flex justify-center items-center py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${meeting.user_rsvp === 'attending'
                            ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => onRSVP(meeting.id, 'maybe')}
                        className={`flex-1 flex justify-center items-center py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${meeting.user_rsvp === 'maybe'
                            ? 'bg-white text-amber-600 shadow-sm ring-1 ring-amber-100'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Maybe
                    </button>
                    <button
                        onClick={() => onRSVP(meeting.id, 'not_attending')}
                        className={`flex-1 flex justify-center items-center py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${meeting.user_rsvp === 'not_attending'
                            ? 'bg-white text-rose-600 shadow-sm ring-1 ring-rose-100'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        No
                    </button>
                </div>

                <button
                    onClick={() => onViewDetails(meeting)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-primary-600 hover:shadow-primary-200 transition-all active:scale-95"
                >
                    View Full Details
                </button>
            </div>
        </div>
    );
};

export default MeetingCard;
