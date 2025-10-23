import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './Notification.scss';

const Notification = ({
	type = 'info',
	message,
	title,
	duration = 5000,
	onClose,
	show = true,
	actionText,
	onActionClick,
	persistent = false
}) => {
	const [isVisible, setIsVisible] = useState(show);
	const [isExiting, setIsExiting] = useState(false);

	useEffect(() => {
		if (!persistent && duration > 0) {
			const timer = setTimeout(() => {
				handleClose();
			}, duration);

			return () => clearTimeout(timer);
		}
	}, [duration, persistent]);

	const handleClose = () => {
		setIsExiting(true);
		setTimeout(() => {
			setIsVisible(false);
			if (onClose) {
				onClose();
			}
		}, 300); // Match CSS transition duration
	};

	const handleActionClick = () => {
		if (onActionClick) {
			onActionClick();
		}
		handleClose();
	};

	if (!isVisible) {
		return null;
	}

	const getIcon = () => {
		switch (type) {
		case 'success':
			return '✅';
		case 'error':
			return '❌';
		case 'warning':
			return '⚠️';
		case 'info':
		default:
			return 'ℹ️';
		}
	};

	return (
		<div
			className={`notification notification--${type} ${isExiting ? 'notification--exiting' : ''}`}
			role="alert"
			aria-live="polite"
		>
			<div className="notification__content">
				<div className="notification__icon" aria-hidden="true">
					{getIcon()}
				</div>
				<div className="notification__text">
					{title && <h4 className="notification__title">{title}</h4>}
					<p className="notification__message">{message}</p>
				</div>
				<div className="notification__actions">
					{actionText && onActionClick && (
						<button
							type="button"
							className="notification__action"
							onClick={handleActionClick}
						>
							{actionText}
						</button>
					)}
					{!persistent && (
						<button
							type="button"
							className="notification__close"
							onClick={handleClose}
							aria-label="Close notification"
						>
							×
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

Notification.propTypes = {
	type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
	message: PropTypes.string.isRequired,
	title: PropTypes.string,
	duration: PropTypes.number,
	onClose: PropTypes.func,
	show: PropTypes.bool,
	actionText: PropTypes.string,
	onActionClick: PropTypes.func,
	persistent: PropTypes.bool,
};

export default Notification;
