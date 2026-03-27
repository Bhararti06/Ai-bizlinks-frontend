import React, { useState, useEffect } from 'react';
import {
    ClipboardDocumentCheckIcon,
    CloudArrowUpIcon,
    DocumentIcon,
    DocumentTextIcon,
    PhotoIcon,
    TrashIcon,
    EllipsisVerticalIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS_URL } from '../config/apiConfig';
import { toast } from 'react-toastify';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

import dataService from '../services/dataService';
import { useAuth } from '../context/AuthContext';

const BASE_URL = ASSETS_URL;

const Files = () => {
    const { user } = useAuth();
    const [files, setFiles] = useState([]);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const res = await dataService.getFiles();
            setFiles(res.data.data);
        } catch (error) {
            console.error("Failed to fetch files");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await dataService.uploadFile(formData);
            toast.success('File uploaded successfully!');
            setIsUploadOpen(false);
            setSelectedFile(null);
            fetchFiles();
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload file');
        }
    };

    const handleDelete = async (file) => {
        if (window.confirm('Delete this file?')) {
            try {
                await dataService.deleteFile(file.id);
                setFiles(files.filter(f => f.id !== file.id));
                toast.info('File removed');
            } catch (error) {
                toast.error('Failed to delete file');
            }
        }
    };

    const getFileIcon = (type) => {
        const t = (type || '').toLowerCase();
        if (['jpg', 'png', 'jpeg', 'webp'].includes(t)) return <PhotoIcon className="w-8 h-8 text-purple-500" />;
        if (['pdf'].includes(t)) return <DocumentTextIcon className="w-8 h-8 text-red-500" />;
        if (['doc', 'docx'].includes(t)) return <DocumentIcon className="w-8 h-8 text-blue-500" />;
        return <ClipboardDocumentCheckIcon className="w-8 h-8 text-slate-400" />;
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 mt-6 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">My Files</h1>
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">
                            {(user?.role === 'admin' || user?.role === 'chapter_admin' ? files : files.filter(f => f.user_id === user?.id)).length} Documents available
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsUploadOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95"
                >
                    <CloudArrowUpIcon className="w-5 h-5" />
                    Add Files
                </button>
            </div>

            {/* Files Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(user?.role === 'admin' || user?.role === 'chapter_admin' ? files : files.filter(f => f.user_id === user?.id)).map((file) => (
                    <div key={file.id} className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-slate-100 transition-colors">
                                {getFileIcon(file.type)}
                            </div>
                            {/* Option Menu (Placeholder or functional) */}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 truncate mb-1" title={file.name}>{file.name}</h3>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{(file.type || 'FILE').toUpperCase()} • {formatSize(file.size)}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Uploaded {new Date(file.created_at).toLocaleDateString()}</p>
                            </div>

                            {(file.user_id === user?.id || user?.role === 'admin') && (
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => window.open(BASE_URL + file.path, '_blank')}
                                        className="p-1.5 text-slate-300 hover:text-primary-500 transition-colors"
                                        title="Preview"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file)}
                                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Empty State Helper - if no files */}
                {files.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <CloudArrowUpIcon className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-sm font-bold uppercase tracking-widest opacity-50">Drop files here to upload</p>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            <Transition appear show={isUploadOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsUploadOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-black leading-6 text-slate-900 mb-4">
                                        Upload File
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <div className="flex items-center justify-center w-full">
                                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <CloudArrowUpIcon className="w-10 h-10 text-slate-400 mb-3" />
                                                    <p className="text-sm text-slate-500 font-bold"><span className="text-primary-600">Click to upload</span> or drag and drop</p>
                                                    <p className="text-xs text-slate-400 mt-1">PDF, DOC, JPG (MAX. 5MB)</p>
                                                </div>
                                                <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                        {selectedFile && (
                                            <div className="mt-4 p-3 bg-primary-50 rounded-lg flex items-center gap-3">
                                                <DocumentIcon className="w-5 h-5 text-primary-600" />
                                                <span className="text-sm font-semibold text-slate-700 truncate">{selectedFile.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                            onClick={() => { setIsUploadOpen(false); setSelectedFile(null); }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="px-6 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={handleUpload}
                                            disabled={!selectedFile}
                                        >
                                            Upload
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default Files;
