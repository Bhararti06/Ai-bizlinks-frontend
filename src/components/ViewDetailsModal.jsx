import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS_URL } from '../config/apiConfig';
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ViewDetailsModal = ({ isOpen, onClose, data, type = 'event' }) => {
    if (!isOpen || !data) return null;

    const isEvent = type === 'event';

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.split(':').slice(0, 2).join(':');
    };

    const imagePath = data.image_path || data.imagePath;
    const title = isEvent ? data.title : data.training_topic;
    const organizer = isEvent ? (data.organizer_name || 'Organization') : (data.trainer_name || 'Organization');
    const registrationCharge = isEvent ? data.event_charges : data.registration_charge;
    const location = isEvent ? data.location : data.location;
    const startDate = isEvent ? data.event_date : data.training_start_date;
    const endDate = isEvent ? data.event_end_date : data.training_end_date;
    const startTime = isEvent ? data.event_time_in : data.training_time_in;
    const endTime = isEvent ? data.event_time_out : data.training_time_out;
    const cutoffDate = isEvent ? data.registration_cutoff_date : data.registration_last_date;

    function clsx(...classes) {
        return classes.filter(Boolean).join(' ');
    }

    const modalContent = (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                <div className="relative h-48 bg-primary-600 flex-shrink-0">
                    {imagePath ? (
                        <img
                            src={`${ASSETS_URL}${imagePath}`}
                            alt={title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <CalendarIcon className="h-16 w-16 text-white/50" />
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-all z-10"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">{title}</h2>
                            <p className="text-primary-600 font-bold">
                                {isEvent ? 'Organized solely by ' : 'Trainer: '}
                                <span className="text-slate-700">{organizer}</span>
                            </p>
                        </div>
                        <span className={clsx(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                            (data.event_mode === 'Virtual' || data.training_mode === 'Virtual')
                                ? "bg-blue-50 text-blue-600"
                                : "bg-emerald-50 text-emerald-600"
                        )}>
                            {data.event_mode || data.training_mode || 'In-Person'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Start Date & Time</h4>
                            <p className="text-sm font-bold text-slate-700">
                                {formatDate(startDate)} <span className="mx-1 text-slate-300">|</span> {formatTime(startTime)}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">End Date & Time</h4>
                            <p className="text-sm font-bold text-slate-700">
                                {formatDate(endDate)} <span className="mx-1 text-slate-300">|</span> {formatTime(endTime)}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Location</h4>
                            <p className="text-sm font-bold text-slate-700">{location || 'Virtual'}</p>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Registration Charge</h4>
                            <p className="text-sm font-extrabold text-slate-900">
                                {registrationCharge === '0' || registrationCharge === 0 ? 'Free' : `₹${registrationCharge}`}
                            </p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Registration Cutoff</h4>
                        <p className="text-sm font-bold text-slate-700">{formatDate(cutoffDate)}</p>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</h4>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            {data.description || 'No description provided.'}
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                        <button
                            onClick={onClose}
                            className="px-8 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 active:scale-95"
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

export default ViewDetailsModal;
