import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { BuildingOfficeIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, icon: Icon, onClick }) => (
    <div 
        onClick={onClick}
        className={`bg-white p-6 rounded-lg border border-gray-200 transition-shadow ${onClick ? 'cursor-pointer hover:bg-gray-50 hover:shadow-md' : 'hover:shadow-md'}`}
    >
        <div className="flex flex-col items-center text-center">
            <p className="text-sm text-gray-500 mb-2">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalOrganizations: 0, totalMembers: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/super-admin/dashboard-stats');
                if (res.data.success) {
                    setStats(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-64 text-gray-500">Loading...</div>;
    }

    return (
        <div className="max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                    title="Total Organizations"
                    value={stats.totalOrganizations}
                    icon={BuildingOfficeIcon}
                    onClick={() => navigate('/super-admin/organizations')}
                />
                <StatCard
                    title="Organization Members"
                    value={stats.totalMembers}
                    icon={UserGroupIcon}
                />
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
