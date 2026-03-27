import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import { ASSETS_URL } from '../config/apiConfig';
import { useAuth } from '../context/AuthContext';
import { Menu, Transition, Popover } from '@headlessui/react';
import dataService from '../services/dataService';
import {
    HomeIcon,
    BellIcon,
    ChevronDownIcon,
    Bars3Icon,
    UserIcon,
    PencilIcon,
    KeyIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const Header = ({ onToggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { orgCode } = useParams();
    const orgPrefix = orgCode || user?.subDomain || user?.organizationName || '';
    const [imgError, setImgError] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchUnreadCount();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const res = await dataService.getNotifications();
            if (res.data && res.data.data && Array.isArray(res.data.data.notifications)) {
                const unread = res.data.data.notifications.filter(n => !n.is_read).length;
                setUnreadCount(unread);
            } else if (res.data && res.data.data && typeof res.data.data.unreadCount !== 'undefined') {
                setUnreadCount(res.data.data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const handleLogout = () => {
        // Get organization context BEFORE logout clears localStorage
        console.log('=== LOGOUT DEBUG START ===');
        console.log('All localStorage keys:', Object.keys(localStorage));
        console.log('localStorage.orgContext:', localStorage.getItem('orgContext'));
        console.log('localStorage.user:', localStorage.getItem('user'));

        const orgContext = localStorage.getItem('orgContext');
        console.log('Retrieved orgContext:', orgContext);

        logout();

        // Redirect to organization-specific login page
        const redirectUrl = orgContext ? `/login?org=${orgContext}` : '/login';
        console.log('Redirect URL:', redirectUrl);
        console.log('=== LOGOUT DEBUG END ===');

        navigate(redirectUrl);
    };

    const activeRole = localStorage.getItem('activeRole');
    const isActingAsChapterAdmin = user?.role === 'chapter_admin' && activeRole !== 'member';
    const isAdmin = user?.role === 'admin' || isActingAsChapterAdmin;

    return (
        <header className={isAdmin
            ? "admin-header-glass h-16 flex items-center justify-between px-6 px-10"
            : "h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-50"}>
            {/* Left side: branding/logo and Toggle */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-xl hover:bg-slate-100/80 text-slate-500 transition-all active:scale-95"
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                    {user?.organizationLogo ? (
                        <div className="p-1 bg-white rounded-xl shadow-sm border border-slate-100">
                            <img
                                src={user.organizationLogo.startsWith('data:') ? user.organizationLogo : `${ASSETS_URL}${user.organizationLogo}`}
                                alt={user?.organizationName || 'Logo'}
                                className="w-9 h-9 object-contain rounded-lg"
                            />
                        </div>
                    ) : (
                        <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-200 ring-2 ring-primary-50">
                            {(user?.organizationName || 'B').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="text-xl font-extrabold text-slate-900 tracking-tight hidden sm:block">
                        {user?.organizationName || 'Bizlinks'}
                    </span>
                </div>
            </div>

            {/* Right side: Icons and Profile */}
            <div className="flex items-center gap-6">
                {/* Home Icon */}
                <Link to={`/${orgPrefix}`} className="text-slate-400 hover:text-primary-600 transition-all hover:scale-110">
                    <HomeIcon className="w-6 h-6" />
                </Link>

                {/* Notification Icon */}
                <button
                    onClick={() => navigate(`/${orgPrefix}/notifications`)}
                    className="relative text-slate-400 hover:text-primary-600 transition-all group"
                    aria-label="View notifications"
                >
                    <BellIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-primary-600 items-center justify-center text-[10px] text-white font-bold shadow-lg">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        </span>
                    )}
                </button>

                {/* Profile Dropdown */}
                <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center gap-3 group p-1.5 rounded-2xl hover:bg-slate-50 transition-all">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-100 group-hover:ring-primary-100 transition-all">
                            {(user?.profile_image || user?.profileImage) && !imgError ? (
                                <img
                                    src={`${ASSETS_URL}${user.profile_image || user.profileImage}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        console.error('Failed to load profile image:', e.target.src);
                                        setImgError(true);
                                    }}
                                />
                            ) : (
                                <UserIcon className="w-5 h-5 text-slate-400" />
                            )}
                        </div>
                        <div className="hidden lg:flex flex-col items-start leading-none gap-1">
                            <span className="text-[13px] font-bold text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-wider">{user?.name}</span>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{user?.role?.replace('_', ' ')}</span>
                        </div>
                        <ChevronDownIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 group-data-[open]:rotate-180" />
                    </Menu.Button>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95 translate-y-2"
                        enterTo="transform opacity-100 scale-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="transform opacity-100 scale-100 translate-y-0"
                        leaveTo="transform opacity-0 scale-95 translate-y-2"
                    >
                        <Menu.Items className="absolute right-0 mt-3 w-56 origin-top-right bg-white rounded-2xl shadow-2xl border border-slate-100 focus:outline-none overflow-hidden py-1.5 z-[100]">
                            <div className="px-4 py-3 border-b border-slate-50 mb-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Authenticated as</p>
                                <p className="text-[13px] font-bold text-slate-900 truncate">{user?.email}</p>
                            </div>

                            <div className="px-1.5 space-y-0.5">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => navigate(isAdmin ? `/${orgPrefix}/admin/profile` : `/${orgPrefix}/my-profile`)}
                                            className={clsx(
                                                "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all",
                                                active ? "bg-primary-50 text-primary-600" : "text-slate-600 hover:bg-slate-50"
                                            )}
                                        >
                                            <UserIcon className={clsx("w-4 h-4", active ? "text-primary-600" : "text-slate-400")} />
                                            {isAdmin ? 'Admin Profile' : 'My Profile'}
                                        </button>
                                    )}
                                </Menu.Item>

                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => navigate(`/${orgPrefix}/security-settings`)}
                                            className={clsx(
                                                "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all",
                                                active ? "bg-primary-50 text-primary-600" : "text-slate-600 hover:bg-slate-50"
                                            )}
                                        >
                                            <KeyIcon className={clsx("w-4 h-4", active ? "text-primary-600" : "text-slate-400")} />
                                            Security Settings
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>

                            <div className="px-1.5 pt-1.5 mt-1.5 border-t border-slate-50">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={handleLogout}
                                            className={clsx(
                                                "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all",
                                                active ? "bg-red-50 text-red-600" : "text-slate-600 hover:bg-red-50/30 hover:text-red-500"
                                            )}
                                        >
                                            <ArrowRightOnRectangleIcon className={clsx("w-4 h-4", active ? "text-red-600" : "text-slate-400")} />
                                            Sign Out
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </header>
    );
};

export default Header;
