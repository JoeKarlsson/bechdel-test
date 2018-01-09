import React from 'react';
import ErrorBoundary from '../../../shared/ErrorBoundary/ErrorBoundary';

import './Uploader.scss';

const Uppy = require('uppy/lib/core');
const XHRUpload = require('uppy/lib/plugins/XHRUpload');
const DragDrop = require('uppy/lib/react/DragDrop');

const uppy = Uppy({
	meta: { type: 'avatar' },
	restrictions: { maxNumberOfFiles: 1 },
	autoProceed: true,
});

uppy.use(XHRUpload, {
	endpoint: '/api/film',
	method: 'post',
	formData: true,
	limit: 1,
});

uppy.on('complete', result => {
	const url = result.successful[0].uploadURL;
	console.log('url', url);
});

uppy.run();

const Uploader = () => {
	return (
		<div>
			<ErrorBoundary>
				<DragDrop
					uppy={uppy}
					locale={{
						strings: {
							chooseFile: 'Pick a new avatar',
						},
					}}
				/>
			</ErrorBoundary>
		</div>
	);
};

export default Uploader;
