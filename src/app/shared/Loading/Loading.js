import React, { useState, useEffect } from 'react';
import './Loading.scss';

const Loading = () => {
	const [currentText, setCurrentText] = useState('');
	const [isTyping, setIsTyping] = useState(true);
	const [showLoader, setShowLoader] = useState(false);
	const fullText = 'Destroying the Patriarchy';
	const typingSpeed = 150;
	const pauseDuration = 2000;
	const loaderDelay = 2000; // 2 second delay

	// Show loader after delay
	useEffect(() => {
		const delayTimeout = setTimeout(() => {
			setShowLoader(true);
		}, loaderDelay);

		return () => clearTimeout(delayTimeout);
	}, []);

	// Typing animation effect
	useEffect(() => {
		if (!showLoader) return;

		let timeout;

		if (isTyping && currentText.length < fullText.length) {
			timeout = setTimeout(() => {
				setCurrentText(fullText.slice(0, currentText.length + 1));
			}, typingSpeed);
		} else if (isTyping && currentText.length === fullText.length) {
			timeout = setTimeout(() => {
				setIsTyping(false);
			}, pauseDuration);
		} else if (!isTyping && currentText.length > 0) {
			timeout = setTimeout(() => {
				setCurrentText(currentText.slice(0, -1));
			}, typingSpeed / 2);
		} else if (!isTyping && currentText.length === 0) {
			timeout = setTimeout(() => {
				setIsTyping(true);
			}, 500);
		}

		return () => clearTimeout(timeout);
	}, [currentText, isTyping, fullText, showLoader]);

	return (
		<div className={`Loader ${!showLoader ? 'Loader--hidden' : ''}`}>
			{/* Animated background particles */}
			<div className="Loader_particles">
				{[...Array(20)].map((_, i) => (
					<div key={i} className={`Loader_particle Loader_particle--${i % 4}`} />
				))}
			</div>

			{/* Main loader content */}
			<div className="Loader_indicator">
				<div className="Loader_textContainer">
					<h1 className="Loader_title">
						<span className="Loader_typingText">
							{currentText}
							<span className="Loader_cursor">|</span>
						</span>
					</h1>

					{/* Enhanced ellipsis animation */}
					<div className="Loader_ellipsis">
						<span className="Loader_ellipsisDot Loader_ellipsisDot--1">.</span>
						<span className="Loader_ellipsisDot Loader_ellipsisDot--2">.</span>
						<span className="Loader_ellipsisDot Loader_ellipsisDot--3">.</span>
					</div>
				</div>

				{/* Progress bar */}
				<div className="Loader_progress">
					<div className="Loader_progressBar"></div>
				</div>

				{/* Animated icons */}
				<div className="Loader_icons">
					<div className="Loader_icon Loader_icon--hammer">🔨</div>
					<div className="Loader_icon Loader_icon--fist">✊</div>
					<div className="Loader_icon Loader_icon--star">⭐</div>
				</div>
			</div>
		</div>
	);
};

export default Loading;
