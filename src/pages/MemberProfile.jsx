import React, { useState, useEffect } from 'react';
import { ASSETS_URL } from '../config/apiConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dataService from '../services/dataService';
import { toast } from 'react-toastify';
import {
    UserIcon,
    ArrowLeftIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    BriefcaseIcon,
    DocumentTextIcon,
    PencilSquareIcon,
    CalendarIcon,
    FolderIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';
import { format } from 'date-fns';
import MemberEditForm from '../components/MemberEditForm';

const MemberProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [files, setFiles] = useState([]);
    const [referrals, setReferrals] = useState({ sent: [], received: [] });
    const [meetings, setMeetings] = useState({ member_meetings: [], chapter_meetings: [] });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, [id]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch all data in parallel
            // Fetch public data
            const [profileRes, postsRes] = await Promise.all([
                dataService.getFullMemberProfile(id),
                dataService.getMemberPosts(id)
            ]);

            setProfile(profileRes.data.data);
            setPosts(postsRes.data.data);

            // Fetch restricted data only for Admins
            if (user?.role === 'admin') {
                const [filesRes, referralsRes, meetingsRes] = await Promise.all([
                    dataService.getMemberFiles(id),
                    dataService.getMemberReferrals(id),
                    dataService.getMemberMeetings(id)
                ]);
                setFiles(filesRes.data.data);
                setReferrals(referralsRes.data.data);
                setMeetings(meetingsRes.data.data);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load member details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    if (!profile) return (
        <div className="text-center py-12">
            <p className="text-red-500">Member not found</p>
            <button onClick={() => navigate(-1)} className="mt-4 text-primary-600 hover:underline">Go Back</button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header / Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to Members
            </button>

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-100 to-indigo-100"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end -mt-12 mb-6 gap-4">
                        <div className="flex flex-col md:flex-row items-center md:items-end w-full md:w-auto text-center md:text-left">
                            <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden md:mr-4 z-10">
                                {profile.profile_image ? (
                                    <img src={`${ASSETS_URL}${profile.profile_image}`} alt={profile.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                        <UserIcon className="w-10 h-10" />
                                    </div>
                                )}
                            </div>
                            <div className="mb-1 mt-3 md:mt-0">
                                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                                <p className="text-sm text-gray-500">{profile.company_title || 'Member'} • {profile.chapter || 'No Chapter'}</p>
                            </div>
                        </div>
                        {(user?.role === 'admin' || user?.id === parseInt(id)) && (
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="inline-flex items-center justify-center w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors mb-1"
                            >
                                Edit Member
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <Tab.Group>
                        <Tab.List className="flex space-x-1 border-b border-gray-200 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide pb-1">
                            {['Profile', 'Posts', ...(user?.role === 'admin' ? ['Files', 'Referrals', 'Meetings'] : [])].map((category) => (
                                <Tab
                                    key={category}
                                    className={({ selected }) =>
                                        `py-4 px-6 text-sm font-medium outline-none border-b-2 transition-colors ${selected
                                            ? 'border-primary-600 text-primary-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`
                                    }
                                >
                                    {category}
                                </Tab>
                            ))}
                        </Tab.List>

                        <Tab.Panels>
                            {/* Profile Tab */}
                            <Tab.Panel className="outline-none">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center text-gray-600">
                                                <EnvelopeIcon className="w-5 h-5 mr-3 text-gray-400" />
                                                <span className="break-all">{profile.email}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <PhoneIcon className="w-5 h-5 mr-3 text-gray-400" />
                                                <span>{profile.contact_number || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <MapPinIcon className="w-5 h-5 mr-3 text-gray-400" />
                                                <span>{[profile.address, profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'Location not set'}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600 pt-2 border-t border-gray-100">
                                                <CalendarIcon className="w-5 h-5 mr-3 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-bold">Date of Birth</p>
                                                    <span>{profile.dob ? format(new Date(profile.dob), 'MMMM d, yyyy') : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-gray-900">Corporate Information</h3>
                                            {profile.company_logo && (
                                                <img
                                                    src={`${ASSETS_URL}${profile.company_logo}`}
                                                    alt="Company Logo"
                                                    className="w-12 h-12 rounded-lg object-contain bg-white p-1 border border-gray-100"
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                                <span className="text-gray-500">Company</span>
                                                <span className="font-medium text-gray-900">{profile.company_name || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                                <span className="text-gray-500">Title</span>
                                                <span className="font-medium text-gray-900">{profile.company_title || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                                <span className="text-gray-500">Size</span>
                                                <span className="font-medium text-gray-900">{profile.company_size || 'N/A'}</span>
                                            </div>
                                            {profile.company_address && (
                                                <div className="pt-2">
                                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Office Address</p>
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        {[profile.company_address, profile.company_city, profile.company_state].filter(Boolean).join(', ')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-6 space-y-4 md:col-span-2">
                                        <h3 className="text-lg font-semibold text-gray-900">Membership Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 uppercase font-bold">Plan & Category</p>
                                                <p className="font-medium text-gray-900">{profile.category_name} - {profile.member_type || 'Regular'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 uppercase font-bold">Chapter</p>
                                                <p className="font-medium text-gray-900">{profile.chapter || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 uppercase font-bold">Status</p>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize mt-1 ${profile.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    profile.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {profile.status}
                                                </span>
                                            </div>
                                            <div className="space-y-1 border-t border-gray-200 pt-4">
                                                <p className="text-xs text-gray-400 uppercase font-bold">Joined Date</p>
                                                <p className="font-medium text-gray-900">{profile.membership_start_date ? format(new Date(profile.membership_start_date), 'MMM d, yyyy') : 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1 border-t border-gray-200 pt-4">
                                                <p className="text-xs text-gray-400 uppercase font-bold">Renewal Date</p>
                                                <p className="font-medium text-gray-900 text-primary-600">{profile.membership_renewal_date ? format(new Date(profile.membership_renewal_date), 'MMM d, yyyy') : 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Tab.Panel>

                            {/* Posts Tab */}
                            <Tab.Panel className="outline-none">
                                {posts.length > 0 ? (
                                    <div className="space-y-4">
                                        {posts.map((post) => (
                                            <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h4 className="text-lg font-semibold text-gray-900">{post.title}</h4>
                                                    <span className="text-sm text-gray-500">{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                                                </div>
                                                <p className="text-gray-600 mb-4">{post.description}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>👍 {post.likes_count} likes</span>
                                                    <span>💬 {post.comments_count} comments</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                                        <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No posts created yet</p>
                                    </div>
                                )}
                            </Tab.Panel>

                            {/* Files Tab */}
                            <Tab.Panel className="outline-none">
                                {files.length > 0 ? (
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {files.map((file) => (
                                                    <tr key={file.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{file.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.type || 'Document'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {format(new Date(file.created_at), 'MMM d, yyyy')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                onClick={() => window.open(`${ASSETS_URL}${file.path}`, '_blank')}
                                                                className="text-primary-600 hover:text-primary-900 transition-colors"
                                                                title="Preview"
                                                            >
                                                                <EyeIcon className="w-5 h-5 inline" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                                        <FolderIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No files uploaded yet</p>
                                    </div>
                                )}
                            </Tab.Panel>

                            {/* Referrals Tab */}
                            <Tab.Panel className="outline-none">
                                <div className="space-y-6">
                                    {/* Referrals Sent */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Referrals Sent</h3>
                                        {referrals.sent.length > 0 ? (
                                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referred To</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {referrals.sent.map((ref) => (
                                                            <tr key={ref.id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ref.referred_to || ref.reference_name}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                        {ref.status || 'Open'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {format(new Date(ref.created_at), 'MMM d, yyyy')}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No referrals sent</p>
                                        )}
                                    </div>

                                    {/* Referrals Received */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Referrals Received</h3>
                                        {referrals.received.length > 0 ? (
                                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referred By</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {referrals.received.map((ref) => (
                                                            <tr key={ref.id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ref.referrer_name}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                        {ref.status || 'Open'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {format(new Date(ref.created_at), 'MMM d, yyyy')}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No referrals received</p>
                                        )}
                                    </div>
                                </div>
                            </Tab.Panel>

                            {/* Meetings Tab */}
                            <Tab.Panel className="outline-none">
                                <div className="space-y-6">
                                    {/* Member Meetings */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Member Meetings</h3>
                                        {meetings.member_meetings.length > 0 ? (
                                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {meetings.member_meetings.map((meeting) => (
                                                            <tr key={meeting.id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {format(new Date(meeting.meeting_date), 'MMM d, yyyy h:mm a')}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{meeting.title}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meeting.location || 'Online'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No member meetings</p>
                                        )}
                                    </div>

                                    {/* Chapter Meetings */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Chapter Meetings</h3>
                                        {meetings.chapter_meetings.length > 0 ? (
                                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {meetings.chapter_meetings.map((meeting) => (
                                                            <tr key={meeting.id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {format(new Date(meeting.meeting_date), 'MMM d, yyyy h:mm a')}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{meeting.title}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meeting.location || 'Online'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No chapter meetings</p>
                                        )}
                                    </div>
                                </div>
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <MemberEditForm
                    memberId={id}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={() => {
                        setIsEditModalOpen(false);
                        fetchAllData(); // Refresh data
                    }}
                />
            )}
        </div>
    );
};

export default MemberProfile;
