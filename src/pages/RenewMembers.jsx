import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS_URL } from '../config/apiConfig';
import { useNavigate, useParams } from 'react-router-dom';
import dataService from '../services/dataService';
import {
    UserIcon,
    MapPinIcon,
    EyeIcon,
    CalendarIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

const RenewMembers = () => {
    const navigate = useNavigate();
    const { orgCode } = useParams();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchRenewMembers();
    }, []);

    const fetchRenewMembers = async () => {
        setLoading(true);
        try {
            const res = await dataService.getRenewMembers();
            if (res.data.success) {
                setMembers(res.data.data);
                setCurrentYear(res.data.year);
            }
        } catch (error) {
            console.error("Failed to fetch renew members", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 mt-6 pb-10">
            {/* Header */}
            <div className="premium-card p-8 bg-white">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-primary-50 rounded-xl">
                                <ArrowPathIcon className="w-6 h-6 text-primary-600" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                Membership Renewals {currentYear}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">
                                {members.length} Members Due for Renewal
                            </p>
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
                    <p className="mt-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
                        Loading Renewals
                    </p>
                </div>
            ) : (
                <div className="premium-card p-6">
                    {members.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-4">
                                <ArrowPathIcon className="w-12 h-12 opacity-20" />
                            </div>
                            <p className="text-sm font-bold uppercase tracking-widest opacity-40">
                                No renewals scheduled for {currentYear}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-slate-100">
                                        <th className="text-left py-4 px-6">
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                Member Name
                                            </span>
                                        </th>
                                        <th className="text-left py-4 px-6">
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                Chapter
                                            </span>
                                        </th>
                                        <th className="text-left py-4 px-6">
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                Membership End Date
                                            </span>
                                        </th>
                                        <th className="text-left py-4 px-6">
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                Renewal Date
                                            </span>
                                        </th>
                                        <th className="text-right py-4 px-6">
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                Action
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((member) => (
                                        <tr
                                            key={member.id}
                                            className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white overflow-hidden border-2 border-slate-100 flex-shrink-0">
                                                        {member.profile_image ? (
                                                            <img
                                                                src={`${ASSETS_URL}${member.profile_image}`}
                                                                alt={member.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
                                                                <UserIcon className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">
                                                            {member.name}
                                                        </p>
                                                        {member.category_name && (
                                                            <p className="text-xs font-semibold text-slate-500">
                                                                {member.category_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <MapPinIcon className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {member.chapter || 'Global'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm font-semibold text-slate-600">
                                                        {formatDate(member.membership_end_date)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                                                    <ArrowPathIcon className="w-4 h-4 text-amber-600" />
                                                    <span className="text-sm font-bold text-amber-700">
                                                        {formatDate(member.membership_renewal_date)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => navigate(`/${orgCode}/admin/members/${member.id}`)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                    View Profile
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RenewMembers;
