import React, { useState, useEffect } from 'react';
import { ASSETS_URL } from '../config/apiConfig';
import { useAuth } from '../context/AuthContext';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { Fragment } from 'react';
import {
    XMarkIcon,
    UserIcon,
    BriefcaseIcon,
    CameraIcon,
    PencilSquareIcon,
    IdentificationIcon,
    BuildingOfficeIcon,
    CreditCardIcon
} from '@heroicons/react/24/outline';
import dataService from '../services/dataService';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

const MemberEditForm = ({ memberId, isOpen, onClose, onSave }) => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        // Personal Information
        first_name: '',
        last_name: '',
        dob: '',
        gender: '',
        email: '',
        contact_number: '',
        country: '',
        state: '',
        city: '',
        zip_code: '',
        address: '',

        // Corporate Information
        company_name: '',
        company_title: '',
        company_linkedin: '',
        company_email: '',
        company_website: '',
        company_size: '',
        company_contact: '',
        company_country: '',
        company_state: '',
        company_city: '',
        company_zip: '',
        company_address: '',

        // Membership Information
        category_id: '',
        plan_id: '',
        member_type: '',
        chapter: '',
        membership_start_date: '',
        membership_end_date: '',
        membership_renewal_date: '',
        status: 'approved',
        profile_image: '',
        company_logo: ''
    });

    const [profilePreview, setProfilePreview] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const [categories, setCategories] = useState([]);
    const [plans, setPlans] = useState([]);
    const [chapters, setChapters] = useState([]);

    useEffect(() => {
        if (isOpen && memberId) {
            fetchMemberData();
            fetchDropdownData();
        }
    }, [isOpen, memberId]);

    const fetchMemberData = async () => {
        setLoading(true);
        try {
            const response = await dataService.getFullMemberProfile(memberId);
            const member = response.data.data;

            // Prefill form with existing data
            setFormData({
                first_name: member.first_name || '',
                last_name: member.last_name || '',
                dob: member.dob ? member.dob.split('T')[0] : '',
                gender: member.gender || '',
                email: member.email || '',
                contact_number: member.contact_number || '',
                country: member.country || '',
                state: member.state || '',
                city: member.city || '',
                zip_code: member.zip_code || '',
                address: member.address || '',

                company_name: member.company_name || '',
                company_title: member.company_title || '',
                company_linkedin: member.company_linkedin || '',
                company_email: member.company_email || '',
                company_website: member.company_website || '',
                company_size: member.company_size || '',
                company_contact: member.company_contact || '',
                company_country: member.company_country || '',
                company_state: member.company_state || '',
                company_city: member.company_city || '',
                company_zip: member.company_zip || '',
                company_address: member.company_address || '',

                category_id: member.category_id || '',
                plan_id: member.plan_id || '',
                member_type: member.member_type || '',
                chapter: member.chapter || '',
                membership_start_date: member.membership_start_date ? member.membership_start_date.split('T')[0] : '',
                membership_end_date: member.membership_end_date ? member.membership_end_date.split('T')[0] : '',
                membership_renewal_date: member.membership_renewal_date ? member.membership_renewal_date.split('T')[0] : '',
                status: member.status || 'approved',
                profile_image: member.profile_image || '',
                company_logo: member.company_logo || ''
            });

            if (member.profile_image) setProfilePreview(`${ASSETS_URL}${member.profile_image}`);
            if (member.company_logo) setLogoPreview(`${ASSETS_URL}${member.company_logo}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load member data');
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [catRes, planRes, chapRes] = await Promise.all([
                dataService.getMasterCategories(),
                dataService.getMasterPlans(),
                dataService.getChapters()
            ]);

            if (catRes.data.success) setCategories(catRes.data.data);
            if (planRes.data.success) setPlans(planRes.data.data);
            if (chapRes.data.success) setChapters(chapRes.data.data);
        } catch (error) {
            console.error('Failed to fetch dropdown data:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingPhoto(true);
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        try {
            const res = await dataService.adminUploadMemberPhoto(memberId, formDataUpload);
            setProfilePreview(`${ASSETS_URL}${res.data.imageUrl}`);
            setFormData(prev => ({ ...prev, profile_image: res.data.imageUrl }));
            toast.success('Profile photo uploaded');
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload photo');
        } finally {
            setUploadingPhoto(false);
        }

        // Refresh global context if editing self
        if (user && (user.id === parseInt(memberId) || user.id === memberId)) {
            refreshUser();
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingLogo(true);
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        try {
            const res = await dataService.uploadCompanyLogo(memberId, formDataUpload);
            setLogoPreview(`${ASSETS_URL}${res.data.imageUrl}`);
            setFormData(prev => ({ ...prev, company_logo: res.data.imageUrl }));
            toast.success('Company logo uploaded');
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload logo');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await dataService.adminUpdateMemberFull(memberId, formData);
            toast.success('Member updated successfully');
            onSave();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update member');
        } finally {
            setSaving(false);
        }

        // Refresh global context if editing self
        if (user && (user.id === parseInt(memberId) || user.id === memberId)) {
            refreshUser();
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                    <Dialog.Title className="text-xl font-bold text-gray-900">
                                        Edit Member Details
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-500 transition-colors"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh)] md:max-h-[min(800px,85vh)]">
                                        <Tab.Group as="div" className="flex-1 flex flex-col min-h-0">
                                            <div className="px-4 md:px-6 border-b border-gray-100 bg-gray-50/50 flex-shrink-0 overflow-x-auto scrollbar-hide">
                                                <Tab.List className="flex gap-2 md:gap-8 min-w-max md:min-w-0">
                                                    {[
                                                        { name: 'Personal', icon: IdentificationIcon },
                                                        { name: 'Corporate', icon: BuildingOfficeIcon },
                                                        { name: 'Membership', icon: CreditCardIcon }
                                                    ].map((tab) => (
                                                        <Tab
                                                            key={tab.name}
                                                            className={({ selected }) => twMerge(
                                                                "flex items-center gap-2 py-4 px-2 md:px-0 text-sm font-bold border-b-2 transition-all outline-none whitespace-nowrap flex-shrink-0",
                                                                selected
                                                                    ? "border-primary-600 text-primary-600"
                                                                    : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
                                                            )}
                                                        >
                                                            <tab.icon className="w-5 h-5 flex-shrink-0" />
                                                            <span className="hidden sm:inline">{tab.name}</span>
                                                        </Tab>
                                                    ))}
                                                </Tab.List>
                                            </div>

                                            <Tab.Panels className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                                {/* Tab 1: Personal Information */}
                                                <Tab.Panel className="space-y-8 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300 pb-4">
                                                    <div className="flex flex-col md:flex-row gap-8">
                                                        {/* Avatar Upload Section */}
                                                        <div className="flex flex-col items-center gap-4">
                                                            <div className="relative group">
                                                                <div className="w-32 h-32 rounded-3xl bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center transition-transform hover:rotate-2">
                                                                    {profilePreview ? (
                                                                        <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <UserIcon className="w-16 h-16 text-slate-300" />
                                                                    )}
                                                                    {uploadingPhoto && (
                                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                                                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <label className="absolute -bottom-2 -right-2 p-2.5 bg-primary-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-primary-700 transition-all hover:scale-110 active:scale-95 group-hover:shadow-primary-200 z-20">
                                                                    <CameraIcon className="w-5 h-5" />
                                                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                                                                </label>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Profile Photo</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">First Name</label>
                                                                <input
                                                                    type="text"
                                                                    name="first_name"
                                                                    value={formData.first_name}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Last Name</label>
                                                                <input
                                                                    type="text"
                                                                    name="last_name"
                                                                    value={formData.last_name}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Date of Birth</label>
                                                                <input
                                                                    type="date"
                                                                    name="dob"
                                                                    value={formData.dob}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Gender</label>
                                                                <select
                                                                    name="gender"
                                                                    value={formData.gender}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all appearance-none"
                                                                >
                                                                    <option value="">Select Gender</option>
                                                                    <option value="Male">Male</option>
                                                                    <option value="Female">Female</option>
                                                                    <option value="Other">Other</option>
                                                                </select>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                                                <input
                                                                    type="email"
                                                                    name="email"
                                                                    value={formData.email}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Mobile number</label>
                                                                <input
                                                                    type="tel"
                                                                    name="contact_number"
                                                                    value={formData.contact_number}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="pt-6 border-t border-slate-100">
                                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Location Details</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                                            <div className="space-y-1.5 md:col-span-2">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Street Address</label>
                                                                <input
                                                                    type="text"
                                                                    name="address"
                                                                    value={formData.address}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">City</label>
                                                                <input
                                                                    type="text"
                                                                    name="city"
                                                                    value={formData.city}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">State</label>
                                                                <input
                                                                    type="text"
                                                                    name="state"
                                                                    value={formData.state}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Country</label>
                                                                <input
                                                                    type="text"
                                                                    name="country"
                                                                    value={formData.country}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Zip Code</label>
                                                                <input
                                                                    type="text"
                                                                    name="zip_code"
                                                                    value={formData.zip_code}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Tab.Panel>

                                                {/* Tab 2: Corporate Information */}
                                                <Tab.Panel className="space-y-8 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300 pb-4">
                                                    <div className="flex flex-col md:flex-row gap-8">
                                                        {/* Logo Upload Section */}
                                                        <div className="flex flex-col items-center gap-4">
                                                            <div className="relative group">
                                                                <div className="w-32 h-32 rounded-3xl bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center transition-transform hover:-rotate-2">
                                                                    {logoPreview ? (
                                                                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <BuildingOfficeIcon className="w-16 h-16 text-slate-300" />
                                                                    )}
                                                                    {uploadingLogo && (
                                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                                                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <label className="absolute -bottom-2 -right-2 p-2.5 bg-primary-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-primary-700 transition-all hover:scale-110 active:scale-95 group-hover:shadow-primary-200 z-20">
                                                                    <CameraIcon className="w-5 h-5" />
                                                                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} />
                                                                </label>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Company Logo</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Company Name</label>
                                                                <input
                                                                    type="text"
                                                                    name="company_name"
                                                                    value={formData.company_name}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Job Title</label>
                                                                <input
                                                                    type="text"
                                                                    name="company_title"
                                                                    value={formData.company_title}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">LinkedIn URL</label>
                                                                <input
                                                                    type="url"
                                                                    name="company_linkedin"
                                                                    value={formData.company_linkedin}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Company Website</label>
                                                                <input
                                                                    type="url"
                                                                    name="company_website"
                                                                    value={formData.company_website}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Company Size</label>
                                                                <select
                                                                    name="company_size"
                                                                    value={formData.company_size}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all appearance-none"
                                                                >
                                                                    <option value="">Select Size</option>
                                                                    <option value="1-10">1-10</option>
                                                                    <option value="11-50">11-50</option>
                                                                    <option value="51-200">51-200</option>
                                                                    <option value="201-500">201-500</option>
                                                                    <option value="500+">500+</option>
                                                                </select>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Corporate Contact</label>
                                                                <input
                                                                    type="tel"
                                                                    name="company_contact"
                                                                    value={formData.company_contact}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="pt-6 border-t border-slate-100">
                                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Corporate Address</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                                            <div className="space-y-1.5 md:col-span-2">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Company Address</label>
                                                                <input
                                                                    type="text"
                                                                    name="company_address"
                                                                    value={formData.company_address}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">City</label>
                                                                <input
                                                                    type="text"
                                                                    name="company_city"
                                                                    value={formData.company_city}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">State</label>
                                                                <input
                                                                    type="text"
                                                                    name="company_state"
                                                                    value={formData.company_state}
                                                                    onChange={handleChange}
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Tab.Panel>

                                                {/* Tab 3: Membership Information */}
                                                <Tab.Panel className="space-y-8 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300 pb-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Member Category</label>
                                                            <select
                                                                name="category_id"
                                                                value={formData.category_id}
                                                                onChange={handleChange}
                                                                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all appearance-none"
                                                            >
                                                                <option value="">Select Category</option>
                                                                {categories.map((cat) => (
                                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Membership Plan</label>
                                                            <select
                                                                name="plan_id"
                                                                value={formData.plan_id}
                                                                onChange={handleChange}
                                                                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all appearance-none"
                                                            >
                                                                <option value="">Select Plan</option>
                                                                {plans.map((plan) => (
                                                                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Member Type</label>
                                                            <input
                                                                type="text"
                                                                name="member_type"
                                                                value={formData.member_type}
                                                                onChange={handleChange}
                                                                placeholder="e.g., Regular, Premium"
                                                                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Chapter Name</label>
                                                            <select
                                                                name="chapter"
                                                                value={formData.chapter}
                                                                onChange={handleChange}
                                                                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all appearance-none"
                                                            >
                                                                <option value="">Select Chapter</option>
                                                                {chapters.map((chap) => (
                                                                    <option key={chap.id} value={chap.name}>{chap.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Start Date</label>
                                                            <input
                                                                type="date"
                                                                name="membership_start_date"
                                                                value={formData.membership_start_date}
                                                                onChange={handleChange}
                                                                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Renewal Date</label>
                                                            <input
                                                                type="date"
                                                                name="membership_renewal_date"
                                                                value={formData.membership_renewal_date}
                                                                onChange={handleChange}
                                                                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Active Status</label>
                                                            <select
                                                                name="status"
                                                                value={formData.status}
                                                                onChange={handleChange}
                                                                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:ring-0 focus:border-primary-200 focus:bg-white transition-all appearance-none"
                                                            >
                                                                <option value="approved">Active</option>
                                                                <option value="inactive">Deactive</option>
                                                                <option value="pending">Pending</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </Tab.Panel>
                                            </Tab.Panels>
                                        </Tab.Group>

                                        {/* Footer Actions */}
                                        <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-all hover:bg-slate-100 rounded-xl"
                                            >
                                                Close
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="px-10 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                                            >
                                                {saving ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Saving...
                                                    </div>
                                                ) : 'Save'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default MemberEditForm;
