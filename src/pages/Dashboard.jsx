import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dataService from '../services/dataService';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import EventRegistrationModal from '../components/EventRegistrationModal';
import TrainingRegistrationModal from '../components/TrainingRegistrationModal';
import API_ENDPOINTS, { ASSETS_URL } from '../config/apiConfig';
import { PlusIcon, MagnifyingGlassIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import {
    CalendarIcon,
    UsersIcon,
    PaperAirplaneIcon,
    InboxIcon,
    ClockIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [events, setEvents] = useState([]);
    const [trainings, setTrainings] = useState([]);
    const [chapterMeetings, setChapterMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAnnouncements, setShowAnnouncements] = useState(true);
    const location = useLocation();

    // Registration Modals
    const [isEventRegModalOpen, setIsEventRegModalOpen] = useState(false);
    const [isTrainingRegModalOpen, setIsTrainingRegModalOpen] = useState(false);
    const [selectedEventToRegister, setSelectedEventToRegister] = useState(null);
    const [selectedTrainingToRegister, setSelectedTrainingToRegister] = useState(null);

    // Auto-hide announcements on tab change
    useEffect(() => {
        setShowAnnouncements(false);
    }, [location]);

    // Consolidated global search
    const [globalSearch, setGlobalSearch] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchPosts(),
                    fetchTrainings(),
                    fetchEvents(),
                    fetchChapterMeetings()
                ]);
            } catch (error) {
                console.error("Error loading dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);



    const fetchPosts = async () => {
        try {
            const response = await dataService.getPosts();
            setPosts(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch posts');
        }
    };

    const fetchEvents = async () => {
        try {
            const res = await dataService.getEvents();
            // Filter only upcoming events for announcements
            const upcoming = res.data.data.filter(e => new Date(e.event_date) >= new Date());
            setEvents(upcoming);
        } catch (error) {
            console.error('Failed to fetch events');
        }
    };

    const fetchChapterMeetings = async () => {
        try {
            const res = await dataService.getChapterMeetings();
            // Filter upcoming
            const upcoming = res.data.data.filter(m => new Date(m.meeting_date) >= new Date());
            setChapterMeetings(upcoming);
        } catch (error) {
            console.error('Failed to fetch chapter meetings');
        }
    };

    const fetchTrainings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_ENDPOINTS.TRAININGS}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setTrainings(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch trainings:', error);
        }
    };

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    const handleDeletePost = async (id) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await dataService.deletePost(id);
                setPosts(posts.filter(post => post.id !== id));
                toast.success('Post deleted successfully');
            } catch (error) {
                toast.error('Failed to delete post');
            }
        }
    };

    const handleUpdatePost = (id, updatedPost) => {
        setPosts(posts.map(post => post.id === id ? updatedPost : post));
    };

    const filteredPosts = posts.filter(post => {
        if (!globalSearch) return true;
        const searchLower = globalSearch.toLowerCase();
        const matchesTitle = post.title?.toLowerCase().includes(searchLower);
        const matchesDescription = post.description?.toLowerCase().includes(searchLower);
        const matchesAuthor = post.user_name?.toLowerCase().includes(searchLower);
        return matchesTitle || matchesDescription || matchesAuthor;
    });

    // Handle scroll to announcement from notification
    useEffect(() => {
        if (location.state?.targetSection && !loading) {
            const { targetSection, targetId } = location.state;

            // Ensure announcements are visible
            setShowAnnouncements(true);

            // Wait a brief moment for DOM to update and announcements to be visible
            setTimeout(() => {
                let elementId = '';
                if (targetSection === 'event') elementId = `event-${targetId}`;
                if (targetSection === 'training') elementId = `training-${targetId}`;

                if (elementId) {
                    const element = document.getElementById(elementId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Optional: Highlight the element temporarily
                        element.classList.add('ring-4', 'ring-purple-200', 'transition-all', 'duration-500');
                        setTimeout(() => element.classList.remove('ring-4', 'ring-purple-200'), 2000);
                    }
                }
            }, 500);
        }
    }, [location.state, loading, showAnnouncements]);

    // Handle scroll to post from notification
    useEffect(() => {
        if (location.state?.expandPostId && !loading && posts.length > 0) {
            const { expandPostId } = location.state;
            const elementId = `post-${expandPostId}`;

            // Wait a brief moment for DOM to update
            setTimeout(() => {
                const element = document.getElementById(elementId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Highlight the element
                    element.classList.add('ring-4', 'ring-blue-200', 'transition-all', 'duration-500');
                    setTimeout(() => element.classList.remove('ring-4', 'ring-blue-200'), 2000);
                }
            }, 500);
        }
    }, [location.state, loading, posts]);

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto px-4 justify-center items-start mt-8">

                {/* Feed Section */}
                <div className="flex-1 max-w-2xl space-y-6">
                    {/* ... (Existing Search and Post Box code) ... */}
                    {/* Global Search Bar */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search posts, members, content..."
                                value={globalSearch}
                                onChange={(e) => setGlobalSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Create Post Box */}
                    <div
                        onClick={() => setIsModalOpen(true)}
                        className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-primary-100 transition-all duration-200"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                            {user?.profile_image ? (
                                <img
                                    src={`${ASSETS_URL}${user.profile_image}`}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                                    {(user?.name || 'U').charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 group-hover:bg-white group-hover:border-primary-200 transition-colors">
                            <p className="text-slate-400 text-sm font-medium">What's on your mind, {user?.name?.split(' ')[0]}?</p>
                        </div>
                        <div className="p-2 bg-primary-50 rounded-xl text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                            <PlusCircleIcon className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Announcement Toggle Button */}
                    <button
                        onClick={() => setShowAnnouncements(!showAnnouncements)}
                        className="group relative bg-gradient-to-r from-primary-600 to-blue-600 text-white py-3.5 px-6 rounded-xl font-bold text-center text-sm tracking-wide w-full hover:from-primary-700 hover:to-blue-700 transition-all shadow-lg shadow-primary-200 hover:shadow-xl active:scale-98"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {showAnnouncements ? 'Hide Announcements' : 'View Announcements'}
                        </span>
                    </button>

                    {/* Posts Feed */}
                    <div className="space-y-6">
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Chapter Meetings Announcements */}
                                {showAnnouncements && chapterMeetings.length > 0 && chapterMeetings.map((meeting) => (
                                    <div key={`meeting-${meeting.id}`} className="bg-white rounded-lg shadow-sm border border-blue-100 overflow-hidden mb-6 relative">
                                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">
                                            Chapter Meeting
                                        </div>
                                        <div className="p-4 border-b border-gray-50 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 flex-shrink-0">
                                                <UsersIcon className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 line-clamp-1">{meeting.title}</h4>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(meeting.meeting_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{meeting.description}</p>
                                            <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-4">
                                                <span>{meeting.start_time.slice(0, 5)} - {meeting.end_time.slice(0, 5)}</span>
                                                <span className="text-blue-600">{meeting.mode}</span>
                                            </div>
                                            <a
                                                href="/meetings/chapter"
                                                className="block w-full text-center py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold shadow-sm hover:bg-blue-700 transition-all"
                                            >
                                                View Details
                                            </a>
                                        </div>
                                    </div>
                                ))}

                                {/* Events Announcements */}
                                {showAnnouncements && events.length > 0 && events.map((event) => {
                                    const formatDate = (dateString) => {
                                        return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                    };

                                    const handleJoinEvent = () => {
                                        if (event.is_registered) return;
                                        setSelectedEventToRegister(event);
                                        setIsEventRegModalOpen(true);
                                    };

                                    return (
                                        <div key={`event-${event.id}`} id={`event-${event.id}`} className="bg-white rounded-lg shadow-sm border border-purple-100 overflow-hidden mb-6 relative">
                                            <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">
                                                New Event
                                            </div>
                                            <div className="p-4 border-b border-gray-50 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100 flex-shrink-0">
                                                    <span className="text-purple-600 font-bold">EV</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-gray-900 line-clamp-1">{event.title}</h4>
                                                    </div>
                                                    <p className="text-xs text-gray-500">Organized by {event.organizer_name || 'Admin'}</p>
                                                </div>
                                            </div>

                                            {/* Event Image Banner */}
                                            {event.image_path && (
                                                <div className="w-full h-40 overflow-hidden relative group">
                                                    <img
                                                        src={`${ASSETS_URL}${event.image_path}`}
                                                        alt={event.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                                        <span className="text-white font-bold text-lg drop-shadow-md">{event.event_mode}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="p-5">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="bg-gray-100 rounded-lg px-3 py-1 text-xs font-bold text-gray-700">
                                                        {formatDate(event.event_date)}
                                                    </div>
                                                    <div className="text-sm font-bold text-purple-700">
                                                        {parseFloat(event.event_charges) > 0 ? `₹${event.event_charges}` : 'Free Entry'}
                                                    </div>
                                                </div>

                                                <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                                                    {event.description}
                                                </p>

                                                <button
                                                    onClick={handleJoinEvent}
                                                    disabled={event.is_registered}
                                                    className={`w-full py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all ${event.is_registered
                                                        ? "bg-green-100 text-green-700 cursor-default border border-green-200"
                                                        : "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-purple-200"
                                                        }`}
                                                >
                                                    {event.is_registered ? 'Registered ✓' : 'Join Event'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Training Announcements */}
                                {showAnnouncements && trainings.length > 0 && trainings.map((training) => {
                                    const formatDate = (dateString) => {
                                        const date = new Date(dateString);
                                        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                    };

                                    const formatTime = (timeString) => {
                                        const [hours, minutes] = timeString.split(':');
                                        const hour = parseInt(hours);
                                        const ampm = hour >= 12 ? 'PM' : 'AM';
                                        const hour12 = hour % 12 || 12;
                                        return `${hour12}:${minutes} ${ampm}`;
                                    };

                                    return (
                                        <div key={`training-${training.id}`} id={`training-${training.id}`} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                            {/* Header with Creator Info */}
                                            <div className="p-4 border-b border-gray-50 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-50 flex-shrink-0">
                                                    <span className="text-gray-400">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                                        </svg>
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-gray-900">{training.creator_name || 'Pratiksha'}</h4>
                                                        <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold">ADMIN</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6">
                                                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm mb-6">
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-1">Trainer:</p>
                                                        <p className="text-gray-900 font-semibold">{training.trainer_name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-1">Cut Off Reg Date:</p>
                                                        <p className="text-gray-900">{formatDate(training.registration_last_date)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-1">Start Date:</p>
                                                        <p className="text-gray-900">{formatDate(training.training_start_date)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-1">End Date:</p>
                                                        <p className="text-gray-900">{formatDate(training.training_end_date)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-1">Start Time:</p>
                                                        <p className="text-gray-900">{formatTime(training.training_start_time)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-1">End Time:</p>
                                                        <p className="text-gray-900">{formatTime(training.training_end_time)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-1">Place:</p>
                                                        <p className="text-gray-900">{training.training_mode === 'In-Person' ? 'TBD' : 'Virtual'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-1">Charges:</p>
                                                        <p className="text-gray-900">{parseFloat(training.training_charges).toFixed(2)}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-gray-500 font-medium mb-1">Description:</p>
                                                        <p className="text-gray-900">{training.training_description || 'N/A'}</p>
                                                    </div>
                                                    {/* Always show payment link structure even if empty or handle check better */}
                                                    <div className="col-span-2">
                                                        <p className="text-gray-500 font-medium inline mr-2 text-sm">Training Payment link:</p>
                                                        {training.payment_link ? (
                                                            <a
                                                                href={training.payment_link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-500 hover:underline font-medium"
                                                            >
                                                                Click to pay
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400 italic">Not available</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Training Image */}
                                                {training.image_path && (
                                                    <div className="w-full mt-6 rounded-lg overflow-hidden border border-gray-100">
                                                        <img
                                                            src={`${ASSETS_URL}${training.image_path}`}
                                                            alt={training.training_title}
                                                            className="w-full h-auto object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Register Button */}
                                            <div className="px-6 pb-6">
                                                <button
                                                    onClick={() => {
                                                        setSelectedTrainingToRegister(training);
                                                        setIsTrainingRegModalOpen(true);
                                                    }}
                                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                                                >
                                                    Register for Training
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Posts */}
                                {filteredPosts.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                                        <p className="text-gray-400 font-medium">
                                            {globalSearch
                                                ? "No posts found matching your search."
                                                : "No posts yet. Be the first to share!"}
                                        </p>
                                    </div>
                                ) : (
                                    filteredPosts.map((post, index) => (
                                        <PostCard
                                            key={post.id}
                                            id={`post-${post.id}`}
                                            post={post}
                                            index={index}
                                            onDelete={handleDeletePost}
                                            onUpdate={fetchPosts}
                                        />
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>


            </div>

            <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onPostCreated={handlePostCreated}
            />

            {/* Event Registration Modal */}
            <EventRegistrationModal
                isOpen={isEventRegModalOpen}
                onClose={() => setIsEventRegModalOpen(false)}
                event={selectedEventToRegister}
                onSuccess={() => {
                    setIsEventRegModalOpen(false);
                    fetchEvents();
                }}
            />

            {/* Training Registration Modal */}
            <TrainingRegistrationModal
                isOpen={isTrainingRegModalOpen}
                onClose={() => setIsTrainingRegModalOpen(false)}
                training={selectedTrainingToRegister}
                onSuccess={() => {
                    setIsTrainingRegModalOpen(false);
                    fetchTrainings();
                }}
            />
        </div >
    );
};

export default Dashboard;

