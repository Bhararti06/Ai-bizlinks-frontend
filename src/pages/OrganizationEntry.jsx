import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS_URL } from '../config/apiConfig';
import {
    UserGroupIcon,
    UserIcon,
    ShieldCheckIcon,
    ArrowRightIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const OrganizationEntry = () => {
    const navigate = useNavigate();
    const { subdomain } = useParams();
    const [searchParams] = useSearchParams();
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrganization();
    }, [subdomain]);

    const fetchOrganization = async () => {
        try {
            // Try to get org from subdomain param or query param
            const orgIdentifier = subdomain || searchParams.get('org');

            if (!orgIdentifier) {
                // Fallback: get first available organization
                const res = await api.get('/organizations');
                if (res.data.data && res.data.data.length > 0) {
                    setOrganization(res.data.data[0]);
                }
            } else {
                // Fetch specific organization by identifier
                const res = await api.get(`/organizations/public/${orgIdentifier}`);
                setOrganization(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch organization:', error);
        } finally {
            setLoading(false);
        }
    };

    const roleCards = [
        {
            title: 'Admin Login',
            description: 'Organization administrators',
            icon: ShieldCheckIcon,
            color: 'from-purple-500 to-purple-700',
            hoverColor: 'hover:from-purple-600 hover:to-purple-800',
            role: 'admin'
        },
        {
            title: 'Member Login',
            description: 'Community members',
            icon: UserIcon,
            color: 'from-primary-500 to-primary-700',
            hoverColor: 'hover:from-primary-600 hover:to-primary-800',
            role: 'member'
        },
        {
            title: 'Chapter Admin Login',
            description: 'Chapter administrators',
            icon: UserGroupIcon,
            color: 'from-emerald-500 to-emerald-700',
            hoverColor: 'hover:from-emerald-600 hover:to-emerald-800',
            role: 'chapter_admin'
        }
    ];

    const handleRoleSelect = (role) => {
        navigate(`/login?role=${role}${organization?.sub_domain ? `&org=${organization.sub_domain}` : ''}`);
    };

    const handleSignup = () => {
        navigate(`/register-user${organization?.sub_domain ? `?org=${organization.sub_domain}` : ''}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-bold">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-5xl"
            >
                {/* Organization Header */}
                <div className="text-center mb-12">
                    {organization?.logo && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="mb-6"
                        >
                            <img
                                src={`${ASSETS_URL}${organization.logo}`}
                                alt={organization.name}
                                className="h-24 w-24 mx-auto object-contain rounded-2xl shadow-lg"
                            />
                        </motion.div>
                    )}
                    {!organization?.logo && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="mb-6"
                        >
                            <div className="h-24 w-24 mx-auto bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg flex items-center justify-center">
                                <BuildingOfficeIcon className="h-12 w-12 text-white" />
                            </div>
                        </motion.div>
                    )}
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-4xl font-black text-slate-900 mb-3"
                    >
                        Welcome to {organization?.name || 'Community Portal'}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-slate-600 text-lg font-bold"
                    >
                        Select your role to continue
                    </motion.p>
                </div>

                {/* Role Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {roleCards.map((card, index) => (
                        <motion.button
                            key={card.role}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                            onClick={() => handleRoleSelect(card.role)}
                            className={`relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-left overflow-hidden`}
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                            {/* Icon */}
                            <div className={`relative mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg`}>
                                <card.icon className="h-8 w-8 text-white" />
                            </div>

                            {/* Content */}
                            <div className="relative">
                                <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                                    {card.title}
                                </h3>
                                <p className="text-slate-600 font-bold text-sm mb-4">
                                    {card.description}
                                </p>
                                <div className="flex items-center text-primary-600 font-black text-sm">
                                    Continue
                                    <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Signup Option */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="text-center"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-4 bg-white rounded-2xl shadow-lg">
                        <span className="text-slate-600 font-bold">New here?</span>
                        <button
                            onClick={handleSignup}
                            className="text-primary-600 font-black hover:text-primary-700 transition-colors flex items-center gap-1"
                        >
                            Sign Up
                            <ArrowRightIcon className="h-4 w-4" />
                        </button>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="text-center mt-12"
                >
                    <p className="text-slate-400 text-sm font-bold">
                        © 2026 {organization?.name || 'Community Portal'}. All rights reserved.
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default OrganizationEntry;
