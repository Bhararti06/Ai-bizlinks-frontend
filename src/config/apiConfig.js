const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const ASSETS_BASE_URL = process.env.REACT_APP_ASSETS_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REGISTER_ORG: `${API_BASE_URL}/auth/register-organization`,
        REGISTER_USER: `${API_BASE_URL}/auth/register-user`,
    },
    ORGANIZATIONS: `${API_BASE_URL}/organizations`,
    USERS: `${API_BASE_URL}/users`,
    POSTS: `${API_BASE_URL}/posts`,
    MEMBERS: `${API_BASE_URL}/users/approved`,
    NOTIFICATIONS: `${API_BASE_URL}/notifications`,
    REFERRALS: `${API_BASE_URL}/references`,
    EVENTS: `${API_BASE_URL}/events`,
    TRAININGS: `${API_BASE_URL}/trainings`,
    MEETINGS: `${API_BASE_URL}/meetings`,
    FILES: `${API_BASE_URL}/files`,
    CHAPTERS: `${API_BASE_URL}/chapters`,
    PUSH: `${API_BASE_URL}/push`,
    MASTER: {
        CATEGORIES: `${API_BASE_URL}/master/categories`,
        PLANS: `${API_BASE_URL}/master/plans`,
    }
};

export const ASSETS_URL = ASSETS_BASE_URL;
export default API_ENDPOINTS;
