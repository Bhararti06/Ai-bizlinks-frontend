import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import {
    XMarkIcon,
    CheckCircleIcon,
    ClipboardDocumentCheckIcon,
    CreditCardIcon,
    CalendarIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import dataService from '../services/dataService';

const EventRegistrationModal = ({ isOpen, onClose, event, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Confirmation, 2: Payment, 3: Success
    const [loading, setLoading] = useState(false);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);
    const [paymentLink, setPaymentLink] = useState('');

    const handleConfirmRegistration = async () => {
        setLoading(true);
        try {
            const res = await dataService.registerForEvent(event.id);
            if (res.data.success) {
                if (res.data.data.payment_required && res.data.data.payment_link) {
                    // Has payment requirement
                    setPaymentLink(res.data.data.payment_link);
                    setStep(2);
                } else {
                    // No payment required, go directly to success
                    setStep(3);
                    toast.success('Successfully registered for the event!');
                    if (onSuccess) onSuccess();
                }
            }
        } catch (error) {
            console.error('Registration failed:', error);
            toast.error(error.response?.data?.message || 'Failed to register for event');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!paymentConfirmed) {
            toast.warning('Please confirm that you have completed the payment');
            return;
        }

        setLoading(true);
        try {
            await dataService.confirmEventPayment(event.id);
            setStep(3);
            toast.success('Payment confirmed! You are now registered for the event.');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Payment confirmation failed:', error);
            toast.error('Failed to confirm payment');
        } finally {
            setLoading(false);
        }
    };

    const copyPaymentLink = () => {
        navigator.clipboard.writeText(paymentLink);
        toast.success('Payment link copied to clipboard!');
    };

    const handleClose = () => {
        setStep(1);
        setPaymentConfirmed(false);
        setPaymentLink('');
        onClose();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-black text-white pr-12">
                        {step === 1 && 'Confirm Registration'}
                        {step === 2 && 'Payment Required'}
                        {step === 3 && 'Registration Successful!'}
                    </h2>
                    <div className="flex items-center gap-2 mt-3">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-white' : 'bg-white/30'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Step 1: Confirmation */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-primary-50 to-white border border-primary-100 rounded-2xl p-6">
                                <h3 className="text-xl font-black text-slate-900 mb-4">{event.title}</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-700">
                                        <CalendarIcon className="w-5 h-5 text-primary-600" />
                                        <span className="font-semibold">{formatDate(event.event_date)}</span>
                                    </div>
                                    {event.location && (
                                        <div className="flex items-center gap-3 text-slate-700">
                                            <MapPinIcon className="w-5 h-5 text-primary-600" />
                                            <span className="font-semibold">{event.location}</span>
                                        </div>
                                    )}
                                    {event.event_charges > 0 && (
                                        <div className="flex items-center gap-3 text-slate-700">
                                            <CreditCardIcon className="w-5 h-5 text-primary-600" />
                                            <span className="font-bold text-primary-700">
                                                ₹{event.event_charges}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <p className="text-sm font-semibold text-amber-900">
                                    Do you want to register for this event?
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmRegistration}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Processing...' : 'Yes, Register Me'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Payment */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <CreditCardIcon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900">Payment Details</h3>
                                </div>
                                <p className="text-sm text-slate-600 mb-4">
                                    Please complete the payment using the link below:
                                </p>
                                <div className="bg-white border-2 border-blue-200 rounded-xl p-4 mb-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <a
                                            href={paymentLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-bold text-primary-600 hover:text-primary-700 underline break-all"
                                        >
                                            {paymentLink}
                                        </a>
                                        <button
                                            onClick={copyPaymentLink}
                                            className="flex-shrink-0 p-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg transition-all"
                                            title="Copy link"
                                        >
                                            <ClipboardDocumentCheckIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Amount: <span className="font-bold text-slate-700">₹{event.event_charges}</span>
                                </p>
                            </div>

                            <label className="flex items-start gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl cursor-pointer hover:bg-green-100 transition-all">
                                <input
                                    type="checkbox"
                                    checked={paymentConfirmed}
                                    onChange={(e) => setPaymentConfirmed(e.target.checked)}
                                    className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                />
                                <span className="text-sm font-semibold text-green-900">
                                    I have completed the payment
                                </span>
                            </label>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmPayment}
                                    disabled={loading || !paymentConfirmed}
                                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Confirming...' : 'Confirm Payment'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && (
                        <div className="space-y-6 text-center">
                            <div className="flex justify-center">
                                <div className="p-4 bg-green-100 rounded-full">
                                    <CheckCircleIcon className="w-16 h-16 text-green-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">
                                    You're All Set!
                                </h3>
                                <p className="text-slate-600">
                                    You have successfully registered for <span className="font-bold">{event.title}</span>
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-6">
                                <p className="text-sm text-slate-700 mb-2">
                                    <strong>Event Date:</strong> {formatDate(event.event_date)}
                                </p>
                                {event.location && (
                                    <p className="text-sm text-slate-700">
                                        <strong>Location:</strong> {event.location}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default EventRegistrationModal;
