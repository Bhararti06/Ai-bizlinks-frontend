import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import API_ENDPOINTS from '../config/apiConfig';
import {
    CalendarIcon,
    UsersIcon,
    PaperAirplaneIcon,
    InboxIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    VideoCameraIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';
import dataService from '../services/dataService';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';
import MeetingDetailsModal from '../components/MeetingDetailsModal';
import ViewDetailsModal from '../components/ViewDetailsModal';
import TrainingDetailsModal from '../components/TrainingDetailsModal';

const StatCard = ({ title, value, icon: Icon, color, delay = 0, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        onClick={onClick}
        className={twMerge(
            "bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md",
            onClick && "cursor-pointer active:scale-95"
        )}
    >
        <div className={twMerge("w-12 h-12 rounded-xl flex items-center justify-center", color.replace('text-', 'bg-').replace('600', '50'), color)}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
            <p className="text-2xl font-black text-slate-900">{value}</p>
        </div>
    </motion.div>
);

const UserDashboard = () => {
    const navigate = useNavigate();
    const { orgCode } = useParams();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        memberMeetings: 0,
        chapterMeetings: 0,
        referralsSent: 0,
        referralsReceived: 0
    });
    const [calendarItems, setCalendarItems] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedItem, setSelectedItem] = useState(null);
    const [activeModal, setActiveModal] = useState(null); // 'meeting', 'event', 'training'

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [meetingsRes, chapterMeetingsRes, sentRes, receivedRes, eventsRes, trainingsRes] = await Promise.all([
                    dataService.getMeetings(),
                    dataService.getChapterMeetings(),
                    dataService.getSentReferrals(),
                    dataService.getReceivedReferrals(),
                    dataService.getEvents(),
                    fetch(`${API_ENDPOINTS.TRAININGS}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    }).then(res => res.json())
                ]);

                // Stats Processing
                const allMeetings = meetingsRes.data.success ? meetingsRes.data.data : [];
                const allChapterMeetings = chapterMeetingsRes.data.success ? chapterMeetingsRes.data.data : [];
                const sentRefs = sentRes.data.success ? sentRes.data.data : [];
                const receivedRefs = receivedRes.data.success ? receivedRes.data.data : [];

                setStats({
                    memberMeetings: allMeetings.length,
                    chapterMeetings: allChapterMeetings.length,
                    referralsSent: sentRefs.filter(ref => ref.referral_flag !== '0').length,
                    referralsReceived: receivedRefs.filter(ref => ref.referral_flag !== '0').length
                });

                // Calendar Processing
                const events = eventsRes.data.success ? eventsRes.data.data : [];
                const trainings = trainingsRes.success ? trainingsRes.data : [];

                const calendarData = [
                    ...allMeetings.map(m => ({
                        type: 'meeting',
                        start: new Date(m.meeting_date),
                        title: m.title,
                        details: m
                    })),
                    ...allChapterMeetings.map(m => ({
                        type: 'meeting', // or 'chapter_meeting' if distinct icon needed, but 'meeting' uses VideoCameraIcon which is fine
                        start: new Date(m.meeting_date),
                        title: m.title,
                        details: m,
                        isChapterMeeting: true
                    })),
                    ...events.filter(e => e.is_registered).map(e => ({
                        type: 'event',
                        start: new Date(e.event_date),
                        title: e.title,
                        details: e
                    })),
                    ...trainings.filter(t => t.is_registered).map(t => ({
                        type: 'training',
                        start: new Date(t.training_start_date),
                        title: t.training_title,
                        details: t
                    }))
                ];

                setCalendarItems(calendarData);

            } catch (error) {
                console.error("Error loading dashboard data", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
        return calendarItems.filter(item => {
            return item.start.getDate() === day &&
                item.start.getMonth() === currentDate.getMonth() &&
                item.start.getFullYear() === currentDate.getFullYear();
        });
    };

    const handleItemClick = (item, e) => {
        e.stopPropagation();
        setSelectedItem(item.details);
        setActiveModal(item.type);
    };

    const getItemStyle = (type) => {
        switch (type) {
            case 'event': return { bg: 'bg-blue-100 hover:bg-blue-200', text: 'text-blue-700', icon: CalendarIcon };
            case 'training': return { bg: 'bg-emerald-100 hover:bg-emerald-200', text: 'text-emerald-700', icon: AcademicCapIcon };
            case 'meeting': return { bg: 'bg-orange-100 hover:bg-orange-200', text: 'text-orange-700', icon: VideoCameraIcon };
            default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: CalendarIcon };
        }
    };

    return (
        <div className="space-y-8 w-full max-w-7xl mx-auto px-4 pb-10 mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                        My Dashboard
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">
                            Overview & Schedule
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Member Meetings"
                    value={stats.memberMeetings}
                    icon={CalendarIcon}
                    color="text-blue-600"
                    delay={0.1}
                    onClick={() => navigate(`/${orgCode}/meetings`)}
                />
                <StatCard
                    title="Chapter Meetings"
                    value={stats.chapterMeetings}
                    icon={UsersIcon}
                    color="text-purple-600"
                    delay={0.2}
                    onClick={() => navigate(`/${orgCode}/meetings/chapter`)}
                />
                <StatCard
                    title="Referrals Sent"
                    value={stats.referralsSent}
                    icon={PaperAirplaneIcon}
                    color="text-emerald-600"
                    delay={0.3}
                    onClick={() => navigate(`/${orgCode}/referrals/sent`)}
                />
                <StatCard
                    title="Referrals Received"
                    value={stats.referralsReceived}
                    icon={InboxIcon}
                    color="text-orange-600"
                    delay={0.4}
                    onClick={() => navigate(`/${orgCode}/referrals/received`)}
                />
            </div>

            {/* Calendar Section */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary-50 rounded-xl">
                            <CalendarIcon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 tracking-tight text-lg">My Calendar</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Meetings, Events & Trainings</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all active:scale-90">
                            <ChevronLeftIcon className="w-4 h-4 text-slate-600" />
                        </button>
                        <span className="text-[13px] font-black text-slate-900 min-w-[140px] text-center uppercase tracking-wider">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all active:scale-90">
                            <ChevronRightIcon className="w-4 h-4 text-slate-600" />
                        </button>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex gap-4 mb-6 px-1">
                    {[
                        { label: 'Event', color: 'bg-blue-500' },
                        { label: 'Training', color: 'bg-emerald-500' },
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
                            <div key={idx} className={twMerge(
                                "min-h-[110px] bg-white flex flex-col items-start p-2 transition-all group relative",
                                !day && "bg-slate-50/20",
                                isToday && "bg-primary-50/30"
                            )}>
                                {day && (
                                    <>
                                        <div className="w-full flex justify-between items-start mb-2 px-1">
                                            <span className={twMerge(
                                                "text-[11px] font-black",
                                                isToday ? "text-primary-600 ring-4 ring-primary-50 bg-primary-50 rounded-md px-1" : "text-slate-400"
                                            )}>{day}</span>
                                            {dayItems.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />}
                                        </div>
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
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modals */}
            <MeetingDetailsModal isOpen={activeModal === 'meeting'} onClose={() => setActiveModal(null)} meeting={selectedItem} />
            <ViewDetailsModal isOpen={activeModal === 'event'} onClose={() => setActiveModal(null)} data={selectedItem} type="event" />
            <TrainingDetailsModal isOpen={activeModal === 'training'} onClose={() => setActiveModal(null)} training={selectedItem} />
        </div>
    );
};

export default UserDashboard;
