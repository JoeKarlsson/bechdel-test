import React from 'react';
import PropTypes from 'prop-types';

const BechdelResults = (props) => {

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
	} = props.bechdelResults;

	return (
		<div className="BechdelResults">
			<span className="catName">Bechdel Score:</span>{' '}
			{bechdelScore} of 3<br />
			<span className="catName">
			Number of Scenes that pass:
			</span>{' '}
			{numScenesPass}
			<br />
			<span className="catName">
			Number of Scenes that dont pass:
			</span>{' '}
			{numScenesDontPass}
			<br />
			<span className="catName">
			Number Of Females Characters:
			</span>{' '}
			{numOfFemalesChars}
			<br />
			<span className="catName">
			Number Of Male Characters:
			</span>{' '}
			{numOfMaleChars}
			<br />
			<span className="catName">
			Number of Females Characters With Dialogue:
			</span>{' '}
			{numOfFemalesCharsWithDialogue}
			<br />
			<span className="catName">
			Number of Male Characters With Dialogue:
			</span>{' '}
			{numOfMaleCharsWithDialogue}
			<br />
			<span className="catName">
			Total Lines of Female Dialogue:
			</span>{' '}
			{totalLinesFemaleDialogue}
			<br />
			<span className="catName">
			Total Lines of Male Dialogue:
			</span>{' '}
			{totalLinesMaleDialogue}
			<br />
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

BechdelResults.defaultProps = {
	bechdelResults: {
		bechdelScore: 0,
		numScenesPass: 0,
		numScenesDontPass: 0,
		numOfFemalesChars: 0,
		numOfMaleChars: 0,
		numOfFemalesCharsWithDialogue: 0,
		numOfMaleCharsWithDialogue: 0,
		totalLinesFemaleDialogue: 0,
		totalLinesMaleDialogue: 0,
	},
};

export default BechdelResults;
