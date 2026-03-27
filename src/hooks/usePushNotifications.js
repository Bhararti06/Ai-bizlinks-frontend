import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config/apiConfig';

// Make sure to add this utility function
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const usePushNotifications = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState(Notification.permission);

    const subscribeToPush = useCallback(async (token) => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.log('Push notifications are not supported by the browser.');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;

            // Allow user to grant permission
            const permission = await Notification.requestPermission();
            setPermissionStatus(permission);

            if (permission !== 'granted') {
                console.log('Push notification permission denied.');
                if (permission === 'denied') {
                    toast.info('Notifications are blocked by your browser. Please enable them in your browser settings to receive updates.', {
                        toastId: 'push-denied',
                        autoClose: 10000
                    });
                }
                return;
            }

            // Get VAPID public key from backend
            const vapidResponse = await axios.get(`${API_ENDPOINTS.PUSH || `${process.env.REACT_APP_API_URL}/push`}/vapidPublicKey`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const vapidPublicKey = vapidResponse.data.publicKey;

            if (!vapidPublicKey) {
                console.error('No VAPID public key returned from backend.');
                return;
            }

            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            // Send subscription to backend
            await axios.post(
                `${API_ENDPOINTS.PUSH || `${process.env.REACT_APP_API_URL}/push`}/subscribe`,
                subscription,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setIsSubscribed(true);
            console.log('Successfully subscribed to push notifications.');

        } catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
        }
    }, []);

    return { subscribeToPush, isSubscribed, permissionStatus };
};

export default usePushNotifications;
