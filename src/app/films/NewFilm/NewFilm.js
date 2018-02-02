import React from 'react';
import Uploader from './Uploader/Uploader';
import ErrorBoundary from '../../shared/ErrorBoundary/ErrorBoundary';

const NewFilm = () => {
	return (
		<div className="newFilm container">
			<h1>test a new script</h1>
			<ErrorBoundary>
				<Uploader />
			</ErrorBoundary>
			<p>
				Note: This tool currently only supports scripts with a .txt format, and
				the script must follow the{' '}
				<a target="blank" href="http://www.simplyscripts.com/WR_format.html">
					Standard Script Format
				</a>.
			</p>
			<p>
				If you are still having issues using the tool, try adding the title of
				the script is on the first line. Or you can submit an{' '}
				<a
					target="blank"
					href="https://github.com/JoeKarlsson1/bechdel-test/issues"
				>
					issue
				</a>.
			</p>
		</div>
	);
};

export default NewFilm;
