import React, { useState, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PhotoIcon, CalendarIcon, ClockIcon, CurrencyRupeeIcon, UserIcon, IdentificationIcon, BookOpenIcon, LinkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import API_ENDPOINTS from '../config/apiConfig';

const ScheduleTrainingModal = ({ isOpen, onClose, onTrainingCreated }) => {
    const [formData, setFormData] = useState({
        training_title: '',
        trainer_name: '',
        training_start_date: '',
        training_end_date: '',
        training_start_time: '',
        training_end_time: '',
        training_charges: '',
        registration_last_date: '',
        payment_link: '',
        training_mode: '',
        training_description: '',
        training_link: '',
        training_location: ''
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const timeOptions = [
        '12:00 AM', '12:30 AM', '01:00 AM', '01:30 AM', '02:00 AM', '02:30 AM',
        '03:00 AM', '03:30 AM', '04:00 AM', '04:30 AM', '05:00 AM', '05:30 AM',
        '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
        '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
        '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
        '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const convertTo24Hour = (time12h) => {
        if (!time12h) return "00:00:00";
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');

        if (hours === '12') {
            hours = '00';
        }

        if (modifier === 'PM') {
            hours = parseInt(hours, 10) + 12;
        }

        return `${hours}:${minutes}:00`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formDataToSend = new FormData();

            // Convert times to 24-hour format
            const startTime24 = convertTo24Hour(formData.training_start_time);
            const endTime24 = convertTo24Hour(formData.training_end_time);

            formDataToSend.append('training_title', formData.training_title);
            formDataToSend.append('trainer_name', formData.trainer_name);
            formDataToSend.append('training_start_date', formData.training_start_date);
            formDataToSend.append('training_end_date', formData.training_end_date);
            formDataToSend.append('training_start_time', startTime24);
            formDataToSend.append('training_end_time', endTime24);
            formDataToSend.append('training_charges', formData.training_charges);
            formDataToSend.append('registration_last_date', formData.registration_last_date);
            formDataToSend.append('payment_link', formData.payment_link);
            formDataToSend.append('training_mode', formData.training_mode);
            formDataToSend.append('training_description', formData.training_description);
            formDataToSend.append('training_link', formData.training_link);
            formDataToSend.append('training_location', formData.training_location);

            if (selectedImage) {
                formDataToSend.append('image', selectedImage);
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_ENDPOINTS.TRAININGS}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Training scheduled successfully');
                onTrainingCreated(data.data);
                setFormData({
                    training_title: '',
                    trainer_name: '',
                    training_start_date: '',
                    training_end_date: '',
                    training_start_time: '',
                    training_end_time: '',
                    training_charges: '',
                    registration_last_date: '',
                    payment_link: '',
                    training_mode: '',
                    training_description: '',
                    training_link: '',
                    training_location: ''
                });
                setSelectedImage(null);
                setImagePreview(null);
                onClose();
            } else {
                toast.error(data.message || 'Failed to schedule training');
            }
        } catch (error) {
            console.error('Error scheduling training:', error);
            toast.error('Failed to schedule training');
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
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all w-full max-w-2xl border border-slate-200/50">
                                {/* Header */}
                                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                                    <div>
                                        <Dialog.Title as="h3" className="text-2xl font-black text-slate-900 tracking-tight">
                                            Schedule Training
                                        </Dialog.Title>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Define a new learning session for the community</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-200 active:scale-90"
                                        onClick={onClose}
                                    >
                                        <XMarkIcon className="h-6 w-6 text-slate-400" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                                    {/* Row 1: Training Title and Trainer Name */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                <BookOpenIcon className="w-3.5 h-3.5" />
                                                Training Title
                                            </label>
                                            <input
                                                type="text"
                                                name="training_title"
                                                placeholder="e.g. Advanced AI Integration"
                                                value={formData.training_title}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                <UserIcon className="w-3.5 h-3.5" />
                                                Lead Trainer
                                            </label>
                                            <input
                                                type="text"
                                                name="trainer_name"
                                                placeholder="Full Professional Name"
                                                value={formData.trainer_name}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Schedule Section */}
                                    <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-200/50 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <CalendarIcon className="w-3.5 h-3.5" />
                                                Timeline & Venue
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Commences On</label>
                                                <input
                                                    type="date"
                                                    name="training_start_date"
                                                    value={formData.training_start_date}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary-50 transition-all"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Concludes On</label>
                                                <input
                                                    type="date"
                                                    name="training_end_date"
                                                    value={formData.training_end_date}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary-50 transition-all"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Daily Start</label>
                                                <select
                                                    name="training_start_time"
                                                    value={formData.training_start_time}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary-50 transition-all"
                                                    required
                                                >
                                                    <option value="">Start Time</option>
                                                    {timeOptions.map(time => (
                                                        <option key={time} value={time}>{time}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Daily End</label>
                                                <select
                                                    name="training_end_time"
                                                    value={formData.training_end_time}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary-50 transition-all"
                                                    required
                                                >
                                                    <option value="">End Time</option>
                                                    {timeOptions.map(time => (
                                                        <option key={time} value={time}>{time}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Economics & Deadline */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                <CurrencyRupeeIcon className="w-3.5 h-3.5" />
                                                Session Fee (₹)
                                            </label>
                                            <input
                                                type="number"
                                                name="training_charges"
                                                placeholder="0 for Complimentary"
                                                value={formData.training_charges}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                <ClockIcon className="w-3.5 h-3.5" />
                                                Registration Deadline
                                            </label>
                                            <input
                                                type="date"
                                                name="registration_last_date"
                                                value={formData.registration_last_date}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all font-sans"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Payment Link */}
                                    {parseInt(formData.training_charges) > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-2"
                                        >
                                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                <LinkIcon className="w-3.5 h-3.5" />
                                                Payment Gateway URL
                                            </label>
                                            <input
                                                type="url"
                                                name="payment_link"
                                                placeholder="https://pay.example.com/..."
                                                value={formData.payment_link}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300"
                                            />
                                        </motion.div>
                                    )}

                                    {/* Row 6: Training Mode and Image Upload */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                <IdentificationIcon className="w-3.5 h-3.5" />
                                                Training Environment
                                            </label>
                                            <select
                                                name="training_mode"
                                                value={formData.training_mode}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all"
                                                required
                                            >
                                                <option value="">Select Mode</option>
                                                <option value="Virtual">Virtual Session</option>
                                                <option value="In-Person">In-Person Experience</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                <PhotoIcon className="w-3.5 h-3.5" />
                                                Program Banner
                                            </label>
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="flex-1 px-4 py-4 bg-white border border-slate-200 rounded-2xl text-[13px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all active:scale-[0.98]"
                                                >
                                                    {selectedImage ? "Change Image" : "Select Banner"}
                                                </button>
                                                {imagePreview && (
                                                    <div className="h-12 w-12 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                                        <img src={imagePreview} className="h-full w-full object-cover" alt="Preview" />
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>

                                    {/* Mode specific fields */}
                                    {(formData.training_mode === 'Virtual' || formData.training_mode === 'In-Person') && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-2"
                                        >
                                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                {formData.training_mode === 'Virtual' ? <LinkIcon className="w-3.5 h-3.5" /> : <MapPinIcon className="w-3.5 h-3.5" />}
                                                {formData.training_mode === 'Virtual' ? 'Session Link' : 'Physical Location'}
                                            </label>
                                            <input
                                                type={formData.training_mode === 'Virtual' ? 'url' : 'text'}
                                                name={formData.training_mode === 'Virtual' ? 'training_link' : 'training_location'}
                                                placeholder={formData.training_mode === 'Virtual' ? 'https://zoom.us/...' : 'Executive Training Center, Wing B'}
                                                value={formData.training_mode === 'Virtual' ? formData.training_link : formData.training_location}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300"
                                                required
                                            />
                                        </motion.div>
                                    )}

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                            <IdentificationIcon className="w-3.5 h-3.5" />
                                            Program Curriculam / Overview
                                        </label>
                                        <textarea
                                            name="training_description"
                                            placeholder="Provide a comprehensive narrative for prospective participants..."
                                            value={formData.training_description}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300 resize-none"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-4 pt-8 sticky bottom-0 bg-white">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 px-4 py-4 border border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                                        >
                                            Discard
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-[2] px-4 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-[#4bb1f9] hover:shadow-[#4bb1f9]/20 transition-all active:scale-95"
                                        >
                                            Initialize Program
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

export default ScheduleTrainingModal;
