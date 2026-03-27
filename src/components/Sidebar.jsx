import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    HomeIcon,
    ChatBubbleLeftRightIcon,
    CalendarIcon,
    LinkIcon,
    BellIcon,
    UserGroupIcon,
    ArrowLeftOnRectangleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    TrophyIcon,
    Bars3Icon,
    XMarkIcon,
    Square2StackIcon,
    PhotoIcon,
    UserPlusIcon,
    IdentificationIcon,
    ClipboardDocumentCheckIcon,
    ArrowPathIcon,
    AcademicCapIcon,
    ChatBubbleBottomCenterTextIcon,
    BriefcaseIcon,
    InboxIcon,
    PaperAirplaneIcon,
    UserIcon,
    CreditCardIcon,
    TagIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const SidebarItem = ({ to, icon: Icon, label, isOpen, onClick, badge, isAdmin, end = false }) => (
    <NavLink
        to={to}
        onClick={onClick}
        end={end}
        className={({ isActive }) => twMerge(
            "flex items-center gap-3 rounded-xl transition-all duration-200 group relative",
            isOpen ? "px-4 py-2.5" : "pl-4 py-2.5 w-full",
            isActive
                ? (isAdmin
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-200 ring-1 ring-primary-500"
                    : "bg-primary-600 text-white shadow-md")
                : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900"
        )}
    >
        <Icon className={twMerge("w-5 h-5 shrink-0 transition-transform duration-200", !isOpen && "group-hover:scale-110")} />
        {isOpen && <span className="font-semibold text-[13.5px] whitespace-nowrap tracking-tight">{label}</span>}
        {isOpen && badge && (
            <span className="ml-auto bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-amber-200">
                {badge}
            </span>
        )}
        {!isOpen && (
            <div className="fixed left-20 bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0 whitespace-nowrap z-50 shadow-xl">
                {label}
            </div>
        )}
    </NavLink>
);

