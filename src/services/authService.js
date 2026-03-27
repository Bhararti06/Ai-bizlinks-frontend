import api from './api';

const registerOrganization = async (data) => {
    const response = await api.post('/auth/register-organization', data);
    return response.data;
};

const registerUser = async (data) => {
    const response = await api.post('/auth/register-user', data);
    return response.data;
};

const login = async (email, password, org) => {
    const response = await api.post('/auth/login', { email, password, org });
    if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        // Store organization context
        const user = response.data.data.user;
        const orgContext = org || user.subDomain || user.organizationName;
        if (orgContext) {
            localStorage.setItem('orgContext', orgContext);
        }
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeRole');
};

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const updateProfile = (data) => {
    return api.put('/users/profile', data, { headers: getAuthHeader() });
};

const changePassword = (data) => {
    return api.put('/users/change-password', data, { headers: getAuthHeader() });
};

const uploadProfileImage = (formData) => {
    return api.post('/users/profile-image', formData, {
        headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
        }
    });
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const getOrgContext = () => {
    return localStorage.getItem('orgContext');
};

const authService = {
    registerOrganization,
    registerUser,
    login,
    logout,
    updateProfile,
    changePassword,
    uploadProfileImage,
    getCurrentUser,
    getOrgContext,
};

export default authService;
