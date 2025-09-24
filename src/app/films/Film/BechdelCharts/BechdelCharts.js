import React from 'react';
import PropTypes from 'prop-types';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import './BechdelCharts.scss';

const BechdelCharts = ({ bechdelResults }) => {
    const {
        numOfFemalesChars,
        numOfMaleChars,
        numOfFemalesCharsWithDialogue,
        numOfMaleCharsWithDialogue,
        totalLinesFemaleDialogue,
        totalLinesMaleDialogue,
        numScenesPass,
        numScenesDontPass,
        bechdelScore,
        pass,
    } = bechdelResults;

    // Character distribution data
    const characterData = [
        { name: 'Female', value: numOfFemalesChars, color: '#ff6b9d' },
        { name: 'Male', value: numOfMaleChars, color: '#4ecdc4' },
    ];

    // Dialogue data
    const dialogueData = [
        { name: 'Female', lines: totalLinesFemaleDialogue, color: '#ff6b9d' },
        { name: 'Male', lines: totalLinesMaleDialogue, color: '#4ecdc4' },
    ];

    // Scene analysis data
    const sceneData = [
        { name: 'Pass', count: numScenesPass, color: '#2ecc71' },
        { name: "Don't Pass", count: numScenesDontPass, color: '#e74c3c' },
    ];

    // Characters with dialogue data
    const charactersWithDialogueData = [
        { name: 'Female', count: numOfFemalesCharsWithDialogue, color: '#ff6b9d' },
        { name: 'Male', count: numOfMaleCharsWithDialogue, color: '#4ecdc4' },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{`${label}: ${payload[0].value} characters`}</p>
                </div>
            );
        }
        return null;
    };

    const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <g>
                <text
                    x={x}
                    y={y - 8}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="14"
                    fontWeight="bold"
                    stroke="black"
                    strokeWidth="0.5"
                >
                    {name}
                </text>
                <text
                    x={x}
                    y={y + 8}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fontWeight="bold"
                    stroke="black"
                    strokeWidth="0.5"
                >
                    {value}
                </text>
            </g>
        );
    };

    return (
        <div className="bechdel-charts">
            <div className="charts-grid">
                {/* Bechdel Score Progress */}
                <div className="chart-card score-card">
                    <h3>Bechdel Score</h3>
                    <div className="score-progress">
                        <div className={`score-circle ${pass ? 'passed' : 'failed'}`}>
                            <div className="score-number">{bechdelScore}</div>
                            <div className="score-total">/ 3</div>
                        </div>
                        <div className="score-bars">
                            {[1, 2, 3].map((level) => (
                                <div
                                    key={level}
                                    className={`score-bar ${level <= bechdelScore ? 'passed' : 'not-passed'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="score-description">
                        {bechdelScore === 0 && 'No female characters'}
                        {bechdelScore === 1 && 'Female characters present'}
                        {bechdelScore === 2 && 'Female characters talk to each other'}
                        {bechdelScore === 3 && 'Female characters talk about something other than men'}
                    </p>
                </div>

                {/* Character Distribution */}
                <div className="chart-card">
                    <h3>Character Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={characterData}
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                                label={<CustomLabel />}
                            >
                                {characterData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Dialogue Lines Comparison */}
                <div className="chart-card">
                    <h3>Dialogue Lines</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={dialogueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="lines" fill="#8884d8">
                                {dialogueData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Scene Analysis */}
                <div className="chart-card">
                    <h3>Scene Analysis</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={sceneData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8">
                                {sceneData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Characters with Dialogue */}
                <div className="chart-card">
                    <h3>Characters with Dialogue</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={charactersWithDialogueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8">
                                {charactersWithDialogueData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Summary Stats */}
                <div className="chart-card stats-card">
                    <h3>Quick Stats</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-number">{numOfFemalesChars + numOfMaleChars}</div>
                            <div className="stat-label">Total Characters</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">{totalLinesFemaleDialogue + totalLinesMaleDialogue}</div>
                            <div className="stat-label">Total Dialogue Lines</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">{numScenesPass + numScenesDontPass}</div>
                            <div className="stat-label">Total Scenes</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">
                                {numScenesPass + numScenesDontPass > 0
                                    ? `${Math.round((numScenesPass / (numScenesPass + numScenesDontPass)) * 100)}%`
                                    : '0%'
                                }
                            </div>
                            <div className="stat-label">Scenes Pass Rate</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

BechdelCharts.propTypes = {
    bechdelResults: PropTypes.shape({
        numOfFemalesChars: PropTypes.number,
        numOfMaleChars: PropTypes.number,
        numOfFemalesCharsWithDialogue: PropTypes.number,
        numOfMaleCharsWithDialogue: PropTypes.number,
        totalLinesFemaleDialogue: PropTypes.number,
        totalLinesMaleDialogue: PropTypes.number,
        numScenesPass: PropTypes.number,
        numScenesDontPass: PropTypes.number,
        bechdelScore: PropTypes.number,
    }).isRequired,
};

export default BechdelCharts;
