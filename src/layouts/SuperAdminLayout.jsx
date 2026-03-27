import React, { useState } from 'react';
import { useNavigate, useLocation, Link, NavLink, Outlet } from 'react-router-dom';
import { ASSETS_URL } from '../config/apiConfig';
import { useAuth } from '../context/AuthContext';
import {
    Square2StackIcon,
    BuildingOfficeIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    UserCircleIcon,
    BellIcon,
    UserIcon,
    PencilIcon,
    KeyIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import clsx from 'clsx';

const SidebarItem = ({ to, icon: Icon, label, onClick, isCollapsed }) => (
    <NavLink
        to={to}
        onClick={onClick}
        end={to === '/super-admin/dashboard'}
        className={({ isActive }) => clsx(
            "flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
            isActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50",
            isCollapsed && "justify-center ml-1" // Centered icons in collapsed state, slightly adjusted
        )}
        title={isCollapsed ? label : ''}
    >
        <Icon className="w-4 h-4 shrink-0" />
        {!isCollapsed && <span>{label}</span>}
    </NavLink>
);

const SuperAdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/super-admin/login');
    };

    const toggleSidebar = () => {
        if (window.innerWidth >= 1024) {
            setIsCollapsed(!isCollapsed);
        } else {
            setIsMobileOpen(!isMobileOpen);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Header */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 transition-all duration-300 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Toggle sidebar"
                    >
                        <Bars3Icon className="w-5 h-5 text-gray-600" />
                    </button>

                    <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                        <svg className="w-6 h-6 text-gray-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4L4 8l0 8l8 4l8-4l0-8L12 4z" />
                        </svg>
                        <span className="text-lg font-bold text-gray-900 hidden sm:inline">
                            Community Portal
                        </span>
                        <span className="text-lg font-bold text-gray-900 sm:hidden">
                            CB
                        </span>
                    </div>
                </div>

                {/* Right Icons */}
                <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <BellIcon className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Profile Dropdown */}
                    <Menu as="div" className="relative">
                        <Menu.Button className="p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border border-gray-100">
                                {user?.profileImage ? (
                                    <img src={`${ASSETS_URL}${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircleIcon className="w-8 h-8 text-gray-600" />
                                )}
                            </div>
                        </Menu.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-lg shadow-xl border border-gray-100 focus:outline-none divide-y divide-gray-50 py-1 z-50">
                                <div className="px-3 py-2 text-xs text-gray-500 font-medium">Super Admin</div>

                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => navigate('/super-admin/change-password')}
                                            className={clsx("flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors", active ? "bg-gray-50 text-gray-900" : "text-gray-600")}
                                        >
                                            <KeyIcon className="w-4 h-4 text-gray-400" />
                                            Change Password
                                        </button>
                                    )}
                                </Menu.Item>

                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={handleLogout}
                                            className={clsx("flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors mt-1 font-medium", active ? "bg-red-50 text-red-600" : "text-gray-600")}
                                        >
                                            <ArrowRightOnRectangleIcon className="w-4 h-4 text-gray-400" />
                                            Logout
                                        </button>
                                    )}
                                </Menu.Item>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile Overlay */}
                {isMobileOpen && (
                    <div
                        className="fixed inset-0 bg-gray-900/50 z-20 lg:hidden"
                        onClick={() => setIsMobileOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={clsx(
                    "fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 lg:static",
                    // Mobile: slide in/out
                    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                    // Width logic (Mobile always w-64, Desktop varies)
                    isCollapsed ? "lg:w-20 w-64" : "w-64"
                )}>
                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-6 overflow-y-auto">
                        <div className="mb-6">
                            {!isCollapsed && (
                                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                    SOCIAL
                                </h3>
                            )}
                            <div className="space-y-1">
                                <SidebarItem
                                    to="/super-admin/dashboard"
                                    icon={Square2StackIcon}
                                    label="Dashboard"
                                    isCollapsed={isCollapsed}
                                    onClick={() => setIsMobileOpen(false)}
                                />
                                <SidebarItem
                                    to="/super-admin/organizations"
                                    icon={BuildingOfficeIcon}
                                    label="Organizations"
                                    isCollapsed={isCollapsed}
                                    onClick={() => setIsMobileOpen(false)}
                                />
                            </div>
                        </div>
                    </nav>

                    {/* Logout */}
                    <div className="p-3 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className={clsx(
                                "flex w-full items-center gap-3 px-3 py-2 rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors",
                                isCollapsed && "justify-center"
                            )}
                            title={isCollapsed ? "Logout" : ''}
                        >
                            <ArrowRightOnRectangleIcon className="w-4 h-4 shrink-0" />
                            {!isCollapsed && <span>Logout</span>}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 w-full bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SuperAdminLayout;
