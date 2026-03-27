import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            console.log('DEBUG AUTH: token found in localStorage:', token ? 'YES' : 'NO');
            if (token) {
                try {
                    // Check if token is expired
                    const decoded = jwtDecode(token);
                    console.log('DEBUG AUTH: decoded token:', decoded);
                    const currentTime = Date.now() / 1000;

                    if (decoded.exp < currentTime) {
                        console.log('DEBUG AUTH: token expired');
                        authService.logout();
                        setUser(null);
                    } else {
                        // Set basic info from localStorage first for immediate UI
                        const savedUser = authService.getCurrentUser();
                        console.log('DEBUG AUTH: savedUser:', savedUser);
                        if (savedUser) setUser(savedUser);

                        // Then fetch fresh data from API
                        try {
                            const response = await api.get('/users/profile');
                            console.log('DEBUG AUTH: profile response:', response.data);
                            if (response.data.success) {
                                const freshUser = response.data.data;
                                setUser(freshUser);
                                localStorage.setItem('user', JSON.stringify(freshUser));
                            }
                        } catch (apiError) {
                            console.error('Failed to fetch fresh user data on init:', apiError);
                        }
                    }
                } catch (error) {
                    console.error('Auth initialization error:', error);
                    authService.logout();
                    setUser(null);
                }
            }
            setLoading(false);
            console.log('DEBUG AUTH: loading set to false');
        };

        initAuth();
    }, []);

    const login = async (email, password, org) => {
        // Super Admin should not have an org context
        const isSuperAdmin = email.toLowerCase() === 'superadmin@bizlinks.in';
        const orgContext = isSuperAdmin ? null : (org || localStorage.getItem('orgContext'));

        const response = await authService.login(email, password, orgContext);
        setUser(response.data.user);
        return response;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const registerOrganization = async (data) => {
        return await authService.registerOrganization(data);
    };

    const registerUser = async (data) => {
        return await authService.registerUser(data);
    };

    const updateUser = (data) => {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Update organization context if organization info changed
        if (data.organizationName || data.subDomain) {
            const orgContext = data.subDomain || data.organizationName || updatedUser.subDomain || updatedUser.organizationName;
            if (orgContext) {
                localStorage.setItem('orgContext', orgContext);
            }
        }
    };

    const refreshUser = async () => {
        try {
            const api = require('../services/api').default;
            const response = await api.get('/users/profile');
            if (response.data.success) {
                const freshUser = response.data.data;
                setUser(freshUser);
                localStorage.setItem('user', JSON.stringify(freshUser));
                return freshUser;
            }
        } catch (error) {
            console.error('Failed to refresh user data:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, registerOrganization, registerUser, updateUser, refreshUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
