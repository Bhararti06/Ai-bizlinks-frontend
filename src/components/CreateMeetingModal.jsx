import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, ClockIcon, VideoCameraIcon, MapPinIcon, UserGroupIcon, IdentificationIcon, LinkIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import dataService from '../services/dataService';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const CreateMeetingModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        mode: 'Virtual',
        meetingLink: '',
        location: '',
        inviteAll: false,
        inviteeId: '' // Single user ID
    });

    const [users, setUsers] = useState([]);

    // Fetch users when modal opens (if not inviting all)
    React.useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            const res = await dataService.getUsers({ context: 'meeting' });
            setUsers(res.data.data);
        } catch (error) {
            console.error("Failed to fetch users");
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleInviteeChange = (e) => {
        setFormData({ ...formData, inviteeId: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate fields
            if (!formData.title || !formData.date || !formData.startTime || !formData.inviteeId) {
                toast.warning('Please fill all required fields, including selecting a member');
                return;
            }
            if (formData.mode === 'Virtual' && !formData.meetingLink) {
                toast.warning('Please provide a meeting link for a virtual meeting');
                return;
            }
            if (formData.mode === 'In-Person' && !formData.location) {
                toast.warning('Please provide a location for an in-person meeting');
                return;
            }

            // Combine Date + Time
            // Ensure format is YYYY-MM-DDTHH:mm:00
            const dateStr = `${formData.date}T${formData.startTime}:00`;
            const meetingDateObj = new Date(dateStr);

            if (isNaN(meetingDateObj.getTime())) {
                toast.error('Invalid date or time selected');
                return;
            }

            let endTimeObj = null;
            if (formData.endTime) {
                endTimeObj = new Date(`${formData.date}T${formData.endTime}:00`);
            }

            // Prepare payload
            const payload = {
                title: formData.title,
                description: formData.description,
                meetingDate: meetingDateObj.toISOString(),
                endTime: endTimeObj ? endTimeObj.toISOString() : null,
                mode: formData.mode,
                meetingLink: formData.mode === 'Virtual' ? formData.meetingLink : null,
                location: formData.mode === 'In-Person' ? formData.location : null,
                invitees: [parseInt(formData.inviteeId)]
            };

            const response = await dataService.createMeeting(payload);
            if (onSuccess) onSuccess(response.data.data);
            setFormData({
                title: '',
                description: '',
                date: '',
                startTime: '',
                endTime: '',
                mode: 'Virtual',
                meetingLink: '',
                location: '',
                inviteAll: false,
                inviteeId: ''
            });
            onClose();
            toast.success('Meeting scheduled successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to schedule meeting');
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
                    <div className="fixed inset-0 bg-black/40 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-[9999] overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all w-full max-w-lg border border-slate-200/50">
                                {/* Header */}
                                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                                    <div>
                                        <Dialog.Title as="h3" className="text-2xl font-black text-slate-900 tracking-tight">
                                            Schedule Meeting
                                        </Dialog.Title>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Coordinate a new interaction session</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-200 active:scale-90"
                                        onClick={onClose}
                                    >
                                        <XMarkIcon className="h-6 w-6 text-slate-400" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Subject */}
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                <ChatBubbleBottomCenterTextIcon className="w-3.5 h-3.5" />
                                                Subject / Title *
                                            </label>
                                            <input
                                                type="text"
                                                name="title"
                                                placeholder="e.g. Project Sync-up"
                                                value={formData.title}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-slate-300"
                                                required
                                            />
                                        </div>

                                        {/* Invitee selection */}
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                <UserGroupIcon className="w-3.5 h-3.5" />
                                                Select Participant *
                                            </label>
                                            <select
                                                name="invitees"
                                                value={formData.inviteeId}
                                                onChange={handleInviteeChange}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer"
                                                required
                                            >
                                                <option value="">-- Choose Member --</option>
                                                {users.map(u => (
                                                    <option key={u.id} value={u.id}>
                                                        {u.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                <CalendarIcon className="w-3.5 h-3.5" />
                                                Date *
                                            </label>
                                            <input
                                                type="date"
                                                name="date"
                                                value={formData.date || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                <IdentificationIcon className="w-3.5 h-3.5" />
                                                Mode
                                            </label>
                                            <select
                                                name="mode"
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer"
                                                value={formData.mode || 'Virtual'}
                                                onChange={handleChange}
                                            >
                                                <option value="Virtual">Virtual</option>
                                                <option value="In-Person">In-Person</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                <ClockIcon className="w-3.5 h-3.5" />
                                                Start Time *
                                            </label>
                                            <input
                                                type="time"
                                                name="startTime"
                                                value={formData.startTime || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                <ClockIcon className="w-3.5 h-3.5" />
                                                End Time
                                            </label>
                                            <input
                                                type="time"
                                                name="endTime"
                                                value={formData.endTime || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all"
                                            />
                                        </div>

                                        {/* Mode specific fields */}
                                        <motion.div
                                            key={formData.mode}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="md:col-span-2 space-y-1"
                                        >
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                {formData.mode === 'Virtual' ? <LinkIcon className="w-3.5 h-3.5" /> : <MapPinIcon className="w-3.5 h-3.5" />}
                                                {formData.mode === 'Virtual' ? 'Meeting Link' : 'Physical Location'}
                                            </label>
                                            <input
                                                type={formData.mode === 'Virtual' ? 'url' : 'text'}
                                                name={formData.mode === 'Virtual' ? 'meetingLink' : 'location'}
                                                placeholder={formData.mode === 'Virtual' ? 'https://zoom.us/...' : 'Boardroom B, 4th Floor'}
                                                value={formData.mode === 'Virtual' ? formData.meetingLink : formData.location}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-slate-300"
                                            />
                                        </motion.div>

                                        {/* Description */}
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                <IdentificationIcon className="w-3.5 h-3.5" />
                                                Agenda / Description
                                            </label>
                                            <textarea
                                                name="description"
                                                rows={2}
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="What is this meeting about?"
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-slate-300 resize-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 sticky bottom-0 bg-white">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 text-xs"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-[2] px-4 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-primary-600 hover:shadow-primary-500/20 transition-all active:scale-95 text-xs"
                                        >
                                            Schedule
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

export default CreateMeetingModal;
