import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const defaultImages = [
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', // Meeting
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', // Office
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'  // Collaboration
];

const ImageSlider = ({ customImages = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const displayImages = customImages && customImages.length > 0
        ? customImages.map(img => img.url)
        : defaultImages;

    const displayDescriptions = customImages && customImages.length > 0
        ? customImages.map(img => img.description)
        : [
            "Network with professionals globally",
            "Modern workspace for your team",
            "Collaborate and grow together"
        ];

    useEffect(() => {
        if (displayImages.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % displayImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [displayImages]);

    return (
        <div className="relative w-full h-[400px] overflow-hidden rounded-xl shadow-2xl bg-white/10 backdrop-blur-md">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    <img
                        src={displayImages[currentIndex]}
                        className="w-full h-full object-cover"
                        alt="Gallery"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8">
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-white text-xl font-bold text-center"
                        >
                            {displayDescriptions[currentIndex]}
                        </motion.p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {displayImages.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {displayImages.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageSlider;
