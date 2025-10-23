import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Tooltip.scss';

// Feminist film theory glossary
const glossary = {
	'male-gaze': {
		term: 'Male Gaze',
		definition: 'A concept introduced by feminist film theorist Laura Mulvey in 1975, describing how visual arts and literature depict the world from a masculine, heterosexual perspective. In film, the camera treats women as objects of male pleasure, positioning the audience to view women through the eyes of a heterosexual man.',
		citation: 'Mulvey, Laura. "Visual Pleasure and Narrative Cinema" (1975)',
	},
	'female-agency': {
		term: 'Female Agency',
		definition: 'The capacity of female characters to make independent choices and take meaningful action that affects the narrative. Films with strong female agency feature women who drive the plot forward through their own decisions rather than reacting to male characters\' actions.',
		citation: 'Feminist Film Theory (Various)',
	},
	'bechdel-test': {
		term: 'Bechdel Test',
		definition: 'A measure of female representation in fiction created by Alison Bechdel in 1985. To pass, a work must feature: (1) at least two women (2) who talk to each other (3) about something other than a man. While simple, it reveals how rarely women are portrayed with depth and complexity.',
		citation: 'Bechdel, Alison. "Dykes to Watch Out For" (1985)',
	},
	'representation': {
		term: 'Representation',
		definition: 'How groups of people are portrayed in media. Feminist film scholars examine not just whether women are present, but how they are shown—their roles, agency, complexity, and whether they reflect or challenge stereotypes. Intersectional analysis also considers race, class, sexuality, and disability.',
		citation: 'Feminist Media Studies (Various)',
	},
	'stereotype': {
		term: 'Stereotype',
		definition: 'Oversimplified, generalized beliefs about groups of people. In film, gender stereotypes include the "damsel in distress," "manic pixie dream girl," "mother/whore dichotomy," and "strong female character" who exists only to support the male hero. These limit representation and reinforce harmful beliefs.',
		citation: 'Feminist Film Theory (Various)',
	},
	'power-dynamics': {
		term: 'Power Dynamics',
		definition: 'The ways power is distributed between characters in a narrative, often reflecting real-world social hierarchies. Feminist analysis examines who has authority, who makes decisions, who controls resources, and how gender intersects with other forms of power like race and class.',
		citation: 'Feminist Film Theory (Various)',
	},
	'intersectionality': {
		term: 'Intersectionality',
		definition: 'A framework coined by Kimberlé Crenshaw recognizing that various forms of inequality often operate together and exacerbate each other. In film analysis, this means examining how race, gender, class, sexuality, and disability intersect to shape characters\' experiences and representation.',
		citation: 'Crenshaw, Kimberlé. "Mapping the Margins" (1991)',
	},
	'narrative-cinema': {
		term: 'Narrative Cinema',
		definition: 'Storytelling films that follow traditional plot structures. Feminist scholars examine how narrative conventions often center male experiences and perspectives, relegating women to supporting roles or love interests rather than protagonists with their own complete story arcs.',
		citation: 'Feminist Film Theory (Various)',
	},
};

const Tooltip = ({ term, children, position = 'top' }) => {
	const [isVisible, setIsVisible] = useState(false);
	const [tooltipPosition, setTooltipPosition] = useState(position);
	const triggerRef = useRef(null);
	const tooltipRef = useRef(null);

	const termData = glossary[term];

	useEffect(() => {
		if (isVisible && tooltipRef.current && triggerRef.current) {
			const triggerRect = triggerRef.current.getBoundingClientRect();
			const tooltipRect = tooltipRef.current.getBoundingClientRect();
			const viewportHeight = window.innerHeight;

			// Check if tooltip goes off screen and adjust position
			if (position === 'top' && triggerRect.top - tooltipRect.height < 0) {
				setTooltipPosition('bottom');
			} else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height > viewportHeight) {
				setTooltipPosition('top');
			}
		}
	}, [isVisible, position]);

	if (!termData) {
		console.warn(`Tooltip: No glossary entry found for term "${term}"`);
		return <span>{children}</span>;
	}

	const handleMouseEnter = () => setIsVisible(true);
	const handleMouseLeave = () => setIsVisible(false);
	const handleFocus = () => setIsVisible(true);
	const handleBlur = () => setIsVisible(false);

	return (
		<span className="tooltip-wrapper">
			<span
				ref={triggerRef}
				className="tooltip-trigger"
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				onFocus={handleFocus}
				onBlur={handleBlur}
				tabIndex="0"
				role="button"
				aria-label={`Learn more about ${termData.term}`}
				aria-describedby={isVisible ? `tooltip-${term}` : undefined}
			>
				{children}
				<span className="tooltip-icon" aria-hidden="true">?</span>
			</span>
			{isVisible && (
				<span
					ref={tooltipRef}
					id={`tooltip-${term}`}
					className={`tooltip-content tooltip-content--${tooltipPosition}`}
					role="tooltip"
				>
					<strong className="tooltip-term">{termData.term}</strong>
					<p className="tooltip-definition">{termData.definition}</p>
					{termData.citation && (
						<cite className="tooltip-citation">{termData.citation}</cite>
					)}
					<span className="tooltip-arrow" />
				</span>
			)}
		</span>
	);
};

Tooltip.propTypes = {
	term: PropTypes.oneOf(Object.keys(glossary)).isRequired,
	children: PropTypes.node.isRequired,
	position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
};

export default Tooltip;
export { glossary };
