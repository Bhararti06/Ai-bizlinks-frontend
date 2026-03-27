import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS_URL } from '../config/apiConfig';
import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline';

const MemberDetailsModal = ({ isOpen, onClose, member, mode = 'view', onUpdate }) => {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        chapter: '',
        categoryId: '',
        planId: ''
    });

    useEffect(() => {
        if (member) {
            setFormData({
                name: member.name || '',
                mobile: member.mobile || '',
                chapter: member.chapter || '',
                categoryId: member.category_id || '',
                planId: member.plan_id || ''
            });
        }
    }, [member]);

    if (!member) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(member.id, formData);
    };

    const isEdit = mode === 'edit';

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-[9999]">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                        <Dialog.Title className="text-xl font-bold text-gray-900">
                            {isEdit ? 'Edit Member Details' : 'Member Profile'}
                        </Dialog.Title>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden mb-3 border-4 border-white shadow-lg">
                                {member.profile_image ? (
                                    <img
                                        src={`${ASSETS_URL}${member.profile_image}`}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <UserIcon className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                            <p className="text-sm text-gray-500">{member.email}</p>
                            <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${member.status === 'approved' ? 'bg-green-100 text-green-700' :
                                member.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
                                    member.status === 'deleted' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {member.status === 'approved' ? 'Active' : member.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!isEdit}
                                    className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        disabled={!isEdit}
                                        className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
                                    <input
                                        type="text"
                                        name="chapter"
                                        value={formData.chapter}
                                        onChange={handleChange}
                                        disabled={!isEdit}
                                        className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category ID</label>
                                    <input
                                        type="text"
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        disabled={!isEdit}
                                        className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Plan ID</label>
                                    <input
                                        type="text"
                                        name="planId"
                                        value={formData.planId}
                                        onChange={handleChange}
                                        disabled={!isEdit}
                                        className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {!isEdit && (
                            <div className="mt-8 flex justify-center">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-10 py-3 bg-slate-900 text-white rounded-xl text-[13px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                                >
                                    Close Profile
                                </button>
                            </div>
                        )}
                        {isEdit && (
                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default MemberDetailsModal;
