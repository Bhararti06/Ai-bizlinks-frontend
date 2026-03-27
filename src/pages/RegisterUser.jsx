import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ASSETS_URL } from '../config/apiConfig';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout';
import { motion } from 'framer-motion';
import {
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    BriefcaseIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

const RegisterUser = () => {
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrganization, setSelectedOrganization] = useState(null);
    const [formData, setFormData] = useState({
        organizationName: 'BizLinks', // Default to BizLinks
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        yearsInBusiness: '',
    });
    const [loading, setLoading] = useState(false);
    const { registerUser } = useAuth();
    const navigate = useNavigate();
    const [isOrgLocked, setIsOrgLocked] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const orgParam = queryParams.get('org') || localStorage.getItem('orgContext');
        console.log('--- REGISTER USER ORG LOOKUP ---');
        console.log('Org identifier from URL/Local:', orgParam);

        const fetchOrgs = async () => {
            try {
                const res = await api.get('/organizations');
                setOrganizations(res.data.data);

                if (orgParam) {
                    const matchedOrg = res.data.data.find(o =>
                        o.sub_domain?.toLowerCase() === orgParam.toLowerCase() ||
                        o.name.toLowerCase().replace(/\s+/g, '-') === orgParam.toLowerCase()
                    );
                    if (matchedOrg) {
                        console.log('Matched Organization:', matchedOrg.name, 'SubDomain:', matchedOrg.sub_domain);
                        setFormData(prev => ({
                            ...prev,
                            organizationName: matchedOrg.name,
                            subDomain: matchedOrg.sub_domain
                        }));
                        setSelectedOrganization(matchedOrg);
                        setIsOrgLocked(true);
                        localStorage.setItem('orgContext', matchedOrg.sub_domain);
                    } else {
                        console.warn('No organization matched for identifier:', orgParam);
                    }
                } else if (res.data.data.length > 0) {
                    // Default logic
                    const bizLinks = res.data.data.find(o => o.name === 'BizLinks');
                    if (bizLinks) setFormData(prev => ({ ...prev, organizationName: 'BizLinks', subDomain: bizLinks.sub_domain }));
                    else setFormData(prev => ({ ...prev, organizationName: res.data.data[0].name, subDomain: res.data.data[0].sub_domain }));
                }
            } catch (err) {
                console.error("Failed to fetch organizations", err);
            }
        };
        fetchOrgs();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log('--- REGISTER SUBMISSION DEBUG ---');
            console.log('Organization Name:', formData.organizationName);
            console.log('SubDomain being passed:', formData.subDomain);
            console.log('User Email:', formData.email);

            // No password required during registration
            const submissionData = {
                ...formData,
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                subDomain: formData.subDomain || selectedOrganization?.sub_domain
            };

            console.log('Submission Data:', submissionData);

            await registerUser(submissionData);
            toast.success('Registration successful! You will receive an email once your account is approved.');
            setTimeout(() => {
                // Preserve organization context when redirecting to login
                const orgParam = formData.subDomain || selectedOrganization?.sub_domain;
                if (orgParam) {
                    navigate(`/login?org=${orgParam}`);
                } else {
                    navigate('/login');
                }
            }, 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Join Community">
            {/* Organization Branding */}
            {selectedOrganization && (
                <div className="mb-8 text-center">
                    {selectedOrganization.logo && (
                        <img
                            src={`${ASSETS_URL}${selectedOrganization.logo}`}
                            alt={selectedOrganization.name}
                            className="h-16 w-16 mx-auto object-contain mb-3 rounded-xl"
                        />
                    )}
                    <h2 className="text-xl font-black text-slate-900">{selectedOrganization.name}</h2>
                </div>
            )}

            <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
                onSubmit={handleSubmit}
            >
                {/* Row 1: First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label htmlFor="firstName" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            <UserIcon className="w-3.5 h-3.5" />
                            First Name
                        </label>
                        <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            placeholder="John"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300"
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="lastName" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            <UserIcon className="w-3.5 h-3.5" />
                            Last Name
                        </label>
                        <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            placeholder="Doe"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300"
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Row 2: Email Id */}
                <div className="space-y-1.5">
                    <label htmlFor="email" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        <EnvelopeIcon className="w-3.5 h-3.5" />
                        Email Address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                {/* Row 3: Contact Number & Years In Business */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label htmlFor="contactNumber" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            <PhoneIcon className="w-3.5 h-3.5" />
                            Contact Number
                        </label>
                        <input
                            id="contactNumber"
                            name="contactNumber"
                            type="tel"
                            placeholder="+91 XXXXX XXXXX"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300"
                            value={formData.contactNumber}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="yearsInBusiness" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            <BriefcaseIcon className="w-3.5 h-3.5" />
                            Years in Business
                        </label>
                        <input
                            id="yearsInBusiness"
                            name="yearsInBusiness"
                            type="number"
                            min="0"
                            placeholder="e.g. 5"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all placeholder:text-slate-300"
                            value={formData.yearsInBusiness}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Organization Display (If locked) */}
                {isOrgLocked && (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Joining Organization</p>
                            <p className="text-sm font-bold text-slate-900">{formData.organizationName}</p>
                        </div>
                        <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-emerald-500 text-lg">✓</span>
                        </div>
                    </div>
                )}

                {/* Row 4: Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="flex-1 px-4 py-4 border border-slate-200 text-slate-600 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] px-4 py-4 bg-primary-600 text-white rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                Complete Registration
                                <ArrowRightIcon className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </motion.form>
        </AuthLayout>
    );
};

export default RegisterUser;

