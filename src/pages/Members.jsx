import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS_URL } from '../config/apiConfig';
import { useNavigate, useParams } from 'react-router-dom';
import dataService from '../services/dataService';
import {
    UserIcon,
    MapPinIcon,
    EyeIcon,
    PhoneIcon,
    EnvelopeIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';

const Members = () => {
    const navigate = useNavigate();
    const { orgCode } = useParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const itemsPerPage = 12;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await dataService.getUsers();
            if (res.data.success) {
                // Filter to show only approved members
                const activeMembers = res.data.data.filter(u => u.status === 'approved');
                setUsers(activeMembers);
            }
        } catch (error) {
            console.error("Failed to fetch members", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter users based on search query
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.chapter && user.chapter.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 mt-6 pb-10">
            {/* Header */}
            <div className="premium-card p-4 md:p-8 bg-white">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Member Directory</h1>
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">
                                {filteredUsers.length} Active Members
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="w-full md:w-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-80 px-4 py-3 pl-11 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-300 focus:bg-white transition-all"
                            />
                            <svg
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 premium-card">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-primary-600 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary-600 animate-ping" />
                        </div>
                    </div>
                    <p className="mt-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Loading Directory</p>
                </div>
            ) : (
                <div className="premium-card p-6">
                    {paginatedUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-4">
                                <UserIcon className="w-12 h-12 opacity-20" />
                            </div>
                            <p className="text-sm font-bold uppercase tracking-widest opacity-40">
                                {searchQuery ? 'No members found matching your search' : 'No members found'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Member Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="group relative bg-white border-2 border-slate-100 rounded-3xl p-6 hover:border-primary-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
                                        onClick={() => navigate(`/${orgCode}/members/${user.id}`)}
                                    >
                                        {/* Profile Header */}
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="relative flex-shrink-0">
                                                <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden border-2 border-white shadow-lg ring-2 ring-slate-100 group-hover:ring-primary-200 transition-all">
                                                    {user.profile_image ? (
                                                        <img
                                                            src={`${ASSETS_URL}${user.profile_image}`}
                                                            alt={user.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
                                                            <UserIcon className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-black text-slate-900 mb-1 truncate group-hover:text-primary-600 transition-colors">
                                                    {user.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-slate-500 mb-2">
                                                    <EnvelopeIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                                    <p className="text-xs font-semibold truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Member Details */}
                                        <div className="space-y-3 mb-4">
                                            {user.contact_number && (
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <PhoneIcon className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm font-semibold">{user.contact_number}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <MapPinIcon className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-bold text-slate-700">
                                                    {user.chapter || 'Global'}
                                                </span>
                                            </div>

                                            {user.years_in_business && (
                                                <div className="flex items-center gap-2">
                                                    <BriefcaseIcon className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm font-semibold text-slate-600">
                                                        {user.years_in_business} years experience
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Category Badge */}
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                            <span className={twMerge(
                                                "inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                                user.role === 'admin' ? "bg-purple-100 text-purple-700" :
                                                    user.role === 'chapter_admin' ? "bg-orange-100 text-orange-700" :
                                                        "bg-slate-100 text-slate-600"
                                            )}>
                                                {user.role === 'admin' ? 'Global Admin' :
                                                    user.role === 'chapter_admin' ? `Chapter Admin - ${user.chapter || ''}` :
                                                        (user.category_name || user.category_title || 'Member')}
                                            </span>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/${orgCode}/members/${user.id}`);
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg font-bold text-xs transition-all active:scale-95"
                                            >
                                                <EyeIcon className="w-3.5 h-3.5" />
                                                View
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {filteredUsers.length > itemsPerPage && (
                                <div className="flex flex-col md:flex-row items-center justify-between mt-6 pt-6 border-t border-slate-100 gap-4">
                                    <div className="text-sm font-semibold text-slate-600">
                                        Showing <span className="font-black text-slate-900">{startIndex + 1}</span> to{' '}
                                        <span className="font-black text-slate-900">{Math.min(endIndex, filteredUsers.length)}</span> of{' '}
                                        <span className="font-black text-slate-900">{filteredUsers.length}</span> members
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${currentPage === 1
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50 active:scale-95'
                                                }`}
                                        >
                                            Previous
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {[...Array(totalPages)].map((_, index) => {
                                                const pageNum = index + 1;
                                                if (
                                                    pageNum === 1 ||
                                                    pageNum === totalPages ||
                                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                                ) {
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => setCurrentPage(pageNum)}
                                                            className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${currentPage === pageNum
                                                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                                                                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50 active:scale-95'
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                                    return <span key={pageNum} className="text-slate-400 px-1">...</span>;
                                                }
                                                return null;
                                            })}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${currentPage === totalPages
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50 active:scale-95'
                                                }`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Members;
