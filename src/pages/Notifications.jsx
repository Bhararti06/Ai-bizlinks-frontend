import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dataService from '../services/dataService';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS_URL } from '../config/apiConfig';
import { toast } from 'react-toastify';
import {
    BellIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    ExclamationCircleIcon,
    ClockIcon,
    UserPlusIcon,
    CalendarIcon,
    AcademicCapIcon,
    CheckIcon,
    ChatBubbleLeftRightIcon,
    HandThumbUpIcon
} from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';

const Notifications = () => {
    const navigate = useNavigate();
    const { orgCode } = useParams();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await dataService.getNotifications();
            setNotifications(res.data.data.notifications);
        } catch (error) {
            console.error('Failed to load notifications', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await dataService.markNotificationAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error(err);
            toast.error('Failed to mark as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
            if (unreadIds.length === 0) return;
            await Promise.all(unreadIds.map(id => dataService.markNotificationAsRead(id)));
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            toast.success('All notifications marked as read');
        } catch (err) {
            console.error(err);
            toast.error('Failed to mark all as read');
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        const data = notification.data || {};

        // Priority 1: Use redirection path from data if available
        if (data.path) {
            const path = data.path.startsWith('/') ? `/${orgCode}${data.path}` : data.path;
            navigate(path, { state: data });
            return;
        }

        switch (notification.type) {
            case 'post_like':
            case 'post_comment':
            case 'comment_like':
            case 'comment_reply':
                navigate(`/${orgCode}`, { state: { expandPostId: data.postId } });
                break;
            case 'event_registration':
                navigate(`/${orgCode}/events`, { state: { activeTab: 'registrations', eventId: data.eventId } });
                break;
            case 'training_registration':
                navigate(`/${orgCode}/admin/training`, { state: { activeTab: 'registrations', trainingId: data.trainingId } });
                break;
            case 'referral_received':
                navigate(`/${orgCode}/references`);
                break;
            case 'reference':
                navigate(`/${orgCode}/thank-you`);
                break;
            case 'meeting':
                navigate(`/${orgCode}/meetings`);
                break;
            case 'chapter_meeting':
                navigate(`/${orgCode}/meetings/chapter`);
                break;
            case 'event':
                navigate(`/${orgCode}`, { state: { targetSection: 'event', targetId: data.eventId || data.id || data.reference_id } });
                break;
            case 'training':
                navigate(`/${orgCode}`, { state: { targetSection: 'training', targetId: data.trainingId || data.id || data.reference_id } });
                break;
            case 'approval':
                navigate(`/${orgCode}/admin/membership-requests`);
                break;
            case 'member':
                navigate(`/${orgCode}/admin/users`);
                break;
            default:
                break;
        }
    };

    const getIcon = (type) => {
        const iconClass = "w-6 h-6";
        switch (type) {
            case 'approval':
                return <CheckCircleIcon className={`${iconClass} text-emerald-500`} />;
            case 'meeting':
            case 'chapter_meeting':
                return <CalendarIcon className={`${iconClass} text-primary-500`} />;
            case 'event':
                return <CalendarIcon className={`${iconClass} text-blue-500`} />;
            case 'training':
                return <AcademicCapIcon className={`${iconClass} text-purple-500`} />;
            case 'member':
                return <UserPlusIcon className={`${iconClass} text-orange-500`} />;
            case 'reference':
                return <InformationCircleIcon className={`${iconClass} text-indigo-500`} />;
            case 'referral_received':
                return <ChatBubbleLeftRightIcon className={`${iconClass} text-emerald-500`} />;
            case 'post_like':
                return <HandThumbUpIcon className={`${iconClass} text-blue-500`} />;
            case 'post_comment':
            case 'comment_reply':
                return <ChatBubbleLeftRightIcon className={`${iconClass} text-orange-500`} />;
            case 'event_registration':
            case 'training_registration':
                return <UserPlusIcon className={`${iconClass} text-primary-500`} />;
            default:
                return <BellIcon className={`${iconClass} text-slate-400`} />;
        }
    };

    const getIconBg = (type) => {
        switch (type) {
            case 'approval': return 'bg-emerald-50';
            case 'meeting':
            case 'chapter_meeting': return 'bg-primary-50';
            case 'event': return 'bg-blue-50';
            case 'training': return 'bg-purple-50';
            case 'member': return 'bg-orange-50';
            case 'reference': return 'bg-indigo-50';
            case 'referral_received': return 'bg-emerald-50';
            case 'post_like': return 'bg-blue-50';
            case 'post_comment':
            case 'comment_reply': return 'bg-orange-50';
            case 'event_registration':
            case 'training_registration': return 'bg-primary-50';
            default: return 'bg-slate-50';
        }
    };

    const groupNotificationsByDate = (notifications) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const groups = {
            today: [],
            yesterday: [],
            thisWeek: [],
            older: []
        };

        notifications.forEach(notification => {
            const notifDate = new Date(notification.created_at);
            const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());

            if (notifDay.getTime() === today.getTime()) {
                groups.today.push(notification);
            } else if (notifDay.getTime() === yesterday.getTime()) {
                groups.yesterday.push(notification);
            } else if (notifDay >= weekAgo) {
                groups.thisWeek.push(notification);
            } else {
                groups.older.push(notification);
            }
        });

        return groups;
    };

    const groupedNotifications = groupNotificationsByDate(notifications);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    const NotificationCard = ({ notification }) => (
        <div
            onClick={() => handleNotificationClick(notification)}
            className={twMerge(
                "group relative p-5 rounded-2xl flex gap-4 transition-all duration-200 border",
                notification.is_read
                    ? "bg-white border-slate-100 opacity-60 hover:opacity-80"
                    : "bg-gradient-to-br from-white to-primary-50/30 border-primary-100 shadow-sm cursor-pointer hover:shadow-md hover:border-primary-200"
            )}
        >
            <div className={twMerge("shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 overflow-hidden", getIconBg(notification.type))}>
                {notification.data?.actorImage ? (
                    <img src={`${ASSETS_URL}${notification.data.actorImage}`} alt="" className="w-full h-full object-cover" />
                ) : (
                    getIcon(notification.type)
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className={twMerge(
                    "text-sm leading-relaxed",
                    notification.is_read ? "text-slate-600" : "text-slate-900 font-semibold"
                )}>
                    {notification.message}
                </p>
                {notification.data?.comment && (
                    <div className="mt-2 p-2 bg-slate-50 border-l-2 border-primary-300 rounded text-xs text-slate-600 italic">
                        "{notification.data.comment}"
                    </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                    <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500 font-medium">
                        {new Date(notification.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        })}
                    </span>
                </div>
            </div>
            {!notification.is_read && (
                <div className="shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-600 shadow-lg shadow-primary-200 animate-pulse"></div>
                </div>
            )}
        </div>
    );

    const NotificationGroup = ({ title, notifications }) => {
        if (notifications.length === 0) return null;

        return (
            <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                    {title}
                </h3>
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <NotificationCard key={notification.id} notification={notification} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Notifications
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up'}
                        </p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-600 transition-all active:scale-95 shadow-lg hover:shadow-xl"
                    >
                        <CheckIcon className="w-4 h-4" />
                        Mark All Read
                    </button>
                )}
            </div>

            {/* Notifications List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading notifications...</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BellIcon className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-2">No notifications yet</h3>
                    <p className="text-sm text-slate-500 font-medium">
                        You're all caught up! Check back later for updates.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    <NotificationGroup title="Today" notifications={groupedNotifications.today} />
                    <NotificationGroup title="Yesterday" notifications={groupedNotifications.yesterday} />
                    <NotificationGroup title="This Week" notifications={groupedNotifications.thisWeek} />
                    <NotificationGroup title="Older" notifications={groupedNotifications.older} />
                </div>
            )}
        </div>
    );
};

export default Notifications;
