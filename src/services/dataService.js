import api from './api';

const dataService = {
    // Posts
    getPosts: () => api.get('/posts'),
    getMyPosts: () => api.get('/posts/me'),
    createPost: (postData) => api.post('/posts', postData),
    updatePost: (id, postData) => api.put(`/posts/${id}`, postData),
    deletePost: (id) => api.delete(`/posts/${id}`),

    // Comments
    getComments: (postId) => api.get(`/posts/${postId}/comments`),
    addComment: (postId, content) => api.post(`/posts/${postId}/comments`, { comment: content }),
    deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),

    // Likes
    toggleLike: (postId) => api.post(`/posts/${postId}/like`),
    toggleCommentLike: (commentId, data = {}) => api.post(`/posts/comments/${commentId}/like`, data),

    // Meetings
    getMeetings: () => api.get('/meetings'),
    createMeeting: (meetingData) => api.post('/meetings', meetingData),
    getChapterMeetings: () => api.get('/chapter-meetings'),
    createChapterMeeting: (data) => api.post('/chapter-meetings', data),
    updateChapterMeeting: (id, data) => api.put(`/chapter-meetings/${id}`, data),
    registerChapterMeeting: (id) => api.post(`/chapter-meetings/${id}/register`),
    getChapterMeetingRegistrations: (id) => api.get(`/chapter-meetings/${id}/registrations`),
    addVisitorToChapterMeeting: (id, visitorData) => api.post(`/chapter-meetings/${id}/visitors`, visitorData),
    updateMeeting: (id, meetingData) => api.put(`/meetings/${id}`, meetingData),
    deleteMeeting: (id) => api.delete(`/meetings/${id}`),
    rsvpMeeting: (id, status) => api.post(`/meetings/${id}/rsvp`, { status }),
    getMeetingRSVPs: (id) => api.get(`/meetings/${id}/rsvps`),

    // Notifications
    getNotifications: () => api.get('/notifications'),
    markNotificationAsRead: (id) => api.put(`/notifications/${id}/read`),

    // References / Referrals
    getReferences: () => api.get('/references'),
    getReceivedReferrals: () => api.get('/references/received'),
    getSentReferrals: () => api.get('/references/sent'),
    createReference: (data) => api.post('/references', data),
    updateReference: (id, data) => api.put(`/references/${id}`, data),
    deleteReference: (id) => api.delete(`/references/${id}`),
    getReferralComments: (id) => api.get(`/references/${id}/comments`),
    addReferralComment: (id, comment) => api.post(`/references/${id}/comments`, { comment }),
    getThankYouNotes: () => api.get('/references/thank-you'),
    getRevenue: () => api.get('/references/revenue'),

    // Events
    getEvents: () => api.get('/events'),
    getPublicEvent: (id) => api.get(`/events/${id}/public`),
    createEvent: (data) => api.post('/events', data),
    deleteEvent: (id) => api.delete(`/events/${id}`),
    registerForEvent: (id) => api.post(`/events/${id}/register`),
    getEventRegistrants: (id) => api.get(`/events/${id}/registrants`),
    uploadEventImage: (formData) => api.post('/events/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    confirmEventPayment: (id) => api.put(`/events/${id}/confirm-payment`),
    getEventPaymentStatus: (id) => api.get(`/events/${id}/payment-status`),
    registerExternalForEvent: (id, data) => api.post(`/events/${id}/register-external`, data),

    // Trainings
    getTrainings: () => api.get('/trainings'),
    getPublicTraining: (id) => api.get(`/trainings/${id}/public`),
    createTraining: (data) => api.post('/trainings', data),
    registerForTraining: (id) => api.post(`/trainings/${id}/register`),
    getTrainingRegistrants: (id) => api.get(`/trainings/${id}/registrants`),
    deleteTraining: (id) => api.delete(`/trainings/${id}`),
    confirmTrainingPayment: (id) => api.put(`/trainings/${id}/confirm-payment`),
    getTrainingPaymentStatus: (id) => api.get(`/trainings/${id}/payment-status`),
    registerExternalForTraining: (id, data) => api.post(`/trainings/${id}/register-external`, data),

    // Users
    getPendingUsers: () => api.get('/users/pending'),
    approveUser: (id) => api.put(`/users/${id}/approve`),
    rejectUser: (id) => api.put(`/users/${id}/reject`),
    updateUserRole: (id, data) => api.put(`/users/${id}/role`, data),
    getApprovedUsers: () => api.get('/users/approved'),
    getUsers: (params) => api.get('/users', { params }),

    // Organizations
    getOrganizations: () => api.get('/organizations'),
    getOrgSettings: (id) => api.get(id ? `/organizations/settings?id=${id}` : '/organizations/settings'),
    updateOrgSettings: (data) => api.put('/organizations/settings', data),
    updateOrgAdmin: (id, data) => api.put(`/users/org-admin/${id}`, data),
    getAdminDashboardStats: () => api.get('/organizations/dashboard/stats'),
    exportAdminReport: () => api.get('/organizations/dashboard/export', { responseType: 'blob' }),
    getVisitors: () => api.get('/organizations/dashboard/visitors'),

    // Admin Member Management
    getDeactivatedUsers: () => api.get('/users/deactivated'),
    getDeletedUsers: () => api.get('/users/deleted'),
    adminUpdateUser: (id, data) => api.put(`/users/${id}/update`, data),
    deactivateUser: (id, data) => api.put(`/users/${id}/deactivate`, data),
    activateUser: (id) => api.put(`/users/${id}/activate`),
    deleteUser: (id) => api.delete(`/users/${id}`),

    // Deactivation Requests
    getPendingDeactivationRequests: () => api.get('/deactivation-requests/pending'),
    getAllDeactivationRequests: (status) => api.get('/deactivation-requests', { params: { status } }),
    approveDeactivationRequest: (id) => api.put(`/deactivation-requests/${id}/approve`),
    rejectDeactivationRequest: (id) => api.put(`/deactivation-requests/${id}/reject`),
    getDeactivationRequestCount: () => api.get('/deactivation-requests/count'),

    // Admin Member View Actions
    getMemberDetails: (id) => api.get(`/users/${id}/details`),
    adminSendReferral: (id, data) => api.post(`/users/${id}/referral`, data),
    adminScheduleMeeting: (id, data) => api.post(`/users/${id}/meeting`, data),

    // Comprehensive Member Management (Admin)
    getFullMemberProfile: (id) => api.get(`/users/${id}/full-profile`),
    getMemberPosts: (id) => api.get(`/users/${id}/posts`),
    getMemberFiles: (id) => api.get(`/users/${id}/files`),
    getMemberReferrals: (id) => api.get(`/users/${id}/referrals`),
    getMemberMeetings: (id) => api.get(`/users/${id}/meetings`),
    adminUpdateMemberFull: (id, data) => api.put(`/users/${id}/admin-update`, data),
    adminUploadMemberPhoto: (id, formData) => api.post(`/users/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    uploadCompanyLogo: (id, formData) => api.post(`/users/${id}/company-logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getRenewMembers: () => api.get('/users/renew-members'),

    // Files
    getFiles: () => api.get('/files'),
    uploadFile: (formData) => api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteFile: (id) => api.delete(`/files/${id}`),
    getChapters: () => api.get('/chapters'),
    getMasterCategories: () => api.get('/master/categories'),
    getMasterPlans: () => api.get('/master/plans'),
};

export default dataService;
