import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import './ScriptTimeline.scss';

const ScriptTimeline = ({ bechdelResults, characters }) => {
    const [selectedSceneIndex, setSelectedSceneIndex] = useState(null);
    const [expandedScenes, setExpandedScenes] = useState(new Set());

    const { scenesThatPass, numScenesPass, numScenesDontPass } = bechdelResults;

    // Process scenes to create timeline data
    const timelineData = useMemo(() => {
        if (!scenesThatPass || scenesThatPass.length === 0) {
            return [];
        }

        return scenesThatPass.map((scene, index) => {
            // Extract scene header (first few lines)
            const lines = scene.split('\n').filter(line => line.trim());
            const sceneHeader = lines.slice(0, 3).join(' ');

            // Extract dialogue lines
            const dialogueLines = lines.filter(line => {
                const trimmed = line.trim();
                return trimmed &&
                    !trimmed.startsWith('INT.') &&
                    !trimmed.startsWith('EXT.') &&
                    !trimmed.startsWith('EXTERIOR') &&
                    !trimmed.startsWith('INTERIOR') &&
                    !trimmed.startsWith('I/E') &&
                    !trimmed.startsWith('INT/EXT');
            });

            // Identify female characters speaking
            const femaleSpeakers = dialogueLines
                .map(line => {
                    const speaker = line.split(':')[0]?.trim();
                    if (speaker && characters) {
                        const character = characters.find(char =>
                            char.cleanCharName === speaker.toUpperCase()
                        );
                        return character?.gender === 1 ? speaker : null;
                    }
                    return null;
                })
                .filter(Boolean);

            return {
                index,
                scene,
                sceneHeader,
                dialogueLines: dialogueLines.slice(0, 10), // Limit to first 10 lines
                femaleSpeakers: [...new Set(femaleSpeakers)], // Remove duplicates
                sceneNumber: index + 1,
                totalScenes: scenesThatPass.length
            };
        });
    }, [scenesThatPass, characters]);

    const toggleSceneExpansion = (index) => {
        const newExpanded = new Set(expandedScenes);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedScenes(newExpanded);
    };

    const formatSceneExcerpt = (lines) => {
        return lines.map((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) return null;

            // Check if this is a character name (usually in caps)
            const isCharacterName = trimmed === trimmed.toUpperCase() &&
                trimmed.length < 30 &&
                !trimmed.includes('.') &&
                !trimmed.includes('(') &&
                !trimmed.includes(')');

            return (
                <div key={idx} className={`dialogue-line ${isCharacterName ? 'character-name' : 'dialogue-text'}`}>
                    {trimmed}
                </div>
            );
        }).filter(Boolean);
    };

    if (!timelineData || timelineData.length === 0) {
        return (
            <div className="script-timeline">
                <div className="timeline-header">
                    <h3>📜 Script Timeline</h3>
                    <p>No Bechdel-passing scenes found in this film.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="script-timeline">
            <div className="timeline-header">
                <h3>
                    <span className="timeline-icon">📜</span>
                    Script Timeline
                </h3>
                <div className="timeline-stats">
                    <span className="stat-item">
                        <span className="stat-number">{numScenesPass}</span>
                        <span className="stat-label">Scenes Pass</span>
                    </span>
                    <span className="stat-item">
                        <span className="stat-number">{numScenesDontPass}</span>
                        <span className="stat-label">Scenes Don't Pass</span>
                    </span>
                    <span className="stat-item">
                        <span className="stat-number">
                            {numScenesPass + numScenesDontPass > 0
                                ? `${Math.round((numScenesPass / (numScenesPass + numScenesDontPass)) * 100)}%`
                                : '0%'
                            }
                        </span>
                        <span className="stat-label">Pass Rate</span>
                    </span>
                </div>
            </div>

            <div className="timeline-content">
                <div className="timeline-track">
                    {timelineData.map((sceneData, index) => (
                        <div
                            key={index}
                            className={`timeline-item ${expandedScenes.has(index) ? 'expanded' : ''}`}
                        >
                            <div className="timeline-marker">
                                <div className="marker-dot"></div>
                                <div className="marker-line"></div>
                            </div>

                            <div className="timeline-card">
                                <div
                                    className="scene-header"
                                    onClick={() => toggleSceneExpansion(index)}
                                >
                                    <div className="scene-info">
                                        <div className="scene-number">Scene {sceneData.sceneNumber}</div>
                                        <div className="scene-title">{sceneData.sceneHeader}</div>
                                        {sceneData.femaleSpeakers.length > 0 && (
                                            <div className="female-speakers">
                                                <span className="speakers-label">Female speakers:</span>
                                                <span className="speakers-list">
                                                    {sceneData.femaleSpeakers.join(', ')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="expand-indicator">
                                        {expandedScenes.has(index) ? '−' : '+'}
                                    </div>
                                </div>

                                {expandedScenes.has(index) && (
                                    <div className="scene-excerpt">
                                        <div className="excerpt-header">
                                            <span className="excerpt-icon">💬</span>
                                            Scene Excerpt
                                        </div>
                                        <div className="excerpt-content">
                                            {formatSceneExcerpt(sceneData.dialogueLines)}
                                        </div>
                                        <div className="excerpt-footer">
                                            <span className="excerpt-note">
                                                Showing first {sceneData.dialogueLines.length} lines of dialogue
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="timeline-footer">
                <div className="timeline-legend">
                    <div className="legend-item">
                        <div className="legend-dot pass"></div>
                        <span>Bechdel-passing scene</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-dot fail"></div>
                        <span>Scene that doesn't pass</span>
                    </div>
                </div>
                <div className="timeline-actions">
                    <button
                        className="expand-all-btn"
                        onClick={() => {
                            if (expandedScenes.size === timelineData.length) {
                                setExpandedScenes(new Set());
                            } else {
                                setExpandedScenes(new Set(timelineData.map((_, index) => index)));
                            }
                        }}
                    >
                        {expandedScenes.size === timelineData.length ? 'Collapse All' : 'Expand All'}
                    </button>
                </div>
            </div>
        </div>
    );
};

ScriptTimeline.propTypes = {
    bechdelResults: PropTypes.shape({
        scenesThatPass: PropTypes.arrayOf(PropTypes.string),
        numScenesPass: PropTypes.number,
        numScenesDontPass: PropTypes.number,
    }).isRequired,
    characters: PropTypes.arrayOf(PropTypes.shape({
        cleanCharName: PropTypes.string,
        gender: PropTypes.number,
        name: PropTypes.string,
        character: PropTypes.string,
    })),
};

export default ScriptTimeline;
