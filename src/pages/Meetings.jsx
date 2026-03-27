import React, { useState, useEffect, useMemo } from 'react';
import CreateMeetingModal from '../components/CreateMeetingModal';
import MeetingDetailsModal from '../components/MeetingDetailsModal';
import ExecutiveMeetingTable from '../components/ExecutiveMeetingTable'; // Added ExecutiveMeetingTable
import dataService from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'; // Modified icon imports
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

const Meetings = () => {
    const { user } = useAuth();
    const isOrgAdmin = user.role === 'admin';
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);

    // Sub-Tabs for Upcoming/Previous
    const [timeTab, setTimeTab] = useState('upcoming'); // 'upcoming' or 'previous'

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const response = await dataService.getMeetings();
            setMeetings(response.data.data);
        } catch (error) {
            console.error(error);
            // toast.error('Failed to fetch meetings'); 
        } finally {
            setLoading(false);
        }
    };

    const handleRSVP = async (meetingId, status) => {
        try {
            await dataService.rsvpMeeting(meetingId, status);
            toast.success(`RSVP updated to ${status} `);
            fetchMeetings();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update RSVP');
        }
    };

    const handleDelete = async (meetingId) => {
        if (!window.confirm('Are you sure you want to delete this meeting?')) return;
        try {
            await dataService.deleteMeeting(meetingId);
            toast.success('Meeting deleted successfully');
            fetchMeetings();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete meeting');
        }
    };

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        fetchMeetings();
        toast.success('Meeting scheduled successfully');
    };

    const handleViewDetails = (meeting) => {
        setSelectedMeeting(meeting);
        setIsDetailsModalOpen(true);
    };

    const filteredMeetings = useMemo(() => {
        const now = new Date();
        let filtered = [...meetings];

        // Filter by Time Tab
        if (timeTab === 'upcoming') {
            filtered = filtered.filter(m => new Date(m.meeting_date) >= now);
            filtered.sort((a, b) => new Date(a.meeting_date) - new Date(b.meeting_date));
        } else {
            filtered = filtered.filter(m => new Date(m.meeting_date) < now);
            filtered.sort((a, b) => new Date(b.meeting_date) - new Date(a.meeting_date));
        }

        return filtered;
    }, [meetings, timeTab]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Member Meetings
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                            1-to-1 Interactions
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl text-[13px] font-bold uppercase tracking-widest shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95"
                >
                    <PlusIcon className="w-5 h-5" />
                    Schedule 1-to-1
                </button>
            </div>

            {/* Sub Tabs (Upcoming/Previous) */}
            <div className="flex border-b border-slate-100 mb-2">
                {[
                    { id: 'upcoming', label: 'Upcoming', icon: CalendarIcon },
                    { id: 'previous', label: 'History', icon: ClockIcon }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setTimeTab(tab.id)}
                        className={twMerge(
                            "px-6 py-4 text-[13px] font-bold tracking-tight transition-all relative flex items-center gap-2",
                            timeTab === tab.id
                                ? "text-primary-600"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {timeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-primary-600 animate-spin mb-4" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Meetings...</p>
                </div>
            ) : filteredMeetings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="p-5 bg-slate-50 rounded-full mb-4">
                        <CalendarIcon className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-slate-900 font-black tracking-tight text-lg">No meetings details</p>
                    <p className="text-slate-400 font-bold text-sm">No {timeTab} 1-to-1 meetings found.</p>
                </div>
            ) : (
                /* Card Grid View replaced by Executive Table */
                <ExecutiveMeetingTable
                    meetings={filteredMeetings}
                    onView={handleViewDetails}
                    onRSVP={handleRSVP}
                    onDelete={handleDelete}
                />
            )}

            {/* Modals */}
            <MeetingDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                meeting={selectedMeeting}
            />

            <CreateMeetingModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
};

export default Meetings;
