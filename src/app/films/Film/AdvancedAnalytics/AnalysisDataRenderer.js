import React from 'react';

/**
 * Renders analysis data that can be either a string or an object
 * @param {string|object} data - The data to render
 * @param {string} className - CSS class name for the container
 * @returns {JSX.Element} Rendered analysis data
 */
export const renderAnalysisData = (data, className = 'analysis-text') => {
    if (typeof data === 'string') {
        return <p className={className}>{data}</p>;
    }

    if (typeof data === 'object' && data !== null) {
        return (
            <div className={className}>
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="analysis-item">
                        <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong>
                        <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                    </div>
                ))}
            </div>
        );
    }

    return null;
};

export default renderAnalysisData;
