import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import dataService from '../services/dataService'; // Ensure this path is correct
import { toast } from 'react-toastify';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    TrashIcon,
    EyeIcon,
    UserGroupIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    ShareIcon
} from '@heroicons/react/24/outline';
import ScheduleTrainingModal from '../components/ScheduleTrainingModal';
import ViewDetailsModal from '../components/ViewDetailsModal';
import TrainingRegistrationModal from '../components/TrainingRegistrationModal';

const Training = () => {
    const { user } = useAuth();
    const activeRole = localStorage.getItem('activeRole');
    const isActingAsChapterAdmin = user?.role === 'chapter_admin' && activeRole !== 'member';
    const [trainings, setTrainings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('upcoming'); // upcoming, past, all
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Registrants Modal State
    const [isRegistrantsModalOpen, setIsRegistrantsModalOpen] = useState(false);
    const [selectedTrainingId, setSelectedTrainingId] = useState(null);
    const [registrants, setRegistrants] = useState([]);
    const [loadingRegistrants, setLoadingRegistrants] = useState(false);

    // Training Details Modal State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState(null);

    // Registration Modal State
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
    const [trainingToRegister, setTrainingToRegister] = useState(null);

    useEffect(() => {
        fetchTrainings();
    }, []);

    const fetchTrainings = async () => {
        setLoading(true);
        try {
            const res = await dataService.getTrainings();
            if (res.data.success) {
                setTrainings(res.data.data);
            }
        } catch (error) {
            console.error('Failed to load trainings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this training?')) return;
        try {
            const res = await dataService.deleteTraining(id);
            if (res.data.success) {
                toast.success('Training deleted');
                fetchTrainings();
            } else {
                toast.error(res.data.message || 'Failed to delete training');
            }
        } catch (err) {
            toast.error('Failed to delete training');
        }
    };

    const handleViewRegistrants = async (training) => {
        setSelectedTrainingId(training.id);
        setIsRegistrantsModalOpen(true);
        setLoadingRegistrants(true);
        try {
            const res = await dataService.getTrainingRegistrants(training.id);
            setRegistrants(res.data.data);
        } catch (error) {
            console.error('Failed to load registrants', error);
        } finally {
            setLoadingRegistrants(false);
        }
    };

    const handleViewDetails = (training) => {
        setSelectedTraining(training);
        setIsDetailsModalOpen(true);
    };

    const handleRegister = (training) => {
        setTrainingToRegister(training);
        setIsRegistrationModalOpen(true);
    };

    const handleShare = (training) => {
        const publicUrl = `${window.location.origin}/public/training/${training.id}`;
        navigator.clipboard.writeText(publicUrl);
        toast.success('Training link copied to clipboard!');
    };

    const handleTrainingCreated = (newTraining) => {
        setIsScheduleModalOpen(false);
        fetchTrainings();
    };

    const filteredTrainings = trainings.filter(training => {
        const trainingDate = new Date(training.training_start_date);
        const now = new Date();
        const matchesFilter =
            filter === 'all' ? true :
                filter === 'upcoming' ? trainingDate >= now :
                    trainingDate < now;

        const matchesSearch = training.training_title.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Training Management</h1>
                    <p className="text-gray-500">Schedule and manage organization trainings</p>
                </div>
                {(user?.role === 'admin' || isActingAsChapterAdmin) && (
                    <button
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="flex items-center gap-2 bg-[#4bb1f9] text-white px-4 py-2 rounded-lg hover:bg-[#3ca1e9] transition-all shadow-md font-medium"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Schedule Training
                    </button>
                )}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 flex-1">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search trainings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full text-gray-700"
                    />
                </div>
                <div className="flex gap-2">
                    {['upcoming', 'past', 'all'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filter === f
                                ? "bg-primary-50 text-primary-700 border border-primary-200"
                                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Training List Table (Desktop) */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        {/* ... Existing table code ... */}
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">Training Topic</th>
                                <th className="px-6 py-4">Start Date</th>
                                <th className="px-6 py-4">Mode</th>
                                <th className="px-6 py-4 text-center">Registrations</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTrainings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No trainings found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredTrainings.map((training) => (
                                    <tr key={training.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{training.training_title}</div>
                                            <div className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{training.training_description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{formatDate(training.training_start_date)}</div>
                                            <div className="text-xs text-gray-500">
                                                {training.training_start_time ? `${training.training_start_time.slice(0, 5)}` : ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${training.training_mode === 'Virtual'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {training.training_mode || 'In-Person'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleViewRegistrants(training)}
                                                className="text-primary-600 hover:text-primary-800 text-sm font-medium hover:underline"
                                            >
                                                View List
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-3">
                                                {new Date(training.training_start_date) >= new Date().setHours(0, 0, 0, 0) && (
                                                    <button
                                                        onClick={() => handleShare(training)}
                                                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                                        title="Share Training"
                                                    >
                                                        <ShareIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleViewDetails(training)}
                                                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </button>
                                                {(user?.role === 'admin' || (isActingAsChapterAdmin && user?.chapter === training.chapter)) && (
                                                    <button
                                                        onClick={() => handleDelete(training.id)}
                                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Delete Training"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View (Mobile) */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredTrainings.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                        No trainings found matching your criteria.
                    </div>
                ) : (
                    filteredTrainings.map((training) => (
                        <div key={training.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-900 line-clamp-1">{training.training_title}</h3>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{training.training_description}</p>
                                </div>
                                <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${training.training_mode === 'Virtual'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                    : 'bg-green-50 text-green-700 border border-green-100'
                                    }`}>
                                    {training.training_mode || 'In-Person'}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 border-y border-gray-50 py-3">
                                <div className="flex items-center gap-1.5">
                                    <ClockIcon className="w-4 h-4 text-gray-400" />
                                    {formatDate(training.training_start_date)}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <ClockIcon className="w-4 h-4 text-gray-400" />
                                    {training.training_start_time ? `${training.training_start_time.slice(0, 5)}` : 'TBA'}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <button
                                    onClick={() => handleViewRegistrants(training)}
                                    className="text-primary-600 text-xs font-bold uppercase tracking-wider hover:underline"
                                >
                                    View Registrations
                                </button>

                                <div className="flex items-center gap-3">
                                    {new Date(training.training_start_date) >= new Date().setHours(0, 0, 0, 0) && (
                                        <button onClick={() => handleShare(training)} className="p-2 bg-green-50 text-green-600 rounded-lg">
                                            <ShareIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button onClick={() => handleViewDetails(training)} className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                                        <EyeIcon className="w-4 h-4" />
                                    </button>
                                    {(user?.role === 'admin' || (isActingAsChapterAdmin && user?.chapter === training.chapter)) && (
                                        <button onClick={() => handleDelete(training.id)} className="p-2 bg-red-50 text-red-600 rounded-lg">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Schedule Training Modal */}
            <ScheduleTrainingModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                onTrainingCreated={handleTrainingCreated}
            />

            {/* Registrants Modal */}
            {isRegistrantsModalOpen && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">Registered Members</h3>
                            <button onClick={() => setIsRegistrantsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-0 overflow-y-auto flex-1">
                            {loadingRegistrants ? (
                                <div className="p-12 flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                </div>
                            ) : registrants.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <UserGroupIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>No members registered yet.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="hidden md:block">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr className="text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                                    <th className="px-6 py-3 border-b">Member Name</th>
                                                    <th className="px-6 py-3 border-b">Contact</th>
                                                    <th className="px-6 py-3 border-b">Type</th>
                                                    <th className="px-6 py-3 border-b">Payment Status</th>
                                                    <th className="px-6 py-3 border-b">Registered On</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {registrants.map((reg, idx) => (
                                                    <tr key={reg.id || idx} className="hover:bg-gray-50">
                                                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{reg.name}</td>
                                                        <td className="px-6 py-3 text-sm text-gray-500">
                                                            <div className="text-gray-900 font-medium">{reg.email}</div>
                                                            <div className="text-xs text-gray-400">{reg.contact_number || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reg.registrant_type === 'external'
                                                                ? 'bg-purple-100 text-purple-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                                }`}>
                                                                {reg.registrant_type === 'external' ? 'External' : 'Member'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            {reg.payment_status === 'completed' || reg.payment_confirmed ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                    <CheckCircleIcon className="w-4 h-4" />
                                                                    Paid
                                                                </span>
                                                            ) : reg.payment_status === 'pending' ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                                    <ClockIcon className="w-4 h-4" />
                                                                    Pending
                                                                </span>
                                                            ) : reg.payment_status === 'failed' ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                    <XCircleIcon className="w-4 h-4" />
                                                                    Failed
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">N/A</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-3 text-sm text-gray-500">{new Date(reg.registration_date).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Card View */}
                                    <div className="md:hidden space-y-4 p-4">
                                        {registrants.map((reg, idx) => (
                                            <div key={reg.id || idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-900">{reg.name}</h4>
                                                        <p className="text-xs font-semibold text-slate-500">{reg.email}</p>
                                                    </div>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${reg.registrant_type === 'external'
                                                        ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                                                        }`}>
                                                        {reg.registrant_type === 'external' ? 'External' : 'Member'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-[11px] font-bold">
                                                    <div className="text-slate-500 truncate mr-2">
                                                        {reg.contact_number || 'N/A'}
                                                    </div>
                                                    <div className="text-slate-400">
                                                        {new Date(reg.registration_date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className="pt-2 border-t border-slate-200">
                                                    {reg.payment_status === 'completed' || reg.payment_confirmed ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                            <CheckCircleIcon className="w-3.5 h-3.5" />
                                                            Payment Completed
                                                        </span>
                                                    ) : reg.payment_status === 'pending' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">
                                                            <ClockIcon className="w-3.5 h-3.5" />
                                                            Awaiting Payment
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-100">
                                                            <XCircleIcon className="w-3.5 h-3.5" />
                                                            Payment Failed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-center bg-gray-50 flex-shrink-0">
                            <button
                                onClick={() => setIsRegistrantsModalOpen(false)}
                                className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
                            >
                                Close List
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            <ViewDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                data={selectedTraining}
                type="training"
            />
        </div>
    );
};

export default Training;
