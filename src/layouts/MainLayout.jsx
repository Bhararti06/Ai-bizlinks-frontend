import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MembershipExpiryNotification from '../components/MembershipExpiryNotification';
import { useAuth } from '../context/AuthContext';
import usePushNotifications from '../hooks/usePushNotifications';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import { toast } from 'react-toastify';

const MainLayout = () => {
    const { user } = useAuth();
    const { subscribeToPush } = usePushNotifications();
    // Default to closed on mobile, open on desktop
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth >= 768);
    const activeRole = localStorage.getItem('activeRole');
    const isActingAsChapterAdmin = user?.role === 'chapter_admin' && activeRole !== 'member';
    const isAdmin = user?.role === 'admin' || isActingAsChapterAdmin;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && user) {
            subscribeToPush(token);
        }
    }, [subscribeToPush, user]);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            const handleMessage = (event) => {
                if (event.data && event.data.type === 'PUSH_NOTIFICATION') {
                    const { title, body, url } = event.data.payload;
                    toast.info(
                        <div onClick={() => url && (window.location.href = url)} className="cursor-pointer">
                            <div className="font-bold">{title}</div>
                            <div className="text-sm">{body}</div>
                        </div>,
                        {
                            position: "top-right",
                            autoClose: 8000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        }
                    );
                }
            };

            navigator.serviceWorker.addEventListener('message', handleMessage);
            return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
        }
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className={isAdmin ? "flex flex-col h-screen overflow-hidden bg-slate-50" : "flex flex-col h-screen overflow-hidden bg-[#f8fafc]"}>
            <PWAInstallPrompt />
            {/* Header spans full width and is always visible */}
            <Header onToggleSidebar={toggleSidebar} />

            {/* Membership Expiry Notification for Members */}
            <MembershipExpiryNotification user={user} />

            <div className="flex flex-1 relative overflow-hidden">
                {/* Sidebar handles its own visibility; MainLayout reserves the max space (260px) */}
                <Sidebar isOpen={isSidebarOpen} />

                <main className={`flex-1 overflow-y-auto w-full transition-all duration-300 ${isSidebarOpen ? 'md:pl-[260px]' : 'pl-0 md:pl-16'} ${isAdmin ? 'bg-slate-50' : 'bg-[#f8fafc]'}`}>
                    <div className={isAdmin
                        ? "max-w-[1440px] mx-auto w-full p-4 md:p-8 lg:p-10 animate-fade-in"
                        : "max-w-[1440px] mx-auto w-full p-4 md:p-6 lg:p-8"}>
                        <Outlet />
                    </div>
                </main>

                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-[55] md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default MainLayout;
