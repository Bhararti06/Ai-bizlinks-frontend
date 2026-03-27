import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dialog, Popover, Transition } from '@headlessui/react';
import {
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    CalendarIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    BellIcon
} from '@heroicons/react/24/outline';
import dataService from '../services/dataService';
import { format } from 'date-fns';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const navigation = [
        { name: 'Dashboard', href: '/', icon: HomeIcon },
        { name: 'Meetings', href: '/meetings', icon: CalendarIcon },
    ];

    const fetchNotifications = async () => {
        try {
            const response = await dataService.getNotifications();
            setNotifications(response.data.data.notifications);
            setUnreadCount(response.data.data.unreadCount);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await dataService.markNotificationRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: 1 } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 60000); // Poll every minute
            return () => clearInterval(interval);
        }
    }, [user]);

    if (!user) return null;

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
                <div className="flex lg:flex-1">
                    <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
                            {user.organizationName ? user.organizationName.charAt(0) : 'C'}
                        </div>
                        <span className="font-semibold text-gray-900">{user.organizationName}</span>
                    </Link>
                </div>
                <div className="flex lg:hidden">
                    <button
                        type="button"
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <span className="sr-only">Open main menu</span>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
                <div className="hidden lg:flex lg:gap-x-12">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`text-sm font-semibold leading-6 flex items-center gap-1 transition-colors ${location.pathname === item.href ? 'text-primary-600' : 'text-gray-900 hover:text-primary-600'
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    ))}
                    {user.role === 'admin' && (
                        <Link
                            to="/admin/users"
                            className={`text-sm font-semibold leading-6 flex items-center gap-1 transition-colors ${location.pathname === '/admin/users' ? 'text-primary-600' : 'text-gray-900 hover:text-primary-600'
                                }`}
                        >
                            <UserCircleIcon className="h-5 w-5" />
                            Users
                        </Link>
                    )}
                </div>
                <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-4 items-center">

                    {/* Notification Bell */}
                    <Popover className="relative">
                        <Popover.Button className="relative p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
                            <span className="sr-only">View notifications</span>
                            <BellIcon className="h-6 w-6" aria-hidden="true" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                            )}
                        </Popover.Button>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1"
                        >
                            <Popover.Panel className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="px-4 py-2 border-b border-gray-100 font-semibold text-gray-900">
                                    Notifications
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-6 text-center text-sm text-gray-500">
                                            No notifications
                                        </div>
                                    ) : (
                                        notifications.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`px-4 py-3 hover:bg-gray-50 transition-colors ${item.is_read ? 'opacity-60' : 'bg-blue-50/30'}`}
                                                onClick={() => !item.is_read && handleMarkAsRead(item.id)}
                                            >
                                                <p className={`text-sm ${item.is_read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                                    {item.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {format(new Date(item.created_at), 'MMM d, h:mm a')}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Popover.Panel>
                        </Transition>
                    </Popover>

                    <div className="h-6 w-px bg-gray-200 mx-2" />

                    <span className="text-sm text-gray-700">Hi, {user.name}</span>
                    <button onClick={logout} className="text-sm font-semibold leading-6 text-gray-900 flex items-center gap-1 hover:text-red-600">
                        Log out <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
                <div className="fixed inset-0 z-50" />
                <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
                                {user.organizationName ? user.organizationName.charAt(0) : 'C'}
                            </div>
                            <span className="font-semibold text-gray-900">{user.organizationName}</span>
                        </Link>
                        <button
                            type="button"
                            className="-m-2.5 rounded-md p-2.5 text-gray-700"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="sr-only">Close menu</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="mt-6 flow-root">
                        <div className="-my-6 divide-y divide-gray-500/10">
                            <div className="space-y-2 py-6">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <item.icon className="h-5 w-5" />
                                            {item.name}
                                        </div>
                                    </Link>
                                ))}
                                {user.role === 'admin' && (
                                    <Link
                                        to="/admin/users"
                                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <UserCircleIcon className="h-5 w-5" />
                                            Users
                                        </div>
                                    </Link>
                                )}
                            </div>
                            <div className="py-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-gray-700">Hi, {user.name}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        logout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 w-full text-left"
                                >
                                    Log out
                                </button>
                            </div>
                        </div>
                    </div>
                </Dialog.Panel>
            </Dialog>
        </header>
    );
};

export default Navbar;
