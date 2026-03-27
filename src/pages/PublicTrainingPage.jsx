import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ASSETS_URL } from '../config/apiConfig';
import { toast } from 'react-toastify';
import {
    CalendarIcon,
    ClockIcon,
    CurrencyRupeeIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';
import dataService from '../services/dataService';

const PublicTrainingPage = () => {
    const { id } = useParams();
    const [training, setTraining] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact_number: '',
        company_name: '',
        chapter: '',
        payment_confirmed: false
    });

    useEffect(() => {
        fetchTraining();
    }, [id]);

    const handleNext = () => {
        if (!formData.name || !formData.email || !formData.contact_number) {
            toast.error('Please fill in all required fields');
            return;
        }
        setStep(2);
    };

    const fetchTraining = async () => {
        try {
            // Use public endpoint
            const res = await dataService.getPublicTraining(id);
            if (res.data.success) {
                setTraining(res.data.data);
            }
        } catch (error) {
            console.error('Failed to load training', error);
            toast.error('Failed to load training details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.contact_number) {
            toast.error('Please fill in all fields');
            return;
        }

        setSubmitting(true);
        try {
            await dataService.registerExternalForTraining(id, formData);
            toast.success('Successfully registered! We will contact you soon.');
            setFormData({
                name: '',
                email: '',
                contact_number: '',
                company_name: '',
                chapter: '',
                payment_confirmed: false
            });
            setStep(1);
        } catch (error) {
            console.error('Registration failed:', error);
            toast.error(error.response?.data?.message || 'Failed to register');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!training) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Training Not Found</h1>
                    <p className="text-slate-600">The training you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold mb-4">
                        <AcademicCapIcon className="w-5 h-5" />
                        Public Training
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-4">{training.training_title}</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">{training.training_description}</p>
                </div>

                {/* Training Image */}
                {training.image_path && (
                    <div className="mb-8 rounded-3xl overflow-hidden shadow-2xl">
                        <img
                            src={`${ASSETS_URL}${training.image_path}`}
                            alt={training.training_title}
                            className="w-full h-96 object-cover"
                        />
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Training Details */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-black text-slate-900 mb-6">Training Details</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-50 rounded-xl">
                                        <CalendarIcon className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">Duration</p>
                                        <p className="text-lg font-bold text-slate-900">
                                            {formatDate(training.training_start_date)} - {formatDate(training.training_end_date)}
                                        </p>
                                    </div>
                                </div>

                                {training.training_start_time && (
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 rounded-xl">
                                            <ClockIcon className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-500">Time</p>
                                            <p className="text-lg font-bold text-slate-900">
                                                {training.training_start_time} - {training.training_end_time}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {training.trainer_name && (
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 rounded-xl">
                                            <UserIcon className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-500">Trainer</p>
                                            <p className="text-lg font-bold text-slate-900">{training.trainer_name}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-50 rounded-xl">
                                        <CurrencyRupeeIcon className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">Training Fee</p>
                                        <p className="text-lg font-bold text-indigo-700">
                                            {training.training_charges > 0 ? `₹${training.training_charges}` : 'Free'}
                                        </p>
                                    </div>
                                </div>

                                {training.registration_last_date && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                        <p className="text-sm font-bold text-amber-900">
                                            Registration closes on: {formatDate(training.registration_last_date)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Registration Form */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
                            <h2 className="text-2xl font-black text-slate-900 mb-6">Register Now</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {step === 1 ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                Full Name *
                                            </label>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="John Doe"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                Email Address *
                                            </label>
                                            <div className="relative">
                                                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="john@example.com"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                Contact Number *
                                            </label>
                                            <div className="relative">
                                                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="tel"
                                                    value={formData.contact_number}
                                                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                                                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="+91 98765 43210"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                Company Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.company_name}
                                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder="Business Name (Optional)"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                Chapter
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.chapter}
                                                onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder="Chapter Name (Optional)"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl mt-4"
                                        >
                                            {training.training_charges > 0 ? 'Next: Payment' : 'Register Now'}
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                                            <h3 className="font-bold text-indigo-900 mb-2">Registration Payment</h3>
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-slate-600">Amount to Pay:</span>
                                                <span className="text-2xl font-black text-indigo-700">₹{training.training_charges}</span>
                                            </div>

                                            {training.payment_link ? (
                                                <a
                                                    href={training.payment_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 w-full py-3 bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 rounded-lg font-bold transition-colors mb-4"
                                                >
                                                    <CurrencyRupeeIcon className="w-5 h-5" />
                                                    Pay Now
                                                </a>
                                            ) : (
                                                <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm mb-4">
                                                    Payment link not available. Please contact organizer.
                                                </div>
                                            )}

                                            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-100">
                                                <input
                                                    type="checkbox"
                                                    id="paymentConfirm"
                                                    checked={formData.payment_confirmed}
                                                    onChange={(e) => setFormData({ ...formData, payment_confirmed: e.target.checked })}
                                                    className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                                />
                                                <label htmlFor="paymentConfirm" className="text-sm text-slate-600 cursor-pointer select-none">
                                                    I have completed the payment transaction.
                                                </label>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting || !formData.payment_confirmed}
                                                className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {submitting ? 'Registering...' : 'Confirm External Registration'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicTrainingPage;
