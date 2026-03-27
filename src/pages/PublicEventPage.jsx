import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ASSETS_URL } from '../config/apiConfig';
import { toast } from 'react-toastify';
import {
    CalendarIcon,
    MapPinIcon,
    ClockIcon,
    CurrencyRupeeIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon
} from '@heroicons/react/24/outline';
import dataService from '../services/dataService';

const PublicEventPage = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
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
        fetchEvent();
    }, [id]);

    const handleNext = () => {
        if (!formData.name || !formData.email || !formData.contact_number) {
            toast.error('Please fill in all required fields');
            return;
        }
        setStep(2);
    };

    const fetchEvent = async () => {
        try {
            const res = await dataService.getPublicEvent(id);
            if (res.data.success) {
                setEvent(res.data.data);
            }
        } catch (error) {
            console.error('Failed to load event', error);
            toast.error('Failed to load event details');
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
            await dataService.registerExternalForEvent(id, formData);
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Event Not Found</h1>
                    <p className="text-slate-600">The event you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-bold mb-4">
                        Public Event
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-4">{event.title}</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">{event.description}</p>
                </div>

                {event.image_path && (
                    <div className="mb-8 rounded-3xl overflow-hidden shadow-2xl">
                        <img
                            src={`${ASSETS_URL}${event.image_path}`}
                            alt={event.title}
                            className="w-full h-96 object-cover"
                        />
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-black text-slate-900 mb-6">Event Details</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary-50 rounded-xl">
                                        <CalendarIcon className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">Date</p>
                                        <p className="text-lg font-bold text-slate-900">{formatDate(event.event_date)}</p>
                                    </div>
                                </div>

                                {event.event_time_in && (
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary-50 rounded-xl">
                                            <ClockIcon className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-500">Time</p>
                                            <p className="text-lg font-bold text-slate-900">{event.event_time_in}</p>
                                        </div>
                                    </div>
                                )}

                                {event.location && (
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary-50 rounded-xl">
                                            <MapPinIcon className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-500">Location</p>
                                            <p className="text-lg font-bold text-slate-900">{event.location}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary-50 rounded-xl">
                                        <CurrencyRupeeIcon className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">Entry Fee</p>
                                        <p className="text-lg font-bold text-primary-700">
                                            {event.event_charges > 0 ? `₹${event.event_charges}` : 'Free'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

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
                                                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                                                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                                                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="Chapter Name (Optional)"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl mt-4"
                                        >
                                            {event.event_charges > 0 ? 'Next: Payment' : 'Register Now'}
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div className="bg-primary-50 rounded-xl p-6 border border-primary-100">
                                            <h3 className="font-bold text-primary-900 mb-2">Registration Payment</h3>
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-slate-600">Amount to Pay:</span>
                                                <span className="text-2xl font-black text-primary-700">₹{event.event_charges}</span>
                                            </div>

                                            {event.payment_link ? (
                                                <a
                                                    href={event.payment_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 w-full py-3 bg-white text-primary-700 border border-primary-200 hover:bg-primary-50 rounded-lg font-bold transition-colors mb-4"
                                                >
                                                    <CurrencyRupeeIcon className="w-5 h-5" />
                                                    Pay Now
                                                </a>
                                            ) : (
                                                <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm mb-4">
                                                    Payment link not available. Please contact organizer.
                                                </div>
                                            )}

                                            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-primary-100">
                                                <input
                                                    type="checkbox"
                                                    id="paymentConfirm"
                                                    checked={formData.payment_confirmed}
                                                    onChange={(e) => setFormData({ ...formData, payment_confirmed: e.target.checked })}
                                                    className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
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
                                                className="flex-[2] py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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

export default PublicEventPage;
