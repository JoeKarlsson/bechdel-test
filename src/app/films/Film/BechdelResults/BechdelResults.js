import React from 'react';
import PropTypes from 'prop-types';

const BechdelResults = ({
	bechdelResults = {
		bechdelScore: 0,
		numScenesPass: 0,
		numScenesDontPass: 0,
		numOfFemalesChars: 0,
		numOfMaleChars: 0,
		numOfFemalesCharsWithDialogue: 0,
		numOfMaleCharsWithDialogue: 0,
		totalLinesFemaleDialogue: 0,
		totalLinesMaleDialogue: 0,
	}
}) => {

	const {
		bechdelScore,
		numScenesPass,
		numScenesDontPass,
		numOfFemalesChars,
		numOfMaleChars,
		numOfFemalesCharsWithDialogue,
		numOfMaleCharsWithDialogue,
		totalLinesFemaleDialogue,
		totalLinesMaleDialogue,
	} = bechdelResults;

	// Calculate additional metrics
	const totalScenes = numScenesPass + numScenesDontPass;
	const totalDialogueLines = totalLinesFemaleDialogue + totalLinesMaleDialogue;
	const scenePassRate = totalScenes > 0 ? Math.round((numScenesPass / totalScenes) * 100) : 0;
	const femaleDialoguePercentage = totalDialogueLines > 0 ? Math.round((totalLinesFemaleDialogue / totalDialogueLines) * 100) : 0;
	const avgLinesPerFemaleChar = numOfFemalesCharsWithDialogue > 0 ? Math.round(totalLinesFemaleDialogue / numOfFemalesCharsWithDialogue) : 0;
	const avgLinesPerMaleChar = numOfMaleCharsWithDialogue > 0 ? Math.round(totalLinesMaleDialogue / numOfMaleCharsWithDialogue) : 0;

	return (
		<div className="BechdelResults">
			<table className="bechdel-results-table">
				<thead>
					<tr>
						<th>Metric</th>
						<th>Value</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td className="metric-name">Bechdel Score</td>
						<td className="metric-value">{bechdelScore} of 3</td>
					</tr>
					<tr>
						<td className="metric-name">Total Scenes</td>
						<td className="metric-value">{totalScenes}</td>
					</tr>
					<tr>
						<td className="metric-name">Scenes that Pass</td>
						<td className="metric-value">{numScenesPass}</td>
					</tr>
					<tr>
						<td className="metric-name">Scenes that Don't Pass</td>
						<td className="metric-value">{numScenesDontPass}</td>
					</tr>
					<tr>
						<td className="metric-name">Scene Pass Rate</td>
						<td className="metric-value">{scenePassRate}%</td>
					</tr>
					<tr>
						<td className="metric-name">Female Characters</td>
						<td className="metric-value">{numOfFemalesChars}</td>
					</tr>
					<tr>
						<td className="metric-name">Male Characters</td>
						<td className="metric-value">{numOfMaleChars}</td>
					</tr>
					<tr>
						<td className="metric-name">Female Characters with Dialogue</td>
						<td className="metric-value">{numOfFemalesCharsWithDialogue}</td>
					</tr>
					<tr>
						<td className="metric-name">Male Characters with Dialogue</td>
						<td className="metric-value">{numOfMaleCharsWithDialogue}</td>
					</tr>
					<tr>
						<td className="metric-name">Total Lines of Female Dialogue</td>
						<td className="metric-value">{totalLinesFemaleDialogue}</td>
					</tr>
					<tr>
						<td className="metric-name">Total Lines of Male Dialogue</td>
						<td className="metric-value">{totalLinesMaleDialogue}</td>
					</tr>
					<tr>
						<td className="metric-name">Total Dialogue Lines</td>
						<td className="metric-value">{totalDialogueLines}</td>
					</tr>
					<tr>
						<td className="metric-name">Female Dialogue Percentage</td>
						<td className="metric-value">{femaleDialoguePercentage}%</td>
					</tr>
					<tr>
						<td className="metric-name">Avg Lines per Female Character</td>
						<td className="metric-value">{avgLinesPerFemaleChar}</td>
					</tr>
					<tr>
						<td className="metric-name">Avg Lines per Male Character</td>
						<td className="metric-value">{avgLinesPerMaleChar}</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
};

BechdelResults.propTypes = {
	bechdelResults: PropTypes.shape({
		bechdelScore: PropTypes.number,
		numScenesPass: PropTypes.number,
		numScenesDontPass: PropTypes.number,
		numOfFemalesChars: PropTypes.number,
		numOfMaleChars: PropTypes.number,
		numOfFemalesCharsWithDialogue: PropTypes.number,
		numOfMaleCharsWithDialogue: PropTypes.number,
		totalLinesFemaleDialogue: PropTypes.number,
		totalLinesMaleDialogue: PropTypes.number,
	}),
};


export default BechdelResults;
