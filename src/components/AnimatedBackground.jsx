import React from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
    return (
        <div className="animated-gradient-bg">
            <div className="blob-container">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
            </div>
        </div>
    );
};

export default AnimatedBackground;
