import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import dataService from '../services/dataService';
import { toast } from 'react-toastify';

const UpdatePostModal = ({ isOpen, onClose, onPostUpdated, post }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (post) {
            setFormData({
                title: post.title || '',
                description: post.description || '',
            });
        }
    }, [post]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await dataService.updatePost(post.id, formData);
            onPostUpdated(response.data.data);
            onClose();
            toast.success('Post updated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update post');
        } finally {
            setLoading(false);
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
                            <Dialog.Panel className="relative transform overflow-hidden rounded-md bg-white p-6 shadow-xl transition-all w-full max-w-2xl border border-gray-200">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title as="h3" className="text-xl font-medium text-gray-700">
                                        Edit Post
                                    </Dialog.Title>
                                    <button
                                        type="button"
                                        className="h-8 w-8 flex items-center justify-center rounded bg-gray-500 text-white hover:bg-gray-600 transition-colors"
                                        onClick={onClose}
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <textarea
                                        name="title"
                                        placeholder="Title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-md p-3 focus:ring-1 focus:ring-blue-100 focus:border-blue-200 resize-none"
                                        required
                                    />

                                    <textarea
                                        name="description"
                                        placeholder="Details..."
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={6}
                                        className="w-full text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-md p-4 focus:ring-1 focus:ring-blue-100 focus:border-blue-200 resize-none"
                                        required
                                    />

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-11 bg-[#4bb1f9] hover:bg-[#3ca1e9] text-white font-medium rounded-md transition-colors mt-2 disabled:opacity-50"
                                    >
                                        {loading ? 'Updating...' : 'Update Post'}
                                    </button>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

export default UpdatePostModal;
