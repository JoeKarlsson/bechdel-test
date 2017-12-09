import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	componentDidCatch(error, info) {
		// Display fallback UI
		this.setState({
			hasError: true,
			error,
			errorInfo: info,
		});
		// You can also log the error to an error reporting service
		console.error(error, info);
	}

	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return (
				<div className="Error">
					<h1>Something went wrong.</h1>
					<details style={{ whiteSpace: 'pre-wrap' }}>
						{this.state.error && this.state.error.toString()}
						<br />
						{this.state.errorInfo.componentStack}
					</details>
				</div>
			);
		}
		return this.props.children;
	}
}

ErrorBoundary.propTypes = {
	children: PropTypes.any, // eslint-disable-line react/forbid-prop-types
};

ErrorBoundary.defaultProps = {
	children: '',
};

export default ErrorBoundary;
