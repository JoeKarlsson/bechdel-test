import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './LoadingAnimation.scss';

const LoadingAnimation = ({ isVisible = true, status = null, processId = null }) => {
    const [currentJoke, setCurrentJoke] = useState(0);
    const [dots, setDots] = useState('');

    const jokes = [
        {
            title: "🎬 Analyzing Script...",
            message: "Counting female characters who actually talk to each other...",
            subtext: "Spoiler: It's harder than finding a needle in a haystack"
        },
        {
            title: "🔍 Processing Dialogue...",
            message: "Checking if women discuss something other than men...",
            subtext: "Plot twist: They're talking about shoes AND world domination"
        },
        {
            title: "📊 Running Bechdel Test...",
            message: "Asking the important questions: Do women exist? Do they talk?",
            subtext: "Results may vary based on decade and genre"
        },
        {
            title: "🎭 Character Analysis...",
            message: "Identifying strong female characters...",
            subtext: "Found: 1 token woman, 47 male heroes, and a talking car"
        },
        {
            title: "🎪 Scene Extraction...",
            message: "Looking for scenes that pass the Bechdel test...",
            subtext: "Current count: 0. But hey, at least the explosions are gender-neutral!"
        },
        {
            title: "🎨 Fetching Movie Data...",
            message: "Getting poster, cast, and plot from the internet...",
            subtext: "Fun fact: This movie has more male characters than a frat house"
        },
        {
            title: "💾 Saving Results...",
            message: "Storing your Bechdel test results in the database...",
            subtext: "Don't worry, we won't judge... much"
        }
    ];

    useEffect(() => {
        if (!isVisible) return;

        // Always rotate jokes, but slower when we have real-time status
        const interval = status ? 4000 : 3000; // Slower rotation when status is available
        const jokeInterval = setInterval(() => {
            setCurrentJoke((prev) => (prev + 1) % jokes.length);
        }, interval);

        return () => clearInterval(jokeInterval);
    }, [isVisible, status]);

    useEffect(() => {
        if (!isVisible) return;

        // Animate dots every 500ms
        const dotsInterval = setInterval(() => {
            setDots((prev) => {
                if (prev === '...') return '';
                return prev + '.';
            });
        }, 500);

        return () => clearInterval(dotsInterval);
    }, [isVisible]);

    // Debug logging - only log when status changes
    useEffect(() => {
        if (status) {
            console.log('LoadingAnimation status changed:', status);
        }
    }, [status]);

    if (!isVisible) return null;

    // Always show jokes, but overlay progress information when available
    const displayData = jokes[currentJoke];
    const progress = status ? status.progress : 0;
    const progressMessage = status ? `${status.stage.replace(/_/g, ' ').toUpperCase()}: ${status.progress}%` : null;

    return (
        <div className="loading-animation" data-testid="loading-animation">
            <div className="loading-animation__container">
                <div className="loading-animation__spinner">
                    <div className="film-reel">
                        <div className="reel-hole"></div>
                        <div className="reel-hole"></div>
                        <div className="reel-hole"></div>
                        <div className="reel-hole"></div>
                    </div>
                </div>

                <div className="loading-animation__content">
                    <h3 className="loading-animation__title">
                        {displayData.title}
                    </h3>
                    <p className="loading-animation__message">
                        {displayData.message}{!status ? dots : ''}
                    </p>
                    <p className="loading-animation__subtext">
                        {displayData.subtext}
                    </p>
                    {progressMessage && (
                        <p className="loading-animation__progress-text">
                            {progressMessage}
                        </p>
                    )}
                </div>

                <div className="loading-animation__progress">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="loading-animation__tip">
                        💡 <strong>Pro tip:</strong> The Bechdel Test isn't about quality, just representation!
                    </p>
                </div>
            </div>
        </div>
    );
};

LoadingAnimation.propTypes = {
    isVisible: PropTypes.bool,
    status: PropTypes.shape({
        stage: PropTypes.string,
        progress: PropTypes.number,
        message: PropTypes.string
    }),
    processId: PropTypes.string
};

export default LoadingAnimation;
