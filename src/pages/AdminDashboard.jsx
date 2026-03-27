import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CurrencyRupeeIcon,
    UserGroupIcon,
    LinkIcon,
    CalendarIcon,
    UserPlusIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    Square2StackIcon,
    VideoCameraIcon,
    AcademicCapIcon,
    InboxIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import dataService from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';
import MeetingDetailsModal from '../components/MeetingDetailsModal';
import ViewDetailsModal from '../components/ViewDetailsModal';
import TrainingDetailsModal from '../components/TrainingDetailsModal';
import { useNavigate, useParams } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, delay = 0, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        onClick={onClick}
        className={twMerge(
            "premium-card p-7 flex items-start justify-between group overflow-hidden relative transition-all duration-300",
            onClick ? "cursor-pointer hover:shadow-2xl hover:-translate-y-1" : ""
        )}
    >
        <div className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={twMerge(
            "p-3.5 rounded-2xl transition-all duration-300 relative z-10",
            "bg-white shadow-xl shadow-slate-100 ring-1 ring-slate-100 group-hover:ring-primary-100 group-hover:bg-primary-50 active:scale-90",
            color.replace('bg-', 'text-')
        )}>
            <Icon className="w-6 h-6" />
        </div>

        {/* Subtle Decorative Background Element */}
        <div className={twMerge(
            "absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150 group-hover:rotate-12",
            color
        )} />
    </motion.div>
);

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { orgCode } = useParams();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        counts: {
            approvedMembers: 0,
            memberMeetings: 0,
            chapterMeetings: 0,
            referrals: 0,
            businessDone: 0
        },
        chapters: [],
        categories: [],
        calendar: []
    });
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedItem, setSelectedItem] = useState(null);
    const [activeModal, setActiveModal] = useState(null); // 'meeting', 'event', 'training'
    const activeRole = localStorage.getItem('activeRole');
    const isActingAsChapterAdmin = user?.role === 'chapter_admin' && activeRole !== 'member';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await dataService.getAdminDashboardStats();
                if (res.data.success) {
                    setDashboardData(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                toast.error("Failed to load dashboard statistics");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const generateCalendarDays = () => {
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);
        const days = [];

        for (let i = 0; i < startDay; i++) days.push(null);
        for (let i = 1; i <= totalDays; i++) days.push(i);

        return days;
    };

    const getItemsForDay = (day) => {
        if (!day) return [];
        return dashboardData.calendar.filter(item => {
            const date = new Date(item.start);
            return date.getDate() === day &&
                date.getMonth() === currentDate.getMonth() &&
                date.getFullYear() === currentDate.getFullYear();
        });
    };

    const handleItemClick = (item, e) => {
        if (!item || !item.details) return;
        e.stopPropagation();
        setSelectedItem(item.details);
        setActiveModal(item.type);
    };

    const handleDownloadReport = async () => {
        try {
            const response = await dataService.exportAdminReport();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `members_report_${user?.organizationName || 'org'}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Report downloaded successfully");
        } catch (err) {
            console.error("Failed to download report", err);
            toast.error("Failed to download report");
        }
    };

    const getItemStyle = (type) => {
        switch (type) {
            case 'event': return { bg: 'bg-primary-100 hover:bg-primary-200', text: 'text-primary-700', icon: CalendarIcon };
            case 'training': return { bg: 'bg-indigo-100 hover:bg-indigo-200', text: 'text-indigo-700', icon: AcademicCapIcon };
            case 'meeting': return { bg: 'bg-orange-100 hover:bg-orange-200', text: 'text-orange-700', icon: VideoCameraIcon };
            default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: CalendarIcon };
        }
    };

    const handleCardClick = (destination) => {
        let path = '';
        const prefix = orgCode || user?.subDomain || user?.organizationName;

        switch (destination) {
            case 'active_members':
                navigate(`/${prefix}/admin/users`, { state: { defaultTab: 'approved' } });
                return;
            case 'member_meetings':
                path = `/${prefix}/meetings/member`;
                break;
            case 'chapter_meetings':
                path = `/${prefix}/admin/chapter-meetings`;
                break;
            case 'referrals':
                path = `/${prefix}/references`;
                break;
            case 'referrals_received':
                navigate(`/${prefix}/references`, { state: { tab: 'received' } });
                return;
            case 'referrals_sent':
                navigate(`/${prefix}/references`, { state: { tab: 'sent' } });
                return;
            case 'revenue':
                path = `/${prefix}/admin/thank-you`;
                break;
            default:
                return;
        }
        if (path) navigate(path);
    };

    return (
        <div className="space-y-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="animate-fade-in">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                        Organization Overview
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">
                            Real-time data for {user?.organizationName || 'your chapter'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-4 group">
                    <button
                        onClick={handleDownloadReport}
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[13px] font-bold uppercase tracking-widest shadow-sm hover:shadow-md hover:border-slate-300 transition-all active:scale-95"
                    >
                        Download Report
                    </button>
                    <button
                        onClick={() => window.location.href = `/register-user?org=${user?.organizationName}`}
                        className="px-6 py-3 bg-primary-600 text-white rounded-2xl text-[13px] font-bold uppercase tracking-widest shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <UserPlusIcon className="w-4 h-4" />
                        Add New Member
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                <StatCard
                    title="Active Members"
                    value={loading ? "..." : dashboardData.counts.approvedMembers}
                    icon={UserGroupIcon}
                    color="bg-blue-600"
                    delay={0.05}
                    onClick={() => handleCardClick('active_members')}
                />
                <StatCard
                    title="Member Meetings"
                    value={loading ? "..." : dashboardData.counts.memberMeetings}
                    icon={CalendarIcon}
                    color="bg-amber-600"
                    delay={0.1}
                    onClick={() => handleCardClick('member_meetings')}
                />
                <StatCard
                    title="Chapter Meetings"
                    value={loading ? "..." : dashboardData.counts.chapterMeetings}
                    icon={UserPlusIcon}
                    color="bg-sky-600"
                    delay={0.15}
                    onClick={() => handleCardClick('chapter_meetings')}
                />
                {!isActingAsChapterAdmin ? (
                    <StatCard
                        title="All Referrals List"
                        value={loading ? "..." : dashboardData.counts.referrals}
                        icon={LinkIcon}
                        color="bg-purple-600"
                        delay={0.2}
                        onClick={() => handleCardClick('referrals')}
                    />
                ) : (
                    <>
                        <StatCard
                            title="Referral Received"
                            value={loading ? "..." : dashboardData.counts.receivedReferrals}
                            icon={InboxIcon}
                            color="bg-purple-600"
                            delay={0.2}
                            onClick={() => handleCardClick('referrals_received')}
                        />
                        <StatCard
                            title="Referral Sent"
                            value={loading ? "..." : dashboardData.counts.sentReferrals}
                            icon={PaperAirplaneIcon}
                            color="bg-indigo-600"
                            delay={0.22}
                            onClick={() => handleCardClick('referrals_sent')}
                        />
                    </>
                )}
                <StatCard
                    title="Revenue"
                    value={loading ? "..." : `₹ ${dashboardData.counts.businessDone?.toLocaleString()}`}
                    icon={CurrencyRupeeIcon}
                    color="bg-emerald-600"
                    delay={0.25}
                    onClick={() => handleCardClick('revenue')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Calendar Section */}
                <div className="lg:col-span-2 premium-card p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary-50 rounded-xl">
                                <CalendarIcon className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 tracking-tight text-lg">Unified Calendar</h3>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Events & Meetings Overview</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                            <button
                                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                                className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all active:scale-90"
                            >
                                <ChevronLeftIcon className="w-4 h-4 text-slate-600" />
                            </button>
                            <span className="text-[13px] font-black text-slate-900 min-w-[140px] text-center uppercase tracking-wider">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </span>
                            <button
                                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                                className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all active:scale-90"
                            >
                                <ChevronRightIcon className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex gap-4 mb-6 px-1">
                        {[
                            { label: 'Event', color: 'bg-primary-500' },
                            { label: 'Training', color: 'bg-indigo-500' },
                            { label: 'Meeting', color: 'bg-orange-500' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${item.color} shadow-sm`} />
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="bg-slate-50/80 text-center text-[10px] font-black text-slate-400 uppercase py-3 tracking-widest border-b border-slate-100">
                                {day}
                            </div>
                        ))}
                        {generateCalendarDays().map((day, idx) => {
                            const dayItems = getItemsForDay(day);
                            const isToday = day === new Date().getDate() &&
                                currentDate.getMonth() === new Date().getMonth() &&
                                currentDate.getFullYear() === new Date().getFullYear();

                            return (
                                <div
                                    key={idx}
                                    className={twMerge(
                                        "min-h-[110px] bg-white flex flex-col items-start p-2 transition-all group relative",
                                        !day && "bg-slate-50/20",
                                        isToday && "bg-primary-50/30"
                                    )}
                                >
                                    {day && (
                                        <div className="w-full flex justify-between items-start mb-2 px-1">
                                            <span className={twMerge(
                                                "text-[11px] font-black",
                                                isToday ? "text-primary-600 ring-4 ring-primary-50 bg-primary-50 rounded-md px-1" : "text-slate-400"
                                            )}>{day}</span>
                                            {dayItems.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />}
                                        </div>
                                    )}
                                    <div className="w-full flex flex-col gap-1.5 overflow-y-auto custom-scrollbar max-h-[80px] scroll-smooth">
                                        {dayItems.map((item, mIdx) => {
                                            const style = getItemStyle(item.type);
                                            const ItemIcon = style.icon;
                                            return (
                                                <button
                                                    key={mIdx}
                                                    onClick={(e) => handleItemClick(item, e)}
                                                    className={twMerge(
                                                        "w-full text-left p-2 rounded-lg transition-all active:scale-[0.98] group/item border border-transparent hover:border-white hover:shadow-sm",
                                                        style.bg.replace('100', '50')
                                                    )}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <ItemIcon className={twMerge("w-3 h-3", style.text)} />
                                                        <span className={twMerge("text-[10px] font-bold truncate leading-none", style.text)}>{item.title}</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Summary Section */}
                <div className="flex flex-col gap-10">
                    {/* Chapter Summary */}
                    <div className="premium-card p-8 flex-1">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-50 rounded-xl">
                                    <UserGroupIcon className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 tracking-tight text-lg">Chapters</h3>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Regional Distribution</p>
                                </div>
                            </div>
                            <span className="text-[11px] font-black bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                                Total: {dashboardData.chapters.length}
                            </span>
                        </div>

                        {dashboardData.chapters.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 opacity-30">
                                <UserGroupIcon className="w-12 h-12 mb-2" />
                                <p className="text-sm font-bold uppercase tracking-widest">No Data</p>
                            </div>
                        ) : (
                            <div className="space-y-6 max-h-[320px] overflow-y-auto custom-scrollbar pr-3">
                                {dashboardData.chapters.map((chapter, idx) => {
                                    const maxCount = Math.max(...dashboardData.chapters.map(c => c.count), 1);
                                    const percent = (chapter.count / maxCount) * 100;

                                    return (
                                        <div key={idx} className="group cursor-default">
                                            <div className="flex justify-between items-end mb-2 px-1">
                                                <span className="text-[13px] font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">{chapter.name}</span>
                                                <span className="text-[11px] font-black text-slate-400 opacity-80 uppercase tracking-tighter">{chapter.count} Members</span>
                                            </div>
                                            <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100 relative shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percent}%` }}
                                                    transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 }}
                                                    className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Member Categories */}
                    <div className="premium-card p-8 flex-1">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-purple-50 rounded-xl">
                                <Square2StackIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 tracking-tight text-lg">Categories</h3>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Membership Tiers</p>
                            </div>
                        </div>

                        {dashboardData.categories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 opacity-30">
                                <Square2StackIcon className="w-12 h-12 mb-2" />
                                <p className="text-sm font-bold uppercase tracking-widest">No Data</p>
                            </div>
                        ) : (
                            <div className="space-y-6 max-h-[320px] overflow-y-auto custom-scrollbar pr-3">
                                {dashboardData.categories.map((cat, idx) => (
                                    <div key={idx} className="group">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-2 px-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-purple-500 shadow-sm group-hover:animate-ping" />
                                                    <span className="text-[13px] font-bold text-slate-700 group-hover:text-purple-600 transition-colors">{cat.name}</span>
                                                </div>
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{cat.percent}%</span>
                                            </div>
                                            <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100 relative shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${cat.percent}%` }}
                                                    transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                                                    className="bg-purple-500 h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Modals */}
            <MeetingDetailsModal
                isOpen={activeModal === 'meeting'}
                onClose={() => setActiveModal(null)}
                meeting={selectedItem}
            />

            <ViewDetailsModal
                isOpen={activeModal === 'event'}
                onClose={() => setActiveModal(null)}
                data={selectedItem}
                type="event"
            />

            <TrainingDetailsModal
                isOpen={activeModal === 'training'}
                onClose={() => setActiveModal(null)}
                training={selectedItem}
            />

            {isActingAsChapterAdmin && (
                <div className="premium-card p-1">
                    <div className="flex items-center gap-3 mb-6 p-7 pb-0">
                        <div className="p-2.5 bg-blue-50 rounded-xl">
                            <UserGroupIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 tracking-tight text-lg">Member Referrals Performance</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sent & Received metrics by member</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Member Name</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Referrals Sent</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Referrals Received</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {dashboardData.memberReferralStats && dashboardData.memberReferralStats.length > 0 ? (
                                    dashboardData.memberReferralStats.map((member, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 shadow-sm">
                                                        {member.profile_image ? (
                                                            <img src={member.profile_image.startsWith('http') ? member.profile_image : `${process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'https://bot.nellinfotech.com:5000'}${member.profile_image}`} alt={member.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[12px] font-bold text-slate-400 bg-slate-200">
                                                                {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[13px] font-bold text-slate-700">{member.name || 'Unknown User'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-[12px] font-black bg-purple-50 text-purple-700">{member.sent}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-[12px] font-black bg-indigo-50 text-indigo-700">{member.received}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-10 text-center text-[13px] font-bold text-slate-400">
                                            {dashboardData.memberReferralStats === undefined ? (
                                                <span className="text-rose-500 bg-rose-50 px-4 py-2 rounded-xl">⚠️ Please restart your backend server terminal (node server.js) to view this list!</span>
                                            ) : (
                                                "No referral data available for members in this chapter yet."
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
