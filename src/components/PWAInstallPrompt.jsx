import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Cleanup
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        setShowPrompt(false);
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, discard it
        setDeferredPrompt(null);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
            <div className="bg-white rounded-lg shadow-2xl p-4 border border-blue-100 flex items-start gap-4 max-w-sm">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Download className="w-6 h-6" />
                </div>

                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Install BizLink App</h3>
                    <p className="text-sm text-gray-500 mb-3">Install on your device for quick access and real-time push notifications.</p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleInstallClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                        >
                            Install
                        </button>
                        <button
                            onClick={() => setShowPrompt(false)}
                            className="text-gray-500 hover:text-gray-700 px-4 py-1.5 rounded text-sm font-medium transition-colors"
                        >
                            Not now
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => setShowPrompt(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default PWAInstallPrompt;