const SidebarDropdown = ({ label, icon: Icon, isOpen, children, isExpanded, onToggle, isAdmin }) => {
    const location = useLocation();
    const hasActiveChild = children.some(child => location.pathname === child.to);

    // Auto-expand if a child is active
    React.useEffect(() => {
        if (hasActiveChild && !isExpanded) onToggle();
    }, [location.pathname]);

    if (!isOpen) return null;

    return (
        <div className="space-y-1">
            <button
                onClick={onToggle}
                className={twMerge(
                    "flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-all duration-200 text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 group",
                    hasActiveChild && (isAdmin ? "text-primary-600 font-bold bg-primary-50/50" : "text-primary-600 font-semibold")
                )}
            >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-semibold text-[13.5px] whitespace-nowrap tracking-tight">{label}</span>
                <ChevronDownIcon className={clsx("w-4 h-4 ml-auto transition-transform duration-300", isExpanded && "rotate-180")} />
            </button>
            {isExpanded && (
                <div className="pl-11 space-y-1 mt-1 border-l border-slate-100 ml-6">
                    {children.map((child, idx) => (
                        <NavLink
                            key={idx}
                            to={child.to}
                            className={({ isActive }) => twMerge(
                                "flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] transition-all duration-200",
                                isActive
                                    ? (isAdmin ? "text-primary-600 font-bold translate-x-1" : "text-primary-600 font-bold")
                                    : "text-slate-500 hover:text-slate-900 hover:translate-x-1"
                            )}
                        >
                            {child.icon && <child.icon className="w-4 h-4 shrink-0 opacity-70" />}
                            {child.label}
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
};

const Sidebar = ({ isOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { orgCode } = useParams();
    const orgPrefix = orgCode || user?.subDomain || user?.organizationName || '';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const lastScrollY = useRef(0);

    // ... (rest of useEffect for scroll remains as is, though showLogout might not be needed if Logout is persistent)

    const activeRole = localStorage.getItem('activeRole');
    const isActingAsChapterAdmin = user?.role === 'chapter_admin' && activeRole !== 'member';
    const isAdmin = user?.role === 'admin' || isActingAsChapterAdmin;

    const getLabel = (key, defaultLabel) => {
        return user?.namingConvention?.[key] || defaultLabel;
    };

    const handleLogout = () => {
        // Get organization context BEFORE logout clears localStorage
        console.log('=== SIDEBAR LOGOUT DEBUG START ===');
        console.log('All localStorage keys:', Object.keys(localStorage));
        console.log('localStorage.orgContext:', localStorage.getItem('orgContext'));

        const orgContext = localStorage.getItem('orgContext');
        console.log('Retrieved orgContext:', orgContext);

        logout();

        // Redirect to organization-specific login page
        const redirectUrl = orgContext ? `/login?org=${orgContext}` : '/login';
        console.log('Redirect URL:', redirectUrl);
        console.log('=== SIDEBAR LOGOUT DEBUG END ===');

        navigate(redirectUrl);
    };

    // State for pending requests count
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (user?.role === 'admin' || user?.role === 'chapter_admin') {
            const fetchPendingCount = async () => {
                try {
                    const response = await api.get('/users/pending');
                    if (response.data.success) {
                        setPendingCount(response.data.data.length);
                    }
                } catch (error) {
                    console.error('Failed to fetch pending count:', error);
                }
            };

            fetchPendingCount();
            // Refresh every 5 minutes
            const interval = setInterval(fetchPendingCount, 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const SidebarContent = () => (
        <div className={clsx(
            "flex flex-col h-full bg-white border-r border-gray-100 transition-all duration-300 ease-in-out relative",
            isOpen ? "w-[260px] shadow-2xl" : "w-16"
        )}>
            {/* Nav Items Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 space-y-0 custom-scrollbar">
                {/* Role-based Navigation Content */}
                {isActingAsChapterAdmin ? (
                    <>
                        {/* Chapter Admin Content */}
                        <SidebarItem to={`/${orgPrefix}`} icon={HomeIcon} label="Home" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} end={true} />
                        <SidebarItem to={`/${orgPrefix}/admin/dashboard`} icon={Square2StackIcon} label="Dashboard" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />
                        <SidebarItem to={`/${orgPrefix}/admin/membership-requests`} icon={ClipboardDocumentCheckIcon} label="Membership Request" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} badge={pendingCount > 0 ? pendingCount : null} isAdmin={true} />
                        <SidebarItem to={`/${orgPrefix}/admin/renew-members`} icon={ArrowPathIcon} label="Renew Member List" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />
                        <SidebarItem to={`/${orgPrefix}/admin/users`} icon={UserGroupIcon} label="Members" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />
                        <SidebarItem to={`/${orgPrefix}/events`} icon={TrophyIcon} label="Event" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />
                        <SidebarItem to={`/${orgPrefix}/admin/training`} icon={AcademicCapIcon} label="Training" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />

                        {/* Referrals */}
                        <SidebarItem to={`/${orgPrefix}/references`} icon={LinkIcon} label="Referrals" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />

                        <SidebarItem to={`/${orgPrefix}/admin/visitors`} icon={IdentificationIcon} label="Visitors" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />
                        <SidebarItem to={`/${orgPrefix}/admin/thank-you`} icon={ChatBubbleBottomCenterTextIcon} label="Thank You Note" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />

                        {/* Meetings Dropdown */}
                        <SidebarDropdown label={getLabel('meetingLabel', 'Meetings')} icon={CalendarIcon} isOpen={isOpen} isExpanded={activeDropdown === 'meetings'} onToggle={() => setActiveDropdown(activeDropdown === 'meetings' ? null : 'meetings')} isAdmin={true}>
                            {[
                                { to: `/${orgPrefix}/meetings`, label: 'Member Meetings', icon: UserIcon },
                                { to: `/${orgPrefix}/admin/chapter-meetings`, label: 'Chapter Meetings', icon: UserGroupIcon },
                            ]}
                        </SidebarDropdown>
                    </>
                ) : user?.role === 'admin' ? (
                    <>
                        {/* Organization Admin Content (Existing Logic) */}
                        <SidebarItem to={`/${orgPrefix}`} icon={HomeIcon} label="Home" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} end={true} />
                        <SidebarItem to={`/${orgPrefix}/admin/dashboard`} icon={Square2StackIcon} label="Dashboard" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />
                        <SidebarItem to={`/${orgPrefix}/admin/settings`} icon={BriefcaseIcon} label="Organization Setting" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />
                        <SidebarItem to={`/${orgPrefix}/admin/gallery`} icon={PhotoIcon} label="Organization Gallery" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />
                        <SidebarItem to={`/${orgPrefix}/admin/members-summary`} icon={UserGroupIcon} label="Members Summary" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />
                        <SidebarItem to={`/${orgPrefix}/admin/visitors`} icon={IdentificationIcon} label="Visitor" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />
                        <SidebarItem to={`/${orgPrefix}/admin/create-org-admin`} icon={UserPlusIcon} label="Create Org Admin" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />
                        <SidebarItem to={`/${orgPrefix}/admin/create-chapter-admin`} icon={UserPlusIcon} label="Create Chapter Admin" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />
                        <SidebarItem to={`/${orgPrefix}/admin/naming-convention`} icon={ChatBubbleBottomCenterTextIcon} label="Naming Convention" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />

                        {/* Master Data Dropdown */}
                        <SidebarDropdown label="Master Data" icon={Square2StackIcon} isOpen={isOpen} isExpanded={activeDropdown === 'master'} onToggle={() => setActiveDropdown(activeDropdown === 'master' ? null : 'master')} isAdmin={true}>
                            {[
                                { to: `/${orgPrefix}/admin/master/membership-plan`, label: getLabel('planLabel', 'Membership Plan'), icon: CreditCardIcon },
                                { to: `/${orgPrefix}/admin/master/categories`, label: getLabel('categoryLabel', 'Member Categories'), icon: TagIcon },
                                { to: `/${orgPrefix}/admin/master/chapters`, label: getLabel('chapterLabel', 'Chapters'), icon: MapPinIcon },
                            ]}
                        </SidebarDropdown>

                        {/* Operations */}
                        <SidebarItem to={`/${orgPrefix}/admin/membership-requests`} icon={ClipboardDocumentCheckIcon} label="Membership Requests" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} badge={pendingCount > 0 ? pendingCount : null} isAdmin={true} />
                        <SidebarItem to={`/${orgPrefix}/admin/renew-members`} icon={ArrowPathIcon} label="Renew Member List" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />
                        <SidebarItem to={`/${orgPrefix}/admin/users`} icon={UserGroupIcon} label="Members" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />
                        <SidebarItem to={`/${orgPrefix}/events`} icon={TrophyIcon} label="Event" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />
                        <SidebarItem to={`/${orgPrefix}/admin/training`} icon={AcademicCapIcon} label="Training" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />
                        <SidebarItem to={`/${orgPrefix}/references`} icon={LinkIcon} label="Referrals" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />
                        <SidebarItem to={`/${orgPrefix}/admin/thank-you`} icon={ChatBubbleBottomCenterTextIcon} label="Thank You Note" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={true} />

                        {/* Meetings Dropdown */}
                        <SidebarDropdown label={getLabel('meetingLabel', 'Meetings')} icon={CalendarIcon} isOpen={isOpen} isExpanded={activeDropdown === 'meetings'} onToggle={() => setActiveDropdown(activeDropdown === 'meetings' ? null : 'meetings')} isAdmin={true}>
                            {[
                                { to: `/${orgPrefix}/meetings`, label: 'Member Meetings', icon: UserIcon },
                                { to: `/${orgPrefix}/admin/chapter-meetings`, label: 'Chapter Meetings', icon: UserGroupIcon },
                            ]}
                        </SidebarDropdown>
                    </>
                ) : (
                    <>
                        {/* Member Navigation Tabs */}
                        <SidebarItem to={`/${orgPrefix}`} icon={HomeIcon} label="Home" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={false} end={true} />
                        <SidebarItem to={`/${orgPrefix}/userDashboard`} icon={Square2StackIcon} label="Dashboard" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={false} />
                        <SidebarItem to={`/${orgPrefix}/members`} icon={UserGroupIcon} label="Members" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={false} />
                        {/* Referrals Dropdown */}
                        <SidebarDropdown label="Referrals" icon={LinkIcon} isOpen={isOpen} isExpanded={activeDropdown === 'referrals'} onToggle={() => setActiveDropdown(activeDropdown === 'referrals' ? null : 'referrals')} isAdmin={false}>
                            {[
                                { to: `/${orgPrefix}/referrals/received`, label: 'Referral Received', icon: InboxIcon },
                                { to: `/${orgPrefix}/referrals/sent`, label: 'Referral Send', icon: PaperAirplaneIcon },
                            ]}
                        </SidebarDropdown>
                        <SidebarItem to={`/${orgPrefix}/thank-you`} icon={ChatBubbleBottomCenterTextIcon} label="Thank You Notes" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={false} />

                        {/* Meetings Dropdown */}
                        <SidebarDropdown label={getLabel('meetingLabel', 'Meetings')} icon={CalendarIcon} isOpen={isOpen} isExpanded={activeDropdown === 'meetings'} onToggle={() => setActiveDropdown(activeDropdown === 'meetings' ? null : 'meetings')} isAdmin={false}>
                            {[
                                { to: `/${orgPrefix}/meetings/member`, label: 'Member Meetings', icon: UserIcon },
                                { to: `/${orgPrefix}/meetings/chapter`, label: 'Chapter Meetings', icon: UserGroupIcon },
                            ]}
                        </SidebarDropdown>
                        <SidebarItem to={`/${orgPrefix}/files`} icon={ClipboardDocumentCheckIcon} label="Files" isOpen={isOpen} onClick={() => setIsMobileMenuOpen(false)} isAdmin={false} />
                    </>
                )}

                {/* 8. Logout (Persistent in scrollable) */}
                <div className="pt-4 mt-4 border-t border-slate-100 px-2">
                    <button
                        onClick={handleLogout}
                        className={twMerge(
                            "flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-all duration-200 group relative",
                            "text-slate-500 hover:bg-red-50 hover:text-red-600"
                        )}
                    >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                        {isOpen && <span className="font-semibold text-[13.5px] whitespace-nowrap tracking-tight">Logout</span>}
                        {!isOpen && (
                            <div className="fixed left-20 bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0 whitespace-nowrap z-50 shadow-xl">
                                Logout
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop & Mobile Sidebar Overlay */}
            <aside
                className={clsx(
                    "fixed top-0 bottom-0 left-0 z-[60] bg-white border-r border-gray-100 transition-transform duration-300 md:translate-x-0 md:top-16",
                    isOpen ? "translate-x-0 w-[260px]" : "-translate-x-full md:translate-x-0 md:w-16"
                )}
            >
                {/* Mobile Close Button */}
                <div className="md:hidden absolute top-4 right-4 z-50">
                    <button onClick={() => isOpen && document.querySelector('.bg-black\\/50')?.click()} className="p-2 text-slate-400 hover:text-slate-600">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <SidebarContent />
            </aside>
        </>
    );
};

export default Sidebar;


