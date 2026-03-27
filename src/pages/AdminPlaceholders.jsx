import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS_URL } from '../config/apiConfig';
import { toast } from 'react-toastify';
import { ClipboardDocumentIcon, PhotoIcon, UserPlusIcon, ArrowPathIcon, EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ThankYouNotesComponent from './ThankYouNotes';
import { twMerge } from 'tailwind-merge';

const AdminPlaceholder = ({ title }) => (
    <div className="p-4 sm:p-8 animate-fade-in">
        <div className="premium-card min-h-[450px] flex flex-col items-center justify-center text-center p-12 bg-white/50 backdrop-blur-sm relative overflow-hidden group">
            {/* Decorative background element */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />

            <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-50 to-white text-primary-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm border border-primary-100/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                </div>
            </div>

            <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{title}</h1>
            <p className="text-slate-500 max-w-md text-[15px] font-medium leading-relaxed">
                This module is currently being optimized for the Enterprise Dashboard.
                Full business logic and advanced analytics will be available in the next release.
            </p>

            <div className="mt-12 flex items-center gap-4">
                <button className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-100 transition-all active:scale-95">
                    Request Early Access
                </button>
                <button className="px-8 py-3.5 bg-white text-slate-600 border border-slate-200 rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                    Documentation
                </button>
            </div>
        </div>
    </div>
);

export const OrganizationSettings = ({ organizationId = null, onClose = null }) => {
    const { updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Organization Details
    const [formData, setFormData] = useState({
        name: '',
        admin_name: '',
        admin_email: '',
        contact_number: '',
        sub_domain: ''
    });

    // Settings Toggles
    const [settings, setSettings] = useState({
        memberOnboarding: false,
        eventsChapterOnly: false,
        postsChapterOnly: false,
        createMeetingsChapterOnly: false,
        trainingChapterOnly: false,
        referralChapterOnly: false,
        referralDataChapterAdmin: false
    });

    const [originalData, setOriginalData] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, [organizationId]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            console.log('Fetching organization settings...');
            const res = await api.get(organizationId ? `/organizations/settings?id=${organizationId}` : '/organizations/settings');
            console.log('Settings API Response:', res.data);
            if (res.data.success) {
                const data = res.data.data;
                const orgSettings = typeof data.settings === 'string'
                    ? JSON.parse(data.settings || '{}')
                    : (data.settings || {});

                console.log('Processed Organization Data:', data);
                console.log('Processed Settings:', orgSettings);

                setFormData({
                    name: data.name || '',
                    admin_name: data.admin_name || '',
                    admin_email: data.admin_email || '',
                    contact_number: data.contact_number || '',
                    sub_domain: data.sub_domain || ''
                });

                setSettings({
                    logo: orgSettings.logo || null,
                    memberOnboarding: !!orgSettings.memberOnboarding,
                    eventsChapterOnly: !!orgSettings.eventsChapterOnly,
                    postsChapterOnly: !!orgSettings.postsChapterOnly,
                    createMeetingsChapterOnly: !!orgSettings.createMeetingsChapterOnly,
                    trainingChapterOnly: !!orgSettings.trainingChapterOnly,
                    referralChapterOnly: !!orgSettings.referralChapterOnly,
                    referralDataChapterAdmin: !!orgSettings.referralDataChapterAdmin
                });

                setOriginalData({
                    formData: {
                        name: data.name || '',
                        admin_name: data.admin_name || '',
                        admin_email: data.admin_email || '',
                        contact_number: data.contact_number || '',
                        sub_domain: data.sub_domain || ''
                    },
                    settings: {
                        logo: orgSettings.logo || null,
                        memberOnboarding: !!orgSettings.memberOnboarding,
                        eventsChapterOnly: !!orgSettings.eventsChapterOnly,
                        postsChapterOnly: !!orgSettings.postsChapterOnly,
                        createMeetingsChapterOnly: !!orgSettings.createMeetingsChapterOnly,
                        trainingChapterOnly: !!orgSettings.trainingChapterOnly,
                        referralChapterOnly: !!orgSettings.referralChapterOnly,
                        referralDataChapterAdmin: !!orgSettings.referralDataChapterAdmin
                    }
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast.error('Failed to load organization settings');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setSaving(true);
        try {
            await api.put('/organizations/settings', {
                ...formData,
                settings: settings,
                organizationId: organizationId // Included if present (for Super Admin override)
            });
            toast.success('Settings updated successfully');

            // Sync with AuthContext
            if (updateUser) {
                updateUser({
                    organizationName: formData.name,
                    organizationLogo: settings.logo
                });
            }

            // Update original data state to reflect saved state
            setOriginalData({
                formData: { ...formData },
                settings: { ...settings }
            });
        } catch (error) {
            console.error('Failed to update settings:', error);
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (originalData) {
            setFormData(originalData.formData);
            setSettings(originalData.settings);
            toast.info('Changes reverted to last saved state');
        }
    };

    const copyLink = (type) => {
        const origin = window.location.origin;
        let link = '';
        const orgId = formData.sub_domain || formData.name;
        if (type === 'signin') {
            link = `${origin}/login?org=${encodeURIComponent(orgId)}`;
        } else {
            link = `${origin}/register-user?org=${encodeURIComponent(orgId)}`;
        }

        navigator.clipboard.writeText(link);
        toast.success(`${type === 'signin' ? 'Sign In' : 'Sign Up'} link copied!`);
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={twMerge(
            "space-y-8 animate-fade-in bg-slate-50/50 p-6",
            !onClose && "-m-6 min-h-screen"
        )}>
            {/* Header / Save Action Bar */}
            <div className={twMerge(
                "flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white rounded-[2.5rem] shadow-sm border border-slate-200/50",
                onClose ? "p-4 sticky top-0 z-20 border-b rounded-none -mx-6 -mt-6 mb-6" : "p-8"
            )}>
                {!onClose && (
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Configuration</h2>
                        <p className="text-slate-500 font-medium mt-1">Refine your organization's digital identity and behavioral logic.</p>
                    </div>
                )}
                <div className={twMerge("flex items-center gap-3", onClose && "w-full justify-end")}>
                    <button
                        onClick={onClose || handleReset}
                        className="px-6 py-3 text-[13px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all active:scale-95"
                    >
                        {onClose ? 'Close' : 'Discard'}
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-[13px] font-black uppercase tracking-widest shadow-lg shadow-primary-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Updating...
                            </>
                        ) : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Quick Access Links - Hidden in Modal */}
            {!onClose && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="premium-card p-10 group hover:border-primary-200 transition-all duration-300 bg-white">
                        <div className="flex items-start justify-between mb-8">
                            <div className="p-4 bg-primary-50 text-primary-600 rounded-[1.5rem] group-hover:scale-110 transition-transform">
                                <ClipboardDocumentIcon className="w-6 h-6" />
                            </div>
                            <button
                                onClick={() => copyLink('signin')}
                                className="px-4 py-2 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Copy Member URL
                            </button>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Member Sign In</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">The primary entry point for existing members to access their dashboard.</p>
                    </div>

                    <div className="premium-card p-10 group hover:border-emerald-200 transition-all duration-300 bg-white">
                        <div className="flex items-start justify-between mb-8">
                            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[1.5rem] group-hover:scale-110 transition-transform">
                                <ClipboardDocumentIcon className="w-6 h-6" />
                            </div>
                            <button
                                onClick={() => copyLink('signup')}
                                className="px-4 py-2 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Copy Public URL
                            </button>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Public Registration</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">Direct link for new members to join your organization's portal.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Organization Details */}
                <div className="space-y-8">
                    <div className="premium-card p-10 bg-white shadow-xl shadow-slate-200/20 h-full">
                        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-100">
                            <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
                                <PhotoIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Organization Identity</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Visual & Contact Identifiers</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-10">
                            {/* Logo Upload Section */}
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative group/logo w-full aspect-square max-w-[180px]">
                                    <div className="w-full h-full rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover/logo:border-primary-400 shadow-inner">
                                        {settings.logo ? (
                                            <img src={settings.logo} alt="Org Logo" className="w-full h-full object-contain p-6" />
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-300">
                                                <PhotoIcon className="w-12 h-12 mb-3 opacity-20" />
                                                <span className="text-[10px] uppercase font-black tracking-[0.15em]">No Logo</span>
                                            </div>
                                        )}
                                    </div>
                                    <label
                                        htmlFor="settings-logo-upload"
                                        className="absolute bottom-4 right-4 p-3 bg-white text-slate-600 rounded-2xl shadow-xl border border-slate-100 cursor-pointer hover:bg-slate-900 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                                    >
                                        <PencilSquareIcon className="w-5 h-5" />
                                        <input
                                            type="file"
                                            id="settings-logo-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    const img = new Image();
                                                    img.onload = () => {
                                                        const canvas = document.createElement('canvas');
                                                        const MAX_WIDTH = 800;
                                                        const scale = MAX_WIDTH / img.width;
                                                        canvas.width = MAX_WIDTH;
                                                        canvas.height = img.height * scale;
                                                        const ctx = canvas.getContext('2d');
                                                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                                        setSettings({ ...settings, logo: canvas.toDataURL('image/jpeg', 0.8) });
                                                    };
                                                    img.src = event.target.result;
                                                };
                                                reader.readAsDataURL(file);
                                            }}
                                        />
                                    </label>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Suggested: 500x500px</p>
                            </div>

                            {/* Text Fields Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                {[
                                    { label: 'Org Name', key: 'name', type: 'text' },
                                    { label: 'Admin', key: 'admin_name', type: 'text' },
                                    { label: 'Contact', key: 'contact_number', type: 'text' },
                                    { label: 'Email', key: 'admin_email', type: 'email' }
                                ].map((field) => (
                                    <div key={field.key} className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-[0.2em] text-primary-600/70 ml-1">
                                            {field.label}
                                        </label>
                                        <input
                                            type={field.type}
                                            value={formData[field.key]}
                                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all shadow-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Platform Logic */}
                <div className="space-y-8">
                    <div className="premium-card p-10 bg-white shadow-xl shadow-slate-200/20 h-full">
                        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-100">
                            <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Platform Logic</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Behavioral Overrides</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {[
                                { key: 'memberOnboarding', label: 'Member Onboarding Authority For Chapter Admin', description: 'Chapter Admins can onboard members.' },
                                { key: 'eventsChapterOnly', label: 'Events Post Display Within Chapter Only', description: 'Restricts events to member\'s chapter.' },
                                { key: 'postsChapterOnly', label: 'Posts Display Within Chapter Only', description: 'Restricts social posts to chapter.' },
                                { key: 'createMeetingsChapterOnly', label: 'Create Meetings Within Chapter Members Only', description: 'Invites restricted to same chapter.' },
                                { key: 'trainingChapterOnly', label: 'Trainings Post Display Within Chapter Only', description: 'Restricts trainings to chapter.' },
                                { key: 'referralChapterOnly', label: 'Give Referral Within Chapter Members Only', description: 'Referrals restricted to chapter.' },
                                { key: 'referralDataChapterAdmin', label: 'Referral Data Display To The Chapter Admin', description: 'Admins see all chapter referral data.' }
                            ].map((item) => (
                                <div key={item.key} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary-100 hover:bg-white transition-all group">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            <span className="text-xs font-black text-slate-900 truncate tracking-tight">{item.label}</span>
                                            <span className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">{item.description}</span>
                                        </div>
                                        <button
                                            onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key] })}
                                            className={twMerge(
                                                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none",
                                                settings[item.key] ? 'bg-primary-600' : 'bg-slate-200'
                                            )}
                                        >
                                            <span
                                                className={twMerge(
                                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-all duration-300 ease-in-out",
                                                    settings[item.key] ? 'translate-x-5' : 'translate-x-0'
                                                )}
                                            />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export const OrganizationGallery = () => {
    const { updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [logo, setLogo] = useState(null);
    const [gallery, setGallery] = useState([
        { url: '', description: '' },
        { url: '', description: '' },
        { url: '', description: '' },
        { url: '', description: '' },
        { url: '', description: '' }
    ]);

    const [originalBranding, setOriginalBranding] = useState(null);

    useEffect(() => {
        fetchBranding();
    }, []);

    const fetchBranding = async () => {
        setLoading(true);
        try {
            const res = await api.get('/organizations/settings');
            if (res.data.success) {
                const data = res.data.data;
                const orgSettings = typeof data.settings === 'string'
                    ? JSON.parse(data.settings || '{ }')
                    : (data.settings || {});

                const fetchedLogo = orgSettings.logo || null;
                const fetchedGallery = orgSettings.gallery || [];

                // Pad gallery to 5 items
                const paddedGallery = [...Array(5)].map((_, i) => ({
                    url: fetchedGallery[i]?.url || '',
                    description: fetchedGallery[i]?.description || ''
                }));

                setLogo(fetchedLogo);
                setGallery(paddedGallery);
                setOriginalBranding({ logo: fetchedLogo, gallery: paddedGallery });
            }
        } catch (error) {
            console.error('Failed to fetch branding:', error);
            toast.error('Failed to load gallery');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e, index = -1) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation for image files
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload a valid image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Maximum dimensions
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                // Create canvas and draw resized image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to compressed jpeg
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

                if (index === -1) {
                    setLogo(compressedBase64);
                } else {
                    const newGallery = [...gallery];
                    newGallery[index].url = compressedBase64;
                    setGallery(newGallery);
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleUpdate = async () => {
        setSaving(true);
        try {
            // Get current settings first to merge gallery into them
            const currentRes = await api.get('/organizations/settings');
            const currentData = currentRes.data.data;
            const currentSettings = typeof currentData.settings === 'string'
                ? JSON.parse(currentData.settings || '{ }')
                : (currentData.settings || {});

            // Filter out empty gallery slots
            const filteredGallery = gallery.filter(item => item.url);

            const updatedSettings = {
                ...currentSettings,
                logo: logo,
                gallery: filteredGallery
            };

            await api.put('/organizations/settings', {
                name: currentData.name,
                admin_name: currentData.admin_name,
                admin_email: currentData.admin_email,
                contact_number: currentData.contact_number,
                settings: updatedSettings
            });

            // Update AuthContext user object so header reflects changes immediately
            if (updateUser) {
                updateUser({
                    organizationLogo: logo,
                    organizationName: currentData.name
                });
            }

            toast.success('Gallery updated successfully');
            setOriginalBranding({ logo, gallery });
        } catch (error) {
            console.error('Failed to update gallery:', error);
            toast.error('Failed to update gallery');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (originalBranding) {
            setLogo(originalBranding.logo);
            setGallery(originalBranding.gallery);
            toast.info('Changes reverted');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in bg-slate-50/50 -m-6 p-6 min-h-screen">
            {/* Header / Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/50">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Digital Atmosphere</h2>
                    <p className="text-slate-500 font-medium mt-1">Customize the visual identity and member experience of your portal.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        className="px-6 py-3 text-[13px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all active:scale-95"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-[13px] font-black uppercase tracking-widest shadow-lg shadow-primary-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Finalizing...
                            </>
                        ) : 'Finalize Branding'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Logo Section */}
                <div className="lg:col-span-4">
                    <div className="premium-card p-10 bg-white shadow-xl shadow-slate-200/20 h-full">
                        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-100">
                            <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
                                <PhotoIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Brand Mark</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Primary Identifier</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-8 py-6">
                            <div className="relative group/logo w-full aspect-square max-w-[240px]">
                                <div className="w-full h-full rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover/logo:border-primary-400 shadow-inner">
                                    {logo ? (
                                        <img src={logo} alt="Org Logo" className="w-full h-full object-contain p-6" />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-300">
                                            <PhotoIcon className="w-12 h-12 mb-3 opacity-20" />
                                            <span className="text-[10px] uppercase font-black tracking-[0.15em]">No Identity</span>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 rounded-[2.5rem] bg-primary-600/10 opacity-0 group-hover/logo:opacity-100 transition-opacity pointer-events-none" />
                            </div>

                            <div className="w-full space-y-4">
                                <input
                                    type="file"
                                    id="logo-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e)}
                                />
                                <label
                                    htmlFor="logo-upload"
                                    className="block w-full text-center px-6 py-4 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white cursor-pointer transition-all shadow-sm"
                                >
                                    {logo ? 'Change Logomark' : 'Upload Logomark'}
                                </label>
                                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">SVG or PNG Preferred</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gallery Section */}
                <div className="lg:col-span-8">
                    <div className="premium-card p-10 bg-white shadow-xl shadow-slate-200/20">
                        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-100">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Experience Slider</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Login Page Atmosphere</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {gallery.map((item, index) => (
                                <div key={index} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary-100 hover:bg-white hover:shadow-lg hover:shadow-slate-200/40 transition-all group">
                                    <div className="flex flex-col sm:flex-row gap-8 items-center">
                                        <div className="w-40 h-28 flex-shrink-0 rounded-2xl overflow-hidden bg-white border border-slate-200 relative shadow-inner">
                                            {item.url ? (
                                                <>
                                                    <img src={item.url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => {
                                                            const newGallery = [...gallery];
                                                            newGallery[index].url = '';
                                                            setGallery(newGallery);
                                                        }}
                                                        className="absolute inset-0 bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-[10px] font-black uppercase tracking-widest backdrop-blur-sm"
                                                    >
                                                        Remove Slide
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center gap-1">
                                                    <PhotoIcon className="w-6 h-6 text-slate-200" />
                                                    <span className="text-[10px] uppercase font-black tracking-[0.1em] text-slate-200">Slot {index + 1}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 w-full space-y-3">
                                            <label className="text-[10px] uppercase font-black tracking-[0.2em] text-primary-600/60 ml-1">Welcome Message</label>
                                            <input
                                                type="text"
                                                placeholder="Enter welcoming text for this slide..."
                                                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-900 focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all shadow-sm"
                                                value={item.description}
                                                onChange={(e) => {
                                                    const newGallery = [...gallery];
                                                    newGallery[index].description = e.target.value;
                                                    setGallery(newGallery);
                                                }}
                                            />
                                        </div>
                                        <div className="w-full sm:w-auto self-end sm:self-center">
                                            <input
                                                type="file"
                                                id={`gallery-upload-${index}`}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, index)}
                                            />
                                            <label
                                                htmlFor={`gallery-upload-${index}`}
                                                className="block px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white cursor-pointer transition-all shadow-sm text-center"
                                            >
                                                Upload Source
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MembersSummary = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const res = await api.get('/users/summary');
            if (res.data.success) {
                setMembers(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch summary:', error);
            toast.error('Failed to load membership summary');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Members Summary</h1>
                    <p className="text-slate-500 font-medium">Overview of member activities and participation</p>
                </div>
                <button
                    onClick={fetchSummary}
                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                    title="Refresh Data"
                >
                    <ArrowPathIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="premium-card overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Member</th>
                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Chapter</th>
                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Category</th>
                                <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-wider text-slate-400">Referrals</th>
                                <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-wider text-slate-400">Meetings</th>
                                <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-wider text-slate-400">Events</th>
                                <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-wider text-slate-400">Trainings</th>
                                <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-wider text-slate-400">Posts</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {members.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-slate-400 font-medium">
                                        No members found
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                    {member.profile_image ? (
                                                        <img src={`${ASSETS_URL}${member.profile_image}`} alt={member.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs font-bold text-slate-400">{member.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-bold text-slate-900">{member.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-600">{member.chapter || 'No Chapter'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {member.category_name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-bold text-slate-700">{member.referral_count || 0}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-bold text-slate-700">{member.meeting_count || 0}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-bold text-slate-700">{member.event_count || 0}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-bold text-slate-700">{member.training_count || 0}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-bold text-slate-700">{member.post_count || 0}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export const Visitors = () => {
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVisitors = async () => {
            try {
                const res = await api.get('/organizations/dashboard/visitors');
                if (res.data.success) {
                    setVisitors(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch visitors", err);
                if (err.response && err.response.status === 404) {
                    setVisitors([]);
                } else {
                    toast.error("Failed to load visitor log");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchVisitors();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Visitors Log</h1>
                <p className="text-slate-500 font-medium tracking-tight">Non-members who registered for your organization's events and trainings</p>
            </div>

            <div className="premium-card overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Visitor</th>
                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Company / Chapter</th>
                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Contact Details</th>
                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Registered For</th>
                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Type</th>
                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Date</th>
                                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">Payment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {visitors.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center opacity-30">
                                            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <p className="text-sm font-bold uppercase tracking-widest">No Visitors Recorded</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                visitors.map((visitor) => (
                                    <tr key={visitor.visitor_id || `visitor-${visitor.email}-${visitor.registration_date}`} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-bold text-slate-900">{visitor.name}</div>
                                                <div className="text-xs text-slate-400">ID: {visitor.visitor_id || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-700">{visitor.company_name || 'N/A'}</div>
                                            <div className="text-xs text-slate-500">{visitor.chapter || 'No Chapter'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600">{visitor.email}</div>
                                            <div className="text-xs text-slate-400">{visitor.contact_number}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-700">{visitor.registered_for}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={twMerge(
                                                "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                                visitor.type === 'event' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                                            )}>
                                                {visitor.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(visitor.registration_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {visitor.payment_status === 'completed' || visitor.payment_confirmed ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800">
                                                    Paid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-500">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export const CreateOrgAdmin = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: ''
    });
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', mobile: '', email: '' });

    useEffect(() => {
        fetchOrgAdmins();
    }, []);

    const fetchOrgAdmins = async () => {
        setLoading(true);
        console.log('Fetching org admins...');
        try {
            const res = await api.get('/users/org-admins');
            console.log('Org admins response:', res.data);
            if (res.data.success) {
                setAdmins(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch org admins:', error);
            const message = error.response?.data?.message || 'Failed to load organization admins';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email || !formData.mobile) {
            toast.error('All fields are required');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post('/users/org-admin', formData);
            if (res.data.success) {
                toast.success('Organization admin created successfully');
                setFormData({ name: '', email: '', mobile: '' });
                fetchOrgAdmins(); // Refresh the list
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create organization admin';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!editFormData.name || !editFormData.mobile || !editFormData.email) {
            toast.error('Name, mobile, and email are required');
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.put(`/users/org-admin/${selectedAdmin.id}`, editFormData);
            if (res.data.success) {
                toast.success('Admin updated successfully');
                setShowEditModal(false);
                fetchOrgAdmins();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (admin) => {
        setSelectedAdmin(admin);
        setEditFormData({
            name: admin.name,
            mobile: admin.mobile || '',
            email: admin.email || ''
        });
        setShowEditModal(true);
    };

    const handleCancel = () => {
        setFormData({ name: '', email: '', mobile: '' });
    };

    const handleRemove = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove ${name} as an organization admin?`)) {
            return;
        }

        try {
            const res = await api.delete(`/users/org-admin/${id}`);
            if (res.data.success) {
                toast.success('Organization admin removed successfully');
                fetchOrgAdmins(); // Refresh the list
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to remove organization admin';
            toast.error(message);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
            {/* Form Section */}
            <div className="premium-card p-10 bg-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <UserPlusIcon className="w-32 h-32" />
                </div>

                <h2 className="text-2xl font-black text-slate-900 mb-10 tracking-tight">Provision Multi-Org Administrator</h2>

                <form onSubmit={handleSubmit} className="space-y-8 relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { id: 'name', label: 'Identity Name', type: 'text', placeholder: 'Enter full name' },
                            { id: 'email', label: 'Access Email', type: 'email', placeholder: 'primary@domain.com' },
                            { id: 'mobile', label: 'Verified Mobile', type: 'tel', placeholder: '+1 (555) 000-0000' }
                        ].map((field) => (
                            <div key={field.id} className="space-y-2.5">
                                <label htmlFor={field.id} className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 ml-1">
                                    {field.label} <span className="text-primary-500">*</span>
                                </label>
                                <input
                                    type={field.type}
                                    id={field.id}
                                    name={field.id}
                                    value={formData[field.id]}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all duration-300 shadow-sm"
                                    placeholder={field.placeholder}
                                    required
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4 justify-end pt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-8 py-3.5 text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-all"
                        >
                            Reset Form
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-10 py-3.5 text-[13px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-primary-600 rounded-2xl shadow-xl shadow-slate-200 hover:shadow-primary-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? 'Authenticating...' : 'Authorize Access'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Admin List Section */}
            <div className="premium-card overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Administrators</h2>
                    <span className="px-3 py-1 bg-slate-100 text-[10px] font-black uppercase tracking-widest rounded-lg text-slate-500">{admins.length} Total</span>
                </div>
                {admins.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-4">
                            <UserPlusIcon className="w-12 h-12 opacity-20" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest opacity-40">No administrators provisioned</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
                                    <th className="px-8 py-5">Index</th>
                                    <th className="px-6 py-5">Identity</th>
                                    <th className="px-6 py-5">Verified Contact</th>
                                    <th className="px-6 py-5">Privileges</th>
                                    <th className="px-6 py-5">Timeline</th>
                                    <th className="px-8 py-5 text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {admins.map((admin, index) => (
                                    <tr key={admin.id} className="group hover:bg-slate-50/40 transition-all duration-200">
                                        <td className="px-8 py-5 text-[12px] font-bold text-slate-400">
                                            #{String(index + 1).padStart(2, '0')}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[14px] font-black text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{admin.name}</span>
                                                <span className="text-[11px] font-bold text-slate-400">{admin.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-[13px] font-bold text-slate-600">
                                            {admin.mobile || 'N/A'}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-2.5 py-1 bg-slate-100 text-[10px] font-black uppercase tracking-widest rounded-lg text-slate-500">
                                                Superuser
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-[12px] font-bold text-slate-400">
                                            {new Date(admin.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 md:px-8 py-5 text-right space-x-2">
                                            <button
                                                onClick={() => handleEdit(admin)}
                                                className="p-2 md:px-4 md:py-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                title="Edit Administrator"
                                            >
                                                <PencilSquareIcon className="w-5 h-5 md:hidden" />
                                                <span className="hidden md:inline text-[11px] font-black uppercase tracking-widest">Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleRemove(admin.id, admin.name)}
                                                className="p-2 md:px-4 md:py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                title="Revoke Admin Access"
                                            >
                                                <TrashIcon className="w-5 h-5 md:hidden" />
                                                <span className="hidden md:inline text-[11px] font-black uppercase tracking-widest">Revoke</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setShowEditModal(false)}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Edit Administrator Details</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-8 space-y-6">
                            <div className="space-y-2.5">
                                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 ml-1">Identity Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editFormData.name}
                                    onChange={handleEditChange}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all shadow-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 ml-1">Access Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editFormData.email}
                                    onChange={handleEditChange}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all shadow-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 ml-1">Verified Mobile</label>
                                <input
                                    type="tel"
                                    name="mobile"
                                    value={editFormData.mobile}
                                    onChange={handleEditChange}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all shadow-sm"
                                    required
                                />
                            </div>
                            <div className="flex gap-4 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-3 text-[12px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-8 py-3 bg-slate-900 text-white text-[12px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 active:scale-95"
                                >
                                    {submitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export const CreateChapterAdmin = () => {
    const [chapters, setChapters] = useState([]);
    const [selectedChapter, setSelectedChapter] = useState('');
    const [members, setMembers] = useState([]);
    const [existingAdmins, setExistingAdmins] = useState([]);
    const [selectedMember, setSelectedMember] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchChapters();
    }, []);

    useEffect(() => {
        if (selectedChapter) {
            fetchChapterData();
        } else {
            setMembers([]);
            setExistingAdmins([]);
        }
    }, [selectedChapter]);

    const fetchChapters = async () => {
        setLoading(true);
        try {
            const res = await api.get('/chapters');
            if (res.data.success) {
                setChapters(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch chapters:', error);
            toast.error('Failed to load chapters');
        } finally {
            setLoading(false);
        }
    };

    const fetchChapterData = async () => {
        try {
            const [membersRes, adminsRes] = await Promise.all([
                api.get(`/users/chapter/${selectedChapter}`),
                api.get(`/users/chapter-admins/${selectedChapter}`)
            ]);

            if (membersRes.data.success) {
                // Filter out those who are already chapter admins for this chapter or others
                const unassignedMembers = membersRes.data.data.filter(m => m.role !== 'chapter_admin');
                setMembers(unassignedMembers);
            }
            if (adminsRes.data.success) {
                setExistingAdmins(adminsRes.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch chapter data:', error);
            toast.error('Failed to load members and admins for this chapter');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedChapter || !selectedMember) {
            toast.error('Please select both a chapter and a member');
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post('/users/assign-chapter-admin', {
                userId: selectedMember,
                chapterName: selectedChapter
            });

            if (res.data.success) {
                toast.success('Chapter Admin assigned successfully');
                setSelectedMember('');
                fetchChapterData(); // Refresh both lists
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to assign chapter admin';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveAdmin = async (adminId, adminName) => {
        if (!window.confirm(`Are you sure you want to remove ${adminName} as a Chapter Admin for ${selectedChapter}?`)) {
            return;
        }

        try {
            // We can reuse update-role to set them back to member
            await api.put(`/users/${adminId}/role`, { role: 'member' });
            toast.success('Chapter Admin removed successfully');
            fetchChapterData();
        } catch (error) {
            toast.error('Failed to remove chapter admin');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
            {/* Header section can be added if needed, but keeping it inside cards for now */}
            <div className="premium-card p-10 bg-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <UserPlusIcon className="w-32 h-32" />
                </div>

                <div className="mb-10">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Chapter Admin Assignment</h2>
                    <p className="text-slate-500 font-medium">Provision administrative privileges for specific operational clusters</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2.5">
                            <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 ml-1">Select Operational Chapter</label>
                            <select
                                value={selectedChapter}
                                onChange={(e) => setSelectedChapter(e.target.value)}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all duration-300 shadow-sm"
                                required
                            >
                                <option value="">-- Choose Chapter --</option>
                                {chapters.map(chapter => (
                                    <option key={chapter.id} value={chapter.name}>{chapter.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 ml-1">Assign Member Identity</label>
                            <select
                                value={selectedMember}
                                onChange={(e) => setSelectedMember(e.target.value)}
                                disabled={!selectedChapter || members.length === 0}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 disabled:opacity-50 transition-all duration-300 shadow-sm"
                                required
                            >
                                <option value="">{members.length === 0 ? 'No candidates available' : '-- Select Candidate --'}</option>
                                {members.map(member => (
                                    <option key={member.id} value={member.id}>{member.name} ({member.email})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedChapter('');
                                setSelectedMember('');
                            }}
                            className="px-8 py-3.5 text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-all"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !selectedMember}
                            className="px-10 py-3.5 text-[13px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-primary-600 rounded-2xl shadow-xl shadow-slate-200 hover:shadow-primary-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? 'Confirming...' : 'Authorize Privilege'}
                        </button>
                    </div>
                </form>
            </div>

            {selectedChapter && (
                <div className="premium-card overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Chapter Admins</h2>
                            <span className="px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-lg">{selectedChapter}</span>
                        </div>
                        <span className="px-3 py-1 bg-slate-100 text-[10px] font-black uppercase tracking-widest rounded-lg text-slate-500">
                            {existingAdmins.length} Nodes
                        </span>
                    </div>

                    {existingAdmins.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-300 bg-white">
                            <p className="text-sm font-bold uppercase tracking-widest opacity-40">No cluster administrators assigned</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar bg-white">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
                                        <th className="px-8 py-5">Index</th>
                                        <th className="px-6 py-5">Identity</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-8 py-5 text-right">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {existingAdmins.map((admin, index) => (
                                        <tr key={admin.id} className="group hover:bg-slate-50/40 transition-all duration-200">
                                            <td className="px-8 py-5 text-[12px] font-bold text-slate-400">
                                                #{String(index + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[14px] font-black text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{admin.name}</span>
                                                    <span className="text-[11px] font-bold text-slate-400">{admin.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-2.5 py-1 bg-emerald-50 text-[10px] font-black uppercase tracking-widest rounded-lg text-emerald-600">Active</span>
                                            </td>
                                            <td className="px-4 md:px-8 py-5 text-right">
                                                <button
                                                    onClick={() => handleRemoveAdmin(admin.id, admin.name)}
                                                    className="p-2 md:px-4 md:py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-x-4 md:group-hover:translate-x-0"
                                                    title="Revoke Admin Access"
                                                >
                                                    <TrashIcon className="w-5 h-5 md:hidden" />
                                                    <span className="hidden md:inline text-[11px] font-black uppercase tracking-widest">Revoke</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
export const NamingConvention = () => <AdminPlaceholder title="Naming Convention" />;
export const MembershipPlan = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState(false); // 'add', 'edit', 'view'
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', fees: '', benefits: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await api.get('/master/plans');
            if (res.data.success) {
                setPlans(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch plans:', error);
            toast.error('Failed to load plans');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, plan = null) => {
        setViewMode(mode);
        setSelectedPlan(plan);
        if (plan) {
            setFormData({
                name: plan.name,
                description: plan.description || '',
                fees: plan.fees || '',
                benefits: plan.benefits || ''
            });
        } else {
            setFormData({ name: '', description: '', fees: '', benefits: '' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedPlan(null);
        setFormData({ name: '', description: '', fees: '', benefits: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || formData.fees === '') {
            toast.error('Plan name and fees are required');
            return;
        }

        setSubmitting(true);
        try {
            if (viewMode === 'add') {
                await api.post('/master/plans', formData);
                toast.success('Plan added successfully');
            } else if (viewMode === 'edit') {
                await api.put(`/master/plans/${selectedPlan.id}`, formData);
                toast.success('Plan updated successfully');
            }
            handleCloseModal();
            fetchPlans();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to save plan';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove the plan "${name}"?`)) {
            return;
        }

        try {
            await api.delete(`/master/plans/${id}`);
            toast.success('Plan removed successfully');
            fetchPlans();
        } catch (error) {
            toast.error('Failed to remove plan');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
            <div className="premium-card p-10 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Membership Plans</h1>
                    <p className="text-slate-500 font-medium">Manage tiered membership structures and corresponding fees</p>
                </div>
                <button
                    onClick={() => handleOpenModal('add')}
                    className="px-8 py-3.5 text-[13px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-primary-600 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95"
                >
                    Add Global Plan
                </button>
            </div>

            {plans.length === 0 ? (
                <div className="premium-card p-24 text-center bg-white border-dashed">
                    <p className="text-slate-400 font-bold uppercase tracking-widest opacity-40">No active plans identified</p>
                </div>
            ) : (
                <div className="premium-card overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse bg-white">
                            <thead>
                                <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
                                    <th className="px-8 py-5">Index</th>
                                    <th className="px-6 py-5">Plan Designation</th>
                                    <th className="px-6 py-5">Valuation</th>
                                    <th className="px-6 py-5">Description</th>
                                    <th className="px-8 py-5 text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {plans.map((plan, index) => (
                                    <tr key={plan.id} className="group hover:bg-slate-50/40 transition-all duration-200">
                                        <td className="px-8 py-5 text-[12px] font-bold text-slate-400">
                                            #{String(index + 1).padStart(2, '0')}
                                        </td>
                                        <td className="px-6 py-5 text-[14px] font-black text-slate-900 uppercase tracking-tight">
                                            {plan.name}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[14px] font-bold text-primary-600">₹{parseFloat(plan.fees).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-5 text-[13px] font-medium text-slate-500 max-w-xs truncate">
                                            {plan.description || 'N/A'}
                                        </td>
                                        <td className="px-8 py-5 text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenModal('view', plan)}
                                                className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
                                                title="Audit"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal('edit', plan)}
                                                className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors"
                                                title="Modify"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(plan.id, plan.name)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                                title="Purge"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity" onClick={handleCloseModal}></div>

                    <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-900/20 w-full max-w-lg transform transition-all overflow-hidden border border-slate-100">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                    {viewMode === 'add' ? 'Add Membership Plan' : viewMode === 'edit' ? 'Edit Plan' : 'Plan Details'}
                                </h3>
                                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Membership Plan *</label>
                                        <input
                                            type="text"
                                            readOnly={viewMode === 'view'}
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-900 text-sm"
                                            placeholder="e.g. Gold"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Fees (numeric) *</label>
                                        <input
                                            type="number"
                                            readOnly={viewMode === 'view'}
                                            value={formData.fees}
                                            onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-900 text-sm"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Plan Description</label>
                                    <textarea
                                        readOnly={viewMode === 'view'}
                                        rows="2"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-900 text-sm resize-none"
                                        placeholder="Briefly describe what this plan covers..."
                                    ></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Membership Plan Benefits</label>
                                    <textarea
                                        readOnly={viewMode === 'view'}
                                        rows="2"
                                        value={formData.benefits}
                                        onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-900 text-sm resize-none"
                                        placeholder="List key benefits..."
                                    ></textarea>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className={viewMode === 'view'
                                            ? "px-8 py-3 bg-slate-900 text-white rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                                            : "px-6 py-3 text-[12px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                                        }
                                    >
                                        {viewMode === 'view' ? 'Close Detail' : 'Cancel'}
                                    </button>
                                    {viewMode !== 'view' && (
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="px-8 py-3 bg-slate-900 text-white text-[12px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 active:scale-95"
                                        >
                                            {submitting ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export const MemberCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState(false); // 'add', 'edit', 'view'
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/master/categories');
            if (res.data.success) {
                setCategories(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, category = null) => {
        setViewMode(mode);
        setSelectedCategory(category);
        if (category) {
            setFormData({ name: category.name, description: category.description || '' });
        } else {
            setFormData({ name: '', description: '' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCategory(null);
        setFormData({ name: '', description: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        setSubmitting(true);
        try {
            if (viewMode === 'add') {
                await api.post('/master/categories', formData);
                toast.success('Category added successfully');
            } else if (viewMode === 'edit') {
                await api.put(`/master/categories/${selectedCategory.id}`, formData);
                toast.success('Category updated successfully');
            }
            handleCloseModal();
            fetchCategories();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to save category';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove the category "${name}"?`)) {
            return;
        }

        try {
            await api.delete(`/master/categories/${id}`);
            toast.success('Category removed successfully');
            fetchCategories();
        } catch (error) {
            toast.error('Failed to remove category');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
            <div className="premium-card p-10 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Member Categories</h1>
                    <p className="text-slate-500 font-medium">Define and manage professional classification tiers for organization members</p>
                </div>
                <button
                    onClick={() => handleOpenModal('add')}
                    className="px-8 py-3.5 text-[13px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-primary-600 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95"
                >
                    Create Classification
                </button>
            </div>

            {categories.length === 0 ? (
                <div className="premium-card p-24 text-center bg-white border-dashed">
                    <p className="text-slate-400 font-bold uppercase tracking-widest opacity-40">No taxonomies identified</p>
                </div>
            ) : (
                <div className="premium-card overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse bg-white">
                            <thead>
                                <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
                                    <th className="px-8 py-5">Index</th>
                                    <th className="px-6 py-5">Classification Identity</th>
                                    <th className="px-6 py-5">Description</th>
                                    <th className="px-8 py-5 text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {categories.map((category, index) => (
                                    <tr key={category.id} className="group hover:bg-slate-50/40 transition-all duration-200">
                                        <td className="px-8 py-5 text-[12px] font-bold text-slate-400">
                                            #{String(index + 1).padStart(2, '0')}
                                        </td>
                                        <td className="px-6 py-5 text-[14px] font-black text-slate-900 uppercase tracking-tight">
                                            {category.name}
                                        </td>
                                        <td className="px-6 py-5 text-[13px] font-medium text-slate-500 max-w-sm truncate">
                                            {category.description || 'N/A'}
                                        </td>
                                        <td className="px-8 py-5 text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenModal('view', category)}
                                                className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
                                                title="Audit"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal('edit', category)}
                                                className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors"
                                                title="Modify"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id, category.name)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                                title="Purge"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity" onClick={handleCloseModal}></div>

                    <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-900/20 w-full max-w-md transform transition-all overflow-hidden border border-slate-100">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                    {viewMode === 'add' ? 'Add Member Category' : viewMode === 'edit' ? 'Edit Category' : 'Category Details'}
                                </h3>
                                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Member Category *</label>
                                    <input
                                        type="text"
                                        readOnly={viewMode === 'view'}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-900 text-sm"
                                        placeholder="e.g. Real Estate"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Category Description</label>
                                    <textarea
                                        readOnly={viewMode === 'view'}
                                        rows="4"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-900 text-sm resize-none"
                                        placeholder="Describe the scope of this category..."
                                    ></textarea>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className={viewMode === 'view'
                                            ? "px-8 py-3 bg-slate-900 text-white rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                                            : "px-6 py-3 text-[12px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                                        }
                                    >
                                        {viewMode === 'view' ? 'Close Detail' : 'Cancel'}
                                    </button>
                                    {viewMode !== 'view' && (
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="px-8 py-3 bg-slate-900 text-white text-[12px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 active:scale-95"
                                        >
                                            {submitting ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export const Chapters = () => {
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState('add'); // 'add', 'edit', 'view'
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        streetAddress: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        emailId: '',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchChapters();
    }, []);

    const fetchChapters = async () => {
        setLoading(true);
        try {
            const res = await api.get('/chapters');
            if (res.data.success) {
                setChapters(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch chapters:', error);
            toast.error('Failed to load chapters');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, chapter = null) => {
        setViewMode(mode);
        setSelectedChapter(chapter);
        if (chapter) {
            setFormData({
                name: chapter.name || '',
                phoneNumber: chapter.phone_number || '',
                streetAddress: chapter.street_address || '',
                city: chapter.city || '',
                state: chapter.state || '',
                country: chapter.country || '',
                zipCode: chapter.zip_code || '',
                emailId: chapter.email_id || '',
                description: chapter.description || ''
            });
        } else {
            setFormData({
                name: '',
                phoneNumber: '',
                streetAddress: '',
                city: '',
                state: '',
                country: '',
                zipCode: '',
                emailId: '',
                description: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedChapter(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Chapter name is required');
            return;
        }

        setSubmitting(true);
        try {
            if (viewMode === 'add') {
                await api.post('/chapters', formData);
                toast.success('Chapter created successfully');
            } else if (viewMode === 'edit') {
                await api.put(`/chapters/${selectedChapter.id}`, formData);
                toast.success('Chapter updated successfully');
            }
            handleCloseModal();
            fetchChapters();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to save chapter';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove the chapter "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await api.delete(`/chapters/${id}`);
            toast.success('Chapter removed successfully');
            fetchChapters();
        } catch (error) {
            toast.error('Failed to remove chapter');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
            <div className="premium-card p-10 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Operational Chapters</h1>
                    <p className="text-slate-500 font-medium">Coordinate and manage regional organizational hubs and satellite offices</p>
                </div>
                <button
                    onClick={() => handleOpenModal('add')}
                    className="px-8 py-3.5 text-[13px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-primary-600 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95"
                >
                    Establish Cluster
                </button>
            </div>

            {chapters.length === 0 ? (
                <div className="premium-card p-24 text-center bg-white border-dashed">
                    <p className="text-slate-400 font-bold uppercase tracking-widest opacity-40">No operational nodes detected</p>
                </div>
            ) : (
                <div className="premium-card overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse bg-white">
                            <thead>
                                <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
                                    <th className="px-8 py-5">Chapter Identity</th>
                                    <th className="px-6 py-5">Location</th>
                                    <th className="px-6 py-5">Contact Node</th>
                                    <th className="px-8 py-5 text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {chapters.map((chapter) => (
                                    <tr key={chapter.id} className="group hover:bg-slate-50/40 transition-all duration-200">
                                        <td className="px-8 py-5">
                                            <span className="text-[14px] font-black text-slate-900 uppercase tracking-tight group-hover:text-primary-600 transition-colors">
                                                {chapter.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-slate-700">{chapter.city || '-'}</span>
                                                <span className="text-[11px] font-bold text-slate-400">{chapter.state || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-[13px] font-medium text-slate-500">
                                            {chapter.email_id || '-'}
                                        </td>
                                        <td className="px-8 py-5 text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenModal('view', chapter)}
                                                className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
                                                title="Details"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal('edit', chapter)}
                                                className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors"
                                                title="Adjust"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(chapter.id, chapter.name)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                                title="Dismantle"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity" onClick={handleCloseModal}></div>

                    <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-900/20 w-full max-w-2xl transform transition-all overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
                        <div className="p-8 pb-4 shrink-0 border-b border-slate-50">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                    {viewMode === 'add' ? 'Add New Chapter' : viewMode === 'edit' ? 'Edit Chapter' : 'Chapter Details'}
                                </h3>
                                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-8 pt-6 overflow-y-auto custom-scrollbar flex-1">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Chapter Name *</label>
                                        <input
                                            type="text"
                                            readOnly={viewMode === 'view'}
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-900 text-sm"
                                            placeholder="e.g. Pune Central"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                                        <input
                                            type="tel"
                                            readOnly={viewMode === 'view'}
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-900 text-sm"
                                            placeholder="+91 00000 00000"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Street Address</label>
                                        <input
                                            type="text"
                                            readOnly={viewMode === 'view'}
                                            value={formData.streetAddress}
                                            onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-900 text-sm"
                                            placeholder="123 Main St, Suite 100"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">City</label>
                                        <input
                                            type="text"
                                            readOnly={viewMode === 'view'}
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-900 text-sm"
                                            placeholder="Pune"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">State</label>
                                        <input
                                            type="text"
                                            readOnly={viewMode === 'view'}
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-900 text-sm"
                                            placeholder="Maharashtra"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Zip Code</label>
                                        <input
                                            type="text"
                                            readOnly={viewMode === 'view'}
                                            value={formData.zipCode}
                                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-900 text-sm"
                                            placeholder="411001"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Email ID</label>
                                        <input
                                            type="email"
                                            readOnly={viewMode === 'view'}
                                            value={formData.emailId}
                                            onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-900 text-sm"
                                            placeholder="chapter@bizlinks.in"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Chapter Description</label>
                                    <textarea
                                        readOnly={viewMode === 'view'}
                                        rows="2"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-900 text-sm resize-none"
                                        placeholder="Tell us about this chapter..."
                                    ></textarea>
                                </div>
                            </form>
                        </div>

                        <div className="p-8 pt-4 shrink-0 border-t border-slate-50 flex justify-end gap-3 bg-slate-50/30">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className={viewMode === 'view'
                                    ? "px-8 py-3 bg-slate-900 text-white rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                                    : "px-6 py-3 text-[12px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                                }
                            >
                                {viewMode === 'view' ? 'Close Detail' : 'Cancel'}
                            </button>
                            {viewMode !== 'view' && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="px-8 py-3 bg-slate-900 text-white text-[12px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 active:scale-95"
                                >
                                    {submitting ? 'Creating...' : 'Save Changes'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export const MembershipRequests = () => {
    const { user } = useAuth();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [approvedMembers, setApprovedMembers] = useState([]);
    const [rejectedRequests, setRejectedRequests] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [categories, setCategories] = useState([]);
    const [plans, setPlans] = useState([]);
    const [members, setMembers] = useState([]);
    const [orgSettings, setOrgSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState('view'); // 'view', 'edit'
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected'
    const [showCredentials, setShowCredentials] = useState(false);
    const [generatedCredentials, setGeneratedCredentials] = useState({ email: '', password: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const canOnboard = user?.role === 'admin' || (user?.role === 'chapter_admin' && !!orgSettings.memberOnboarding);

    // Form Details
    const [formData, setFormData] = useState({
        chapter: '',
        categoryId: '',
        planId: '',
        referredById: '',
        referredByOther: '',
        name: '',
        email: '',
        mobile: '',
        yearsInBusiness: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            console.log('--- FETCHING MEMBERSHIP REQUESTS DATA ---');

            // Fetch pending requests
            try {
                const pendRes = await api.get('/users/pending');
                setPendingRequests(pendRes.data.data || []);
                console.log('Pending requests fetched:', pendRes.data.data?.length);
            } catch (err) {
                console.error('Failed to fetch pending requests:', err);
                toast.error('Failed to load pending requests');
                setPendingRequests([]);
            }

            // Fetch approved members
            try {
                const appRes = await api.get('/users/approved');
                // Filter out administrators from the approved members list
                setApprovedMembers(appRes.data.data?.filter(u => u.role !== 'admin') || []);
                console.log('Approved members fetched:', appRes.data.data?.length);
            } catch (err) {
                console.error('Failed to fetch approved members:', err);
                toast.error('Failed to load approved members');
                setApprovedMembers([]);
            }

            // Fetch rejected requests
            try {
                const rejRes = await api.get('/users/rejected');
                setRejectedRequests(rejRes.data.data || []);
                console.log('Rejected requests fetched:', rejRes.data.data?.length);
            } catch (err) {
                console.error('Failed to fetch rejected requests:', err);
                setRejectedRequests([]);
            }

            // Fetch master data for the approval modal
            try {
                const [chaptersRes, plansRes, categoriesRes, membersRes, settingsRes] = await Promise.all([
                    api.get('/chapters'), // Original endpoint
                    api.get('/master/plans'), // Original endpoint
                    api.get('/master/categories'), // Original endpoint
                    api.get('/users'), // Original endpoint for all users to filter approved members
                    api.get('/organizations/settings')
                ]);
                setChapters(chaptersRes.data.data || []);
                setPlans(plansRes.data.data || []);
                setCategories(categoriesRes.data.data || []);
                setMembers(membersRes.data.data?.filter(m => m.status === 'approved') || []);

                if (settingsRes.data.success) {
                    const settingsData = settingsRes.data.data;
                    const parsedSettings = typeof settingsData.settings === 'string'
                        ? JSON.parse(settingsData.settings || '{}')
                        : (settingsData.settings || {});
                    setOrgSettings(parsedSettings);
                }

                console.log('Master data and settings fetched');
            } catch (err) {
                console.error('Failed to fetch master data/settings:', err);
                toast.error('Failed to load required data');
                setChapters([]);
                setPlans([]);
                setCategories([]);
                setMembers([]);
            }

        } catch (error) {
            console.error("Critical error in fetchData:", error);
            toast.error("An error occurred while loading membership data");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, request) => {
        setViewMode(mode);
        setSelectedRequest(request);
        setFormData({
            chapter: request.chapter || '',
            categoryId: request.category_id || '',
            planId: request.plan_id || '',
            referredById: request.referred_by_id || '',
            referredByOther: request.referred_by_other || '',
            name: request.name || '',
            email: request.email || '',
            mobile: request.mobile || '',
            yearsInBusiness: request.years_in_business || ''
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedRequest(null);
    };

    const handleAction = async (status) => {
        if (!selectedRequest) return;

        if (status === 'approved') {
            if (!formData.chapter || !formData.categoryId || !formData.planId) {
                toast.error('Please assign Chapter, Category, and Plan before approval');
                return;
            }
        }

        setSubmitting(true);
        try {
            if (status === 'approved') {
                const response = await api.put(`/users/${selectedRequest.id}/approve`, formData);

                // Capture credentials from response
                if (response.data.credentials) {
                    setGeneratedCredentials({
                        email: response.data.credentials.email || selectedRequest.email,
                        password: response.data.credentials.password || ''
                    });
                    setShowCredentials(true);

                    // Auto-hide credentials after 30 seconds
                    setTimeout(() => {
                        setShowCredentials(false);
                    }, 30000);
                }

                toast.success('Member approved successfully');
            } else if (status === 'rejected') {
                if (!window.confirm('Are you sure you want to reject this request?')) {
                    setSubmitting(false);
                    return;
                }
                await api.put(`/users/${selectedRequest.id}/reject`);
                toast.success('Request rejected');
            } else if (status === 'update') {
                // Use the profile update endpoint if we need to edit details
                await api.put(`/users/profile`, {
                    userId: selectedRequest.id,
                    name: formData.name,
                    mobile: formData.mobile
                });
                toast.success('Member details updated');
            }
            handleCloseModal();
            fetchData();
        } catch (error) {
            console.error(`Failed to ${status} request:`, error);
            toast.error(error.response?.data?.message || `Failed to perform action`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemove = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
        try {
            await api.put(`/users/${id}/reject`); // Or a delete endpoint if available
            toast.success('Member removed');
            fetchData();
        } catch (error) {
            toast.error('Failed to remove member');
        }
    };

    // Pagination logic
    const fullList = activeTab === 'pending' ? pendingRequests : (activeTab === 'approved' ? approvedMembers : rejectedRequests);
    const totalPages = Math.ceil(fullList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const activeList = activeTab === 'pending' ? fullList.slice(startIndex, endIndex) : fullList;

    // Reset to page 1 when switching tabs
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-10 animate-fade-in px-4 md:px-0">
            <div className="premium-card p-4 md:p-8 bg-white flex flex-col gap-4 md:gap-6">
                <div className="flex flex-col gap-2 md:gap-3">
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Membership Provisioning</h1>
                    <p className="text-xs md:text-sm font-medium text-slate-500">Review and authorize global membership applications</p>
                </div>

                {/* Mobile-friendly tabs with horizontal scroll */}
                <div className="flex bg-slate-100/80 p-1.5 rounded-2xl w-full overflow-x-auto scrollbar-hide backdrop-blur-sm">
                    {[
                        { id: 'pending', label: 'Queued', color: 'text-amber-600', count: pendingRequests.length },
                        { id: 'approved', label: 'Authorized', color: 'text-emerald-600', count: approvedMembers.length },
                        { id: 'rejected', label: 'Archived', color: 'text-slate-400', count: rejectedRequests.length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-xl shadow-slate-200/50 scale-105 z-10' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <span className="flex items-center gap-1.5 md:gap-2 whitespace-nowrap">
                                {tab.label}
                                <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>{tab.count}</span>
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Credentials Display - Shows after approval */}
            {showCredentials && (
                <div className="premium-card p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 animate-fade-in">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Member Approved Successfully!</h3>
                                <p className="text-sm text-slate-600 font-medium">Use these credentials to log in to the application</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCredentials(false)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-blue-100">
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Email ID</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={generatedCredentials.email}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 outline-none"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedCredentials.email);
                                        toast.success('Email copied to clipboard');
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all active:scale-95"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 border border-blue-100">
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Password</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={generatedCredentials.password}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 outline-none"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedCredentials.password);
                                        toast.success('Password copied to clipboard');
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all active:scale-95"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-800 font-semibold flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            This information will auto-hide in 30 seconds. Make sure to save these credentials.
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'pending' ? (
                // Card-based layout for pending requests
                <div className="premium-card p-6">
                    {activeList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-4">
                                <UserPlusIcon className="w-12 h-12 opacity-20" />
                            </div>
                            <p className="text-sm font-bold uppercase tracking-widest opacity-40">No pending applications</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {activeList.map((request) => (
                                <div
                                    key={request.id}
                                    className="group relative bg-white border-2 border-slate-100 rounded-3xl p-6 hover:border-primary-200 hover:shadow-xl transition-all duration-300"
                                >
                                    {/* Header with Profile */}
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center border-2 border-white shadow-lg ring-2 ring-slate-100 group-hover:ring-primary-200 transition-all">
                                                <span className="text-2xl font-black text-primary-600">
                                                    {request.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-white shadow-sm" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-black text-slate-900 mb-1 truncate">
                                                {request.name}
                                            </h3>
                                            <p className="text-sm font-semibold text-slate-500 truncate mb-2">
                                                {request.email}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">
                                                    Pending Review
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Member Details Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                                Mobile
                                            </p>
                                            <p className="text-sm font-bold text-slate-700">
                                                {request.mobile || 'Not provided'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                                Experience
                                            </p>
                                            <p className="text-sm font-bold text-slate-700">
                                                {request.years_in_business ? `${request.years_in_business} years` : 'Not specified'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                                Chapter
                                            </p>
                                            <p className="text-sm font-bold text-slate-700">
                                                {request.chapter || 'Not assigned'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                                Registered
                                            </p>
                                            <p className="text-sm font-bold text-slate-700">
                                                {new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleOpenModal('view', request)}
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all active:scale-95"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View
                                        </button>
                                        <button
                                            onClick={() => canOnboard ? handleOpenModal('edit', request) : toast.info('You do not have permission to onboard members')}
                                            className={twMerge(
                                                "flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-95",
                                                canOnboard
                                                    ? "bg-primary-100 hover:bg-primary-200 text-primary-700"
                                                    : "bg-slate-50 text-slate-400 cursor-not-allowed opacity-60"
                                            )}
                                            title={canOnboard ? "" : "Chapter Admin Onboarding Disabled"}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit & Process
                                        </button>
                                        <button
                                            onClick={() => canOnboard ? handleRemove(request.id, request.name) : toast.info('You do not have permission to discard requests')}
                                            className={twMerge(
                                                "col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 border",
                                                canOnboard
                                                    ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-100"
                                                    : "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed opacity-60"
                                            )}
                                            title={canOnboard ? "" : "Chapter Admin Onboarding Disabled"}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Discard Request
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {fullList.length > itemsPerPage && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                            <div className="text-sm font-semibold text-slate-600">
                                Showing <span className="font-black text-slate-900">{startIndex + 1}</span> to{' '}
                                <span className="font-black text-slate-900">{Math.min(endIndex, fullList.length)}</span> of{' '}
                                <span className="font-black text-slate-900">{fullList.length}</span> requests
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${currentPage === 1
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50 active:scale-95'
                                        }`}
                                >
                                    Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNum = index + 1;
                                        // Show first page, last page, current page, and pages around current
                                        if (
                                            pageNum === 1 ||
                                            pageNum === totalPages ||
                                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${currentPage === pageNum
                                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                                                        : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50 active:scale-95'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        } else if (
                                            pageNum === currentPage - 2 ||
                                            pageNum === currentPage + 2
                                        ) {
                                            return <span key={pageNum} className="text-slate-400 px-1">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${currentPage === totalPages
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50 active:scale-95'
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // Table layout for approved and rejected tabs
                <div className="premium-card overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse bg-white">
                            <thead>
                                <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
                                    <th className="px-8 py-5">Applicant Identity</th>
                                    <th className="px-6 py-5">Contact Node</th>
                                    <th className="px-6 py-5">Registry Date</th>
                                    <th className="px-6 py-5">Stage</th>
                                    <th className="px-8 py-5 text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {activeList.map((request, index) => (
                                    <tr key={request.id} className="group hover:bg-slate-50/40 transition-all duration-200">
                                        <td className="px-8 py-5">
                                            <span className="text-[14px] font-black text-slate-900 uppercase tracking-tight group-hover:text-primary-600 transition-colors">{request.name}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-slate-700">{request.email}</span>
                                                <span className="text-[11px] font-bold text-slate-400">{request.mobile || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-[12px] font-bold text-slate-400">
                                            {new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider ${activeTab === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                activeTab === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    'bg-slate-50 text-slate-400 border border-slate-100'
                                                }`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenModal('view', request)}
                                                className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
                                                title="Audit"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            {activeTab === 'pending' && (
                                                <button
                                                    onClick={() => handleOpenModal('edit', request)}
                                                    className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors"
                                                    title="Process"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleRemove(request.id, request.name)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 translate-x-0 md:translate-x-4 md:group-hover:translate-x-0 transition-all"
                                                title="Discard"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {activeList.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-24 text-center">
                                            <p className="text-sm font-bold uppercase tracking-widest text-slate-300">No applications in this registry</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && selectedRequest && (
                <div className="fixed inset-0 z-[9999] overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={handleCloseModal}></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-extrabold text-gray-900">
                                        {viewMode === 'view' ? 'Member Details' : 'Review & Approve Request'}
                                    </h3>
                                    <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Member Info Section */}
                                    <div className="bg-gray-50 p-5 rounded-xl">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
                                                {viewMode === 'edit' && activeTab === 'pending' ? (
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                                    />
                                                ) : (
                                                    <div className="w-full px-3 py-2 bg-white/50 border border-transparent rounded-lg text-sm font-semibold text-gray-900">{selectedRequest.name}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
                                                <div className="w-full px-3 py-2 bg-white/50 border border-transparent rounded-lg text-sm font-semibold text-gray-900 truncate">{selectedRequest.email}</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mobile</label>
                                                    {viewMode === 'edit' && activeTab === 'pending' ? (
                                                        <input
                                                            type="text"
                                                            value={formData.mobile}
                                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                                        />
                                                    ) : (
                                                        <div className="w-full px-3 py-2 bg-white/50 border border-transparent rounded-lg text-sm font-semibold text-gray-900">{selectedRequest.mobile || '-'}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Experience</label>
                                                    <div className="w-full px-3 py-2 bg-white/50 border border-transparent rounded-lg text-sm font-semibold text-gray-900">{selectedRequest.years_in_business || '0'}Y</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Assigned Details Section - Visible in View mode (for approved/rejected) or in Edit mode */}
                                    {((viewMode === 'view' && selectedRequest.status !== 'pending') || (viewMode === 'edit' && activeTab === 'pending')) && (
                                        <div className="space-y-4 pt-2">
                                            <div className="flex items-center gap-4 mb-2">
                                                <h4 className="text-sm font-bold text-gray-900 whitespace-nowrap">
                                                    {viewMode === 'view' ? 'Membership Assignment' : 'Assign Membership Details'}
                                                </h4>
                                                <div className="h-px bg-gray-100 w-full" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Chapter</label>
                                                    {viewMode === 'edit' && activeTab === 'pending' ? (
                                                        <select
                                                            value={formData.chapter}
                                                            onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                        >
                                                            <option value="">Select Chapter</option>
                                                            {chapters.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                                        </select>
                                                    ) : (
                                                        <div className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm font-semibold text-gray-900">
                                                            {selectedRequest.chapter || 'Not Assigned'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Category</label>
                                                    {viewMode === 'edit' && activeTab === 'pending' ? (
                                                        <select
                                                            value={formData.categoryId}
                                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                        >
                                                            <option value="">Select Category</option>
                                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                        </select>
                                                    ) : (
                                                        <div className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm font-semibold text-gray-900">
                                                            {categories.find(c => c.id === selectedRequest.category_id)?.name || 'Not Assigned'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Plan & Reference</label>
                                                    <div className="flex gap-2">
                                                        {viewMode === 'edit' && activeTab === 'pending' ? (
                                                            <>
                                                                <select
                                                                    value={formData.planId}
                                                                    onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                                                                    className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                                                                >
                                                                    <option value="">Plan</option>
                                                                    {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                                </select>
                                                                <select
                                                                    value={formData.referredById}
                                                                    onChange={(e) => setFormData({ ...formData, referredById: e.target.value })}
                                                                    className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                                                                >
                                                                    <option value="">Referral</option>
                                                                    <option value="other">Other</option>
                                                                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                                                </select>
                                                            </>
                                                        ) : (
                                                            <div className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm font-semibold text-gray-900">
                                                                {plans.find(p => p.id === selectedRequest.plan_id)?.name || 'Direct'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {viewMode === 'edit' && activeTab === 'pending' && formData.referredById === 'other' && (
                                                        <input
                                                            type="text"
                                                            value={formData.referredByOther}
                                                            onChange={(e) => setFormData({ ...formData, referredByOther: e.target.value })}
                                                            placeholder="Enter name"
                                                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="mt-8 flex justify-end gap-3 border-t pt-6">
                                        <button
                                            onClick={handleCloseModal}
                                            className={viewMode === 'view'
                                                ? "px-10 py-3 bg-slate-900 text-white rounded-xl text-[13px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                                                : "px-6 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-600 hover:bg-gray-50 outline-none"
                                            }
                                        >
                                            {viewMode === 'view' ? 'Close Detail' : 'Cancel'}
                                        </button>
                                        {viewMode === 'edit' && activeTab === 'pending' && canOnboard && (
                                            <>
                                                <button
                                                    onClick={() => handleAction('rejected')}
                                                    disabled={submitting}
                                                    className="px-6 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all disabled:opacity-50 outline-none"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleAction('approved')}
                                                    disabled={submitting}
                                                    className="px-8 py-2 bg-blue-600 text-white rounded-xl text-sm font-extrabold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 outline-none"
                                                >
                                                    {submitting ? 'Approve & Assign' : 'Approve & Assign'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export const RenewMemberList = () => <AdminPlaceholder title="Renewal List" />;
export const TrainingModule = () => <AdminPlaceholder title="Training & Courses" />;
export const ThankYouNotes = () => <ThankYouNotesComponent />;
