import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import dataService from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import {
    EyeIcon,
    CalendarIcon,
    PlusIcon,
    UserGroupIcon,
    MapPinIcon,
    LinkIcon,
    ClockIcon,
    CurrencyRupeeIcon,
    XMarkIcon,
    PencilSquareIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';
import ExecutiveMeetingTable from '../components/ExecutiveMeetingTable';

const ChapterMeetings = () => {
    const { user } = useAuth();
    const activeRole = localStorage.getItem('activeRole');
    const isActingAsChapterAdmin = user.role === 'chapter_admin' && activeRole !== 'member';
    const isChapterAdmin = isActingAsChapterAdmin;
    const isOrgAdmin = user.role === 'admin';
    const isAdmin = isChapterAdmin || isOrgAdmin;

    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeTab, setTimeTab] = useState('upcoming');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isRegListModalOpen, setIsRegListModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loadingRegs, setLoadingRegs] = useState(false);

    // Form State
    const initialForm = {
        title: '',
        description: '',
        meetingDate: '',
        cutoffDate: '',
        startTime: '',
        endTime: '',
        mode: 'In-Person',
        meetingLink: '',
        location: '',
        charges: '0',
        paymentLink: '',
        status: 'Scheduled'
    };
    const [formData, setFormData] = useState(initialForm);
    const [isEditing, setIsEditing] = useState(false);

    // Visitor Modal State
    const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
    const [visitorForm, setVisitorForm] = useState({
        name: '',
        email: '',
        contact_number: '',
        company_name: '',
        chapter: ''
    });

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        setLoading(true);
        try {
            const response = await dataService.getChapterMeetings();
            setMeetings(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch chapter meetings');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await dataService.updateChapterMeeting(selectedMeeting.id, formData);
                toast.success('Meeting updated successfully');
            } else {
                await dataService.createChapterMeeting(formData);
                toast.success('Meeting scheduled successfully');
            }
            setIsCreateModalOpen(false);
            setFormData(initialForm);
            setIsEditing(false);
            fetchMeetings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save meeting');
        }
    };

    const handleRegister = async (meetingId) => {
        try {
            await dataService.registerChapterMeeting(meetingId);
            toast.success('Registered successfully');
            fetchMeetings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    const handleViewRegs = async (meeting) => {
        setSelectedMeeting(meeting);
        setIsRegListModalOpen(true);
        setLoadingRegs(true);
        try {
            const response = await dataService.getChapterMeetingRegistrations(meeting.id);
            setRegistrations(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch registrations');
        } finally {
            setLoadingRegs(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this meeting?')) return;
        try {
            await dataService.deleteChapterMeeting(id);
            toast.success('Meeting deleted');
            fetchMeetings();
        } catch (error) {
            toast.error('Failed to delete meeting');
        }
    };

    const filteredMeetings = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        return meetings.filter(m => {
            const mDate = new Date(m.meeting_date);
            return timeTab === 'upcoming' ? mDate >= now : mDate < now;
        }).sort((a, b) => {
            const dateA = new Date(a.meeting_date);
            const dateB = new Date(b.meeting_date);
            return timeTab === 'upcoming' ? dateA - dateB : dateB - dateA;
        });
    }, [meetings, timeTab]);

    const handleAddVisitor = async (e) => {
        e.preventDefault();
        try {
            await dataService.addVisitorToChapterMeeting(selectedMeeting.id, visitorForm);
            toast.success('Visitor added successfully');
            setIsVisitorModalOpen(false);
            setVisitorForm({ name: '', email: '', contact_number: '', company_name: '', chapter: '' });
            // Refresh registrations/visitors list if we display them
            handleViewRegs(selectedMeeting);
        } catch (error) {
            console.error(error);
            toast.error('Failed to add visitor');
        }
    };

    const handleEdit = (meeting) => {
        setSelectedMeeting(meeting);
        setFormData({
            title: meeting.title,
            description: meeting.description,
            meetingDate: meeting.meeting_date.split('T')[0], // Extract YYYY-MM-DD
            cutoffDate: meeting.cutoff_date ? meeting.cutoff_date.split('T')[0] : '',
            startTime: meeting.start_time ? meeting.start_time.slice(0, 5) : '',
            endTime: meeting.end_time ? meeting.end_time.slice(0, 5) : '',
            mode: meeting.mode,
            meetingLink: meeting.meeting_link || '',
            location: meeting.location || '',
            charges: meeting.charges,
            paymentLink: meeting.payment_link || '',
            status: meeting.status
        });
        setIsEditing(true);
        setIsCreateModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Chapter Meetings</h1>
                    <p className="text-slate-500 font-medium mt-1">Connect, collaborate, and grow with your chapter.</p>
                </div>
                {isChapterAdmin && (
                    <button
                        onClick={() => {
                            setFormData(initialForm);
                            setIsEditing(false);
                            setIsCreateModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Schedule Chapter Meeting
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-100 mb-8">
                {[
                    { id: 'upcoming', label: 'Upcoming Meetings', icon: CalendarIcon },
                    { id: 'previous', label: 'Previous Meetings', icon: ClockIcon }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setTimeTab(tab.id)}
                        className={twMerge(
                            "flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2",
                            timeTab === tab.id
                                ? "text-primary-600 border-primary-600 bg-primary-50/30"
                                : "text-slate-400 border-transparent hover:text-slate-600"
                        )}
                    >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                    <p className="text-slate-500 font-bold">Loading meetings...</p>
                </div>
            ) : filteredMeetings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <CalendarIcon className="w-16 h-16 text-slate-200 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">No {timeTab} meetings found</h3>
                    <p className="text-slate-400 font-medium">There are no chapter meetings scheduled at this time.</p>
                </div>
            ) : (
                <ExecutiveMeetingTable
                    meetings={filteredMeetings}
                    onView={(m) => {
                        setSelectedMeeting(m);
                        setIsDetailsModalOpen(true);
                    }}
                    onRSVP={handleRegister}
                    onDelete={handleDelete}
                    onManageMembers={handleViewRegs}
                    onEdit={handleEdit}
                    onAddVisitor={(meeting) => {
                        setSelectedMeeting(meeting);
                        setIsVisitorModalOpen(true);
                    }}
                />
            )}

            {/* Schedule/Edit Modal */}
            <Transition.Root show={isCreateModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsCreateModalOpen(false)}>
                    <Transition.Child as={Fragment}>
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child as={Fragment}>
                                <Dialog.Panel className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden p-8 md:p-12">
                                    <div className="flex justify-between items-center mb-8">
                                        <Dialog.Title className="text-3xl font-black text-slate-900">
                                            {isEditing ? 'Edit Chapter Meeting' : 'Schedule Chapter Meeting'}
                                        </Dialog.Title>
                                        <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                            <XMarkIcon className="w-6 h-6 text-slate-400" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                                        {/* Status Dropdown - Only for Edit Mode */}
                                        {isEditing && (
                                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                                                <label className="block text-xs font-black text-amber-900 uppercase tracking-widest mb-2">Meeting Status</label>
                                                <select
                                                    value={formData.status}
                                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                                    className="w-full px-4 py-2 bg-white border border-amber-200 rounded-lg text-sm font-bold text-amber-900 focus:ring-2 focus:ring-amber-400 outline-none"
                                                >
                                                    <option value="Scheduled">Scheduled</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Not Completed">Not Completed</option>
                                                </select>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Meeting Subject *</label>
                                                <input
                                                    required
                                                    disabled={isOrgAdmin && !isChapterAdmin} // Admin Read-Only logic if needed (though admin shouldn't open this modal usually, or if they do, read-only?)
                                                    type="text"
                                                    value={formData.title}
                                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                    placeholder="e.g. Monthly Strategy Review"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Meeting Mode</label>
                                                <div className="flex gap-2">
                                                    {['In-Person', 'Virtual'].map(m => (
                                                        <button
                                                            key={m}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, mode: m })}
                                                            className={twMerge(
                                                                "flex-1 py-2 rounded-xl text-xs font-black transition-all border",
                                                                formData.mode === m
                                                                    ? "bg-primary-50 border-primary-600 text-primary-600"
                                                                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                                                            )}
                                                        >
                                                            {m}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {formData.mode === 'Virtual' ? (
                                                <div className="md:col-span-2">
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Meeting Link *</label>
                                                    <input
                                                        required={formData.mode === 'Virtual'}
                                                        type="url"
                                                        value={formData.meetingLink}
                                                        onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500"
                                                        placeholder="https://zoom.us/j/..."
                                                    />
                                                </div>
                                            ) : (
                                                <div className="md:col-span-2">
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Meeting Place *</label>
                                                    <input
                                                        required={formData.mode === 'In-Person'}
                                                        type="text"
                                                        value={formData.location}
                                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500"
                                                        placeholder="Hotel Royal, Conference Hall A"
                                                    />
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date *</label>
                                                <input
                                                    required
                                                    type="date"
                                                    value={formData.meetingDate}
                                                    onChange={e => setFormData({ ...formData, meetingDate: e.target.value })}
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cutoff *</label>
                                                <input
                                                    required
                                                    type="date"
                                                    value={formData.cutoffDate}
                                                    onChange={e => setFormData({ ...formData, cutoffDate: e.target.value })}
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Start *</label>
                                                <input
                                                    required
                                                    type="time"
                                                    value={formData.startTime}
                                                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">End *</label>
                                                <input
                                                    required
                                                    type="time"
                                                    value={formData.endTime}
                                                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Charges (₹)</label>
                                                <input
                                                    type="number"
                                                    value={formData.charges}
                                                    onChange={e => setFormData({ ...formData, charges: e.target.value })}
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Link</label>
                                                <input
                                                    type="url"
                                                    value={formData.paymentLink}
                                                    onChange={e => setFormData({ ...formData, paymentLink: e.target.value })}
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500"
                                                    placeholder="Razorpay Link"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description *</label>
                                                <textarea
                                                    required
                                                    rows={3}
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold resize-none focus:ring-2 focus:ring-primary-500"
                                                    placeholder="Detailed agenda..."
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all hover:scale-[1.02] active:scale-95"
                                        >
                                            {isEditing ? 'Update Meeting' : 'Schedule Meeting'}
                                        </button>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Visit Registration Modal */}
            <Transition.Root show={isVisitorModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[60]" onClose={() => setIsVisitorModalOpen(false)}>
                    <Transition.Child as={Fragment}>
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child as={Fragment}>
                                <Dialog.Panel className="w-full max-w-md bg-white rounded-[30px] shadow-2xl p-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <Dialog.Title className="text-xl font-black text-slate-900">Add Visitor</Dialog.Title>
                                        <button onClick={() => setIsVisitorModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><XMarkIcon className="w-6 h-6" /></button>
                                    </div>
                                    <form onSubmit={handleAddVisitor} className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Visitor Name *</label>
                                            <input required type="text" value={visitorForm.name} onChange={e => setVisitorForm({ ...visitorForm, name: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email *</label>
                                            <input required type="email" value={visitorForm.email} onChange={e => setVisitorForm({ ...visitorForm, email: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Number *</label>
                                            <input required type="text" value={visitorForm.contact_number} onChange={e => setVisitorForm({ ...visitorForm, contact_number: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Company Name</label>
                                            <input type="text" value={visitorForm.company_name} onChange={e => setVisitorForm({ ...visitorForm, company_name: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Chapter</label>
                                            <input type="text" value={visitorForm.chapter} onChange={e => setVisitorForm({ ...visitorForm, chapter: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                                        </div>
                                        <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">Add Visitor</button>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Registration List Modal */}
            <Transition.Root show={isRegListModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsRegListModalOpen(false)}>
                    <Transition.Child as={Fragment}>
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child as={Fragment}>
                                <Dialog.Panel className="w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden p-8">
                                    <div className="flex justify-between items-center mb-8">
                                        <Dialog.Title className="text-2xl font-black text-slate-900">
                                            Registered Members
                                        </Dialog.Title>
                                        <button onClick={() => setIsRegListModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                            <XMarkIcon className="w-6 h-6 text-slate-400" />
                                        </button>
                                    </div>

                                    {loadingRegs ? (
                                        <div className="flex justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                        </div>
                                    ) : registrations.length === 0 ? (
                                        <div className="text-center py-12 text-slate-400 font-bold">No members registered yet.</div>
                                    ) : (
                                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {registrations.map(reg => (
                                                <div key={reg.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                                    <div>
                                                        <p className="font-black text-slate-900">{reg.member_name}</p>
                                                        <p className="text-xs font-bold text-slate-400">{reg.member_email}</p>
                                                    </div>
                                                    <span className={twMerge(
                                                        "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
                                                        reg.type === 'Visitor' ? "text-indigo-600 bg-indigo-50" : "text-emerald-600 bg-emerald-50"
                                                    )}>
                                                        {reg.type || 'Registered'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Details Modal */}
            <Transition.Root show={isDetailsModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsDetailsModalOpen(false)}>
                    <Transition.Child as={Fragment}>
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child as={Fragment}>
                                <Dialog.Panel className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden p-8 md:p-10">
                                    {selectedMeeting && (
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h2 className="text-3xl font-black text-slate-900 leading-tight">{selectedMeeting.title}</h2>
                                                    {/* Status Badge */}
                                                    <div className="flex gap-2">
                                                        {selectedMeeting.status && (
                                                            <span className={twMerge(
                                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                                selectedMeeting.status === 'Completed' ? "bg-green-100 text-green-700" :
                                                                    selectedMeeting.status === 'Not Completed' ? "bg-red-100 text-red-700" :
                                                                        "bg-blue-100 text-blue-700"
                                                            )}>
                                                                {selectedMeeting.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <button onClick={() => setIsDetailsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                                    <XMarkIcon className="w-6 h-6 text-slate-400" />
                                                </button>
                                            </div>

                                            {/* Admin Actions: Edit & Add Visitor */}
                                            {isChapterAdmin && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <button
                                                        onClick={() => {
                                                            setIsDetailsModalOpen(false);
                                                            handleEdit(selectedMeeting);
                                                        }}
                                                        className="py-2 bg-amber-50 text-amber-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-100 transition-all border border-amber-200"
                                                    >
                                                        <PencilSquareIcon className="w-5 h-5" />
                                                        Edit / Status
                                                    </button>
                                                    <button
                                                        onClick={() => setIsVisitorModalOpen(true)}
                                                        className="py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-200"
                                                    >
                                                        <UserGroupIcon className="w-5 h-5" />
                                                        Add Visitor
                                                    </button>
                                                </div>
                                            )}

                                            <div className="p-6 bg-slate-50 rounded-[30px] space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-2xl shadow-sm text-primary-600">
                                                        <CalendarIcon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting Date</p>
                                                        <p className="font-bold text-slate-900">{new Date(selectedMeeting.meeting_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-2xl shadow-sm text-primary-600">
                                                        <ClockIcon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Slot</p>
                                                        <p className="font-bold text-slate-900">{selectedMeeting.start_time.slice(0, 5)} - {selectedMeeting.end_time.slice(0, 5)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-2xl shadow-sm text-primary-600">
                                                        {selectedMeeting.mode === 'Virtual' ? <LinkIcon className="w-6 h-6" /> : <MapPinIcon className="w-6 h-6" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Venue / Link</p>
                                                        {selectedMeeting.mode === 'Virtual' ? (
                                                            <a href={selectedMeeting.meeting_link} target="_blank" rel="noopener noreferrer" className="font-bold text-primary-600 hover:underline break-all block">Join Virtual Meeting</a>
                                                        ) : (
                                                            <p className="font-bold text-slate-900 truncate">{selectedMeeting.location}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-2xl shadow-sm text-primary-600">
                                                        <CurrencyRupeeIcon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Participation Fee</p>
                                                        <p className="font-bold text-slate-900">{parseFloat(selectedMeeting.charges) > 0 ? `₹${selectedMeeting.charges}` : 'Complimentary'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">About the Meeting</h4>
                                                <div className="prose prose-slate max-w-none">
                                                    <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{selectedMeeting.description}</p>
                                                </div>
                                            </div>

                                            {(!isAdmin && timeTab === 'upcoming') && (
                                                <div className="flex gap-4 pt-4">
                                                    {parseFloat(selectedMeeting.charges) > 0 && selectedMeeting.payment_link && (
                                                        <a
                                                            href={selectedMeeting.payment_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-center shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                                                        >
                                                            Pay Securely
                                                        </a>
                                                    )}
                                                    <button
                                                        disabled={selectedMeeting.isRegistered}
                                                        onClick={() => handleRegister(selectedMeeting.id)}
                                                        className={twMerge(
                                                            "flex-1 py-4 rounded-2xl font-black text-lg shadow-lg transition-all",
                                                            selectedMeeting.isRegistered
                                                                ? "bg-emerald-50 text-emerald-600 cursor-default shadow-none"
                                                                : "bg-primary-600 text-white hover:bg-primary-700 shadow-primary-100"
                                                        )}
                                                    >
                                                        {selectedMeeting.isRegistered ? 'Already Registered' : 'Register Now'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
};

export default ChapterMeetings;
