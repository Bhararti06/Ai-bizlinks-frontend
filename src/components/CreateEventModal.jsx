import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import dataService from '../services/dataService';
import { toast } from 'react-toastify';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';

const CreateEventModal = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        organizerName: '',
        eventDate: '',
        eventEndDate: '',
        eventTimeIn: '',
        eventTimeOut: '',
        eventCharges: '0',
        registrationCutoffDate: '',
        paymentLink: '',
        eventMode: '',
        location: '',
        eventLink: '',
        chapter: user?.role === 'chapter_admin' ? user?.chapter : ''
    });

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let imagePath = null;

            // 1. Upload Image if exists
            if (imageFile) {
                const imageFormData = new FormData();
                imageFormData.append('image', imageFile);
                try {
                    const uploadRes = await dataService.uploadEventImage(imageFormData);
                    if (uploadRes.data.success) {
                        imagePath = uploadRes.data.imagePath;
                    }
                } catch (imgError) {
                    console.error('Image upload failed', imgError);
                    toast.warning('Image upload failed, creating event without image');
                }
            }

            // 2. Create Event
            const payload = {
                ...formData,
                imagePath: imagePath
            };

            await dataService.createEvent(payload);
            toast.success('Event created successfully');
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200/50"
            >
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Event</h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Initialize a new organization gathering</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-200 active:scale-90">
                        <XMarkIcon className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                <span>🏷️</span> Event Topic
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Annual Strategic Growth Summit"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    <span>👤</span> Organizer
                                </label>
                                <input
                                    type="text"
                                    placeholder="Executive Lead Name"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300"
                                    value={formData.organizerName}
                                    onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    <span>🌐</span> Atmosphere
                                </label>
                                <Listbox value={formData.eventMode} onChange={(value) => setFormData({ ...formData, eventMode: value })}>
                                    <div className="relative mt-1">
                                        <Listbox.Button className="relative w-full cursor-pointer px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-50 text-left transition-all">
                                            <span className="block truncate">{formData.eventMode === 'In-Person' ? 'In-Person Experience' : formData.eventMode === 'Virtual' ? 'Virtual Session' : 'Select Mode'}</span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                                <ChevronUpDownIcon
                                                    className="h-5 w-5 text-gray-400"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        </Listbox.Button>
                                        <Transition
                                            as={React.Fragment}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-2xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {[{ id: 'In-Person', name: 'In-Person Experience' }, { id: 'Virtual', name: 'Virtual Session' }].map((mode) => (
                                                    <Listbox.Option
                                                        key={mode.id}
                                                        className={({ active }) =>
                                                            `relative cursor-default select-none py-3 pl-10 pr-4 ${active ? 'bg-primary-50 text-primary-900' : 'text-gray-900'
                                                            }`
                                                        }
                                                        value={mode.id}
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span
                                                                    className={`block truncate ${selected ? 'font-bold' : 'font-normal'
                                                                        }`}
                                                                >
                                                                    {mode.name}
                                                                </span>
                                                                {selected ? (
                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                    </span>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </Transition>
                                    </div>
                                </Listbox>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Section */}
                    <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-200/50 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span>📅</span> Schedule & Timing
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Launch Date</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary-50 transition-all"
                                    value={formData.eventDate}
                                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Conclusion</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary-50 transition-all"
                                    value={formData.eventEndDate}
                                    onChange={(e) => setFormData({ ...formData, eventEndDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Commencement</label>
                                <input
                                    type="time"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary-50 transition-all"
                                    value={formData.eventTimeIn}
                                    onChange={(e) => setFormData({ ...formData, eventTimeIn: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Adjournment</label>
                                <input
                                    type="time"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary-50 transition-all"
                                    value={formData.eventTimeOut}
                                    onChange={(e) => setFormData({ ...formData, eventTimeOut: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Geography / Access */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            {formData.eventMode === 'In-Person' ? <span>📍 Venue Address</span> : <span>🔗 Digital Access Link</span>}
                        </label>
                        <input
                            type={formData.eventMode === 'Virtual' ? 'url' : 'text'}
                            placeholder={formData.eventMode === 'Virtual' ? 'https://zoom.us/j/...' : 'Grand Ballroom, Plaza Hotel'}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300"
                            value={formData.eventMode === 'Virtual' ? formData.eventLink : formData.location}
                            onChange={(e) => setFormData({
                                ...formData,
                                [formData.eventMode === 'Virtual' ? 'eventLink' : 'location']: e.target.value
                            })}
                        />
                    </div>

                    {/* Economics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                <span>💰</span> Investment (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all"
                                value={formData.eventCharges}
                                onChange={(e) => setFormData({ ...formData, eventCharges: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                <span>⌛</span> RSVP Deadline
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all font-sans"
                                value={formData.registrationCutoffDate}
                                onChange={(e) => setFormData({ ...formData, registrationCutoffDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {
                        parseInt(formData.eventCharges) > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-2"
                            >
                                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    <span>💳</span> Transaction Portal Link
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://buy.stripe.com/..."
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300"
                                    value={formData.paymentLink}
                                    onChange={(e) => setFormData({ ...formData, paymentLink: e.target.value })}
                                />
                            </motion.div>
                        )
                    }

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            <span>📝</span> Narrative Overview
                        </label>
                        <textarea
                            rows="4"
                            placeholder="Provide deep context for attendees..."
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300 resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    {/* Visual Asset */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            <span>🖼️</span> Visual Manifest
                        </label>
                        <div className="flex items-center gap-6">
                            <label className="cursor-pointer group flex items-center justify-center px-6 py-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:border-primary-400 hover:text-primary-600 transition-all gap-3 flex-1 active:scale-[0.98]">
                                <PhotoIcon className="w-6 h-6" />
                                <span className="text-sm font-black uppercase tracking-widest">Select Image Asset</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                            {imagePreview && (
                                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-xl group/preview">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                                        className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover/preview:opacity-100 transition-all flex items-center justify-center"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row gap-4 sticky bottom-0 bg-white">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-4 border border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] px-4 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-primary-600 hover:shadow-primary-100 transition-all active:scale-95 disabled:opacity-70"
                        >
                            {loading ? 'Synchronizing...' : 'Finalize & Publish'}
                        </button>
                    </div>
                </form >
            </motion.div >
        </div >
    );

    return createPortal(modalContent, document.body);
};

export default CreateEventModal;
