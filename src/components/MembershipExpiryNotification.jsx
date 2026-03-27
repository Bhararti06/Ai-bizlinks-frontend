import React, { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';

const MembershipExpiryNotification = ({ user }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'member') return;

        const renewalDate = user.membership_renewal_date ? new Date(user.membership_renewal_date) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (renewalDate && renewalDate < today) {
            // Check session storage for dismissal
            const sessionDismissed = sessionStorage.getItem(`expiry_dismissed_${user.id}`);
            if (!sessionDismissed) {
                setIsVisible(true);
            }
        }
    }, [user]);

    const handleClose = () => {
        setIsVisible(false);
    };

    const handleSkip = () => {
        setIsVisible(false);
        sessionStorage.setItem(`expiry_dismissed_${user.id}`, 'true');
    };

    if (!isVisible) return null;

    const formattedDate = user.membership_renewal_date
        ? new Date(user.membership_renewal_date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
        : 'N/A';

    return (
        <div className="fixed inset-x-0 bottom-0 z-[100] p-4 md:bottom-auto md:top-20 md:right-8 md:left-auto md:w-96 animate-in slide-in-from-bottom md:slide-in-from-right duration-500">
            <div className="bg-white border-2 border-amber-100 rounded-2xl shadow-2xl shadow-amber-100/50 overflow-hidden">
                <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
                        </div>
                        <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight">Membership Status</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-amber-100 rounded-lg transition-colors text-amber-400 hover:text-amber-600"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5">
                    <p className="text-lg font-black text-slate-900 leading-tight mb-2">
                        Your membership has ended.
                    </p>
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Renewal Date</span>
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-700">
                            {formattedDate}
                        </span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleClose}
                            className="w-full py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 transition-all active:scale-95 shadow-lg shadow-amber-200"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleSkip}
                            className="w-full py-2 text-slate-500 text-xs font-bold hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                        >
                            Skip for now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MembershipExpiryNotification;
