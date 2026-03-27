import React, { useState, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PhotoIcon, ChatBubbleBottomCenterTextIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import dataService from '../services/dataService';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [images, setImages] = useState([]);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleCameraClick = () => {
        cameraInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(prev => [...prev, ...files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const postPayload = new FormData();
            postPayload.append('title', formData.title);
            postPayload.append('description', formData.description);
            if (images.length > 0) {
                // Backend currently supports single image 'uploadPost.single("image")'
                postPayload.append('image', images[0]);
            }

            const response = await dataService.createPost(postPayload);
            onPostCreated(response.data.data);
            setFormData({ title: '', description: '' });
            setImages([]);
            onClose();
            toast.success('Post created successfully');
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to create post';
            toast.error(errorMsg);
        }
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
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

                <div className="fixed inset-0 z-10 overflow-y-auto">
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
                            <Dialog.Panel className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all w-full max-w-xl border border-slate-200/50">
                                {/* Header */}
                                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                                    <div>
                                        <Dialog.Title as="h3" className="text-2xl font-black text-slate-900 tracking-tight">
                                            Create Post
                                        </Dialog.Title>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Share updates with your organization</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-200 active:scale-90"
                                        onClick={onClose}
                                    >
                                        <XMarkIcon className="h-6 w-6 text-slate-400" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                    {/* Intro/Headline */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                            <ChatBubbleBottomCenterTextIcon className="w-3.5 h-3.5" />
                                            Headline
                                        </label>
                                        <textarea
                                            name="title"
                                            placeholder="What's on your mind? Write a catchy headline..."
                                            value={formData.title}
                                            onChange={handleChange}
                                            rows={2}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300 resize-none"
                                            required
                                        />
                                    </div>

                                    {/* Add Media Buttons */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            onClick={handleFileClick}
                                            className="group relative w-full h-16 bg-primary-50 border-2 border-dashed border-primary-200 rounded-2xl flex items-center justify-center gap-3 cursor-pointer hover:bg-primary-100 hover:border-primary-300 transition-all active:scale-[0.98]"
                                        >
                                            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-200 group-hover:scale-110 transition-transform">
                                                <PhotoIcon className="h-5 w-5 text-white" />
                                            </div>
                                            <span className="text-sm font-black text-primary-700 uppercase tracking-widest hidden sm:inline">Gallery</span>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                                multiple
                                                accept="image/*,video/*"
                                            />
                                        </div>

                                        <div
                                            onClick={handleCameraClick}
                                            className="group relative w-full h-16 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-2xl flex items-center justify-center gap-3 cursor-pointer hover:bg-emerald-100 hover:border-emerald-300 transition-all active:scale-[0.98]"
                                        >
                                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-black text-emerald-700 uppercase tracking-widest hidden sm:inline">Camera</span>
                                            <input
                                                type="file"
                                                ref={cameraInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                                accept="image/*,video/*"
                                                capture="environment"
                                            />
                                        </div>
                                    </div>

                                    {/* Media Preview */}
                                    <AnimatePresence>
                                        {images.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar"
                                            >
                                                {images.map((img, i) => (
                                                    <motion.div
                                                        key={i}
                                                        layout
                                                        className="relative flex-shrink-0 w-24 h-24 group rounded-xl overflow-hidden shadow-md border border-slate-100"
                                                    >
                                                        <img
                                                            src={URL.createObjectURL(img)}
                                                            alt="preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setImages(prev => prev.filter((_, idx) => idx !== i));
                                                            }}
                                                            className="absolute top-1 right-1 bg-slate-900/80 text-white rounded-lg p-1 transition-all hover:bg-red-500 active:scale-90"
                                                        >
                                                            <XMarkIcon className="w-4 h-4" />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Detailed Description */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                            <DocumentTextIcon className="w-3.5 h-3.5" />
                                            Detailed Story
                                        </label>
                                        <textarea
                                            name="description"
                                            placeholder="Elaborate your post here. Add details, links, or context..."
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={5}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300 resize-none"
                                            required
                                        />
                                    </div>

                                    {/* Footer / Action */}
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-emerald-600 hover:shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            Share with Community
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

export default CreatePostModal;
