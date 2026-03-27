import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, AcademicCapIcon, CalendarIcon, ClockIcon, MapPinIcon, CurrencyRupeeIcon, LinkIcon, DocumentTextIcon, UserIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const TrainingDetailsModal = ({ isOpen, onClose, training }) => {
    if (!training) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'Not set';
        try {
            const parts = timeString.split(':');
            if (parts.length < 2) return timeString;
            const hours = parseInt(parts[0]);
            const minutes = parts[1];
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const hour12 = hours % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        } catch (e) {
            return timeString;
        }
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-[9999] overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95 y-8"
                            enterTo="opacity-100 scale-100 y-0"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100 y-0"
                            leaveTo="opacity-0 scale-95 y-8"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all w-full max-w-2xl border border-slate-200/50">
                                {/* Header */}
                                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-50 rounded-2xl">
                                            <AcademicCapIcon className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-2xl font-black text-slate-900 tracking-tight">
                                                {training.training_title}
                                            </Dialog.Title>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Professional Training Session</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-200 active:scale-90"
                                        onClick={onClose}
                                    >
                                        <XMarkIcon className="h-6 w-6 text-slate-400" />
                                    </button>
                                </div>

                                <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                                    {/* Main Info Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="p-2.5 bg-white rounded-xl shadow-sm">
                                                <UserIcon className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Trainer</p>
                                                <p className="text-sm font-bold text-slate-900">{training.trainer_name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="p-2.5 bg-white rounded-xl shadow-sm">
                                                <CurrencyRupeeIcon className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Registration Fee</p>
                                                <p className="text-sm font-black text-slate-900">
                                                    {training.training_charges > 0 ? `₹${training.training_charges}` : 'Complimentary'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dates & Times */}
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                                            <CalendarIcon className="w-3.5 h-3.5" /> Schedule Details
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">Commencement</p>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-bold text-slate-900">{formatDate(training.training_start_date)}</p>
                                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg">
                                                            <ClockIcon className="w-3 h-3 text-emerald-600" />
                                                            <span className="text-[10px] font-black text-emerald-600 uppercase">{formatTime(training.training_start_time)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="pt-4 border-t border-slate-50">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">Conclusion</p>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-bold text-slate-900">{formatDate(training.training_end_date)}</p>
                                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg">
                                                            <ClockIcon className="w-3 h-3 text-slate-400" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase">{formatTime(training.training_end_time)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1 flex items-center gap-1.5">
                                                        <MapPinIcon className="w-3 h-3" /> Venue / Mode
                                                    </p>
                                                    <p className="text-sm font-bold text-slate-900 mt-1">{training.training_mode}</p>
                                                    <p className="text-[11px] font-medium text-slate-500 mt-1">{training.training_location || 'Location details provided upon registration'}</p>
                                                </div>
                                                <div className="mt-4 p-3 bg-white rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tight mb-1">Registration Cut-off</p>
                                                    <p className="text-xs font-black text-slate-900">{formatDate(training.registration_last_date)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Links Section */}
                                    {(training.payment_link || training.training_link) && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {training.payment_link && (
                                                <a
                                                    href={training.payment_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-4 bg-emerald-600 rounded-2xl text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-white/20 rounded-xl">
                                                            <CurrencyRupeeIcon className="w-5 h-5 text-white" />
                                                        </div>
                                                        <span className="text-xs font-black uppercase tracking-widest">Complete Payment</span>
                                                    </div>
                                                    <LinkIcon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                                </a>
                                            )}
                                            {training.training_link && (
                                                <a
                                                    href={training.training_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-4 bg-primary-600 rounded-2xl text-white hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-white/20 rounded-xl">
                                                            <LinkIcon className="w-5 h-5 text-white" />
                                                        </div>
                                                        <span className="text-xs font-black uppercase tracking-widest">Join Session</span>
                                                    </div>
                                                    <LinkIcon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div className="space-y-3">
                                        <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                                            <DocumentTextIcon className="w-3.5 h-3.5" /> About this Training
                                        </h4>
                                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                                {training.training_description || 'No detailed description available for this training session.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Registered Members Placeholder */}
                                    <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-center gap-3">
                                        <UserGroupIcon className="w-5 h-5 text-indigo-400" />
                                        <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Registrations are managed by the admin panel</p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-8 bg-slate-50/50 flex justify-center border-t border-slate-100">
                                    <button
                                        type="button"
                                        className="px-12 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                                        onClick={onClose}
                                    >
                                        Close Details
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

export default TrainingDetailsModal;
