import React from 'react';
import Uppy from 'uppy/lib/core';
import XHRUpload from 'uppy/lib/plugins/XHRUpload';
import Dashboard from 'uppy/lib/react/Dashboard';
import ErrorBoundary from '../../../shared/ErrorBoundary/ErrorBoundary';
import './Uploader.scss';

const uppy = Uppy({
	meta: { type: 'script' },
	restrictions: {
		maxNumberOfFiles: 10,
		maxFileSize: 1000000,
		minNumberOfFiles: 1,
		allowedFileTypes: ['text/plain/*'],
	},
	thumbnailGeneration: true,
	autoProceed: true,
});

uppy.use(XHRUpload, {
	endpoint: '/api/film',
	fieldName: 'script',
	method: 'post',
	formData: true,
	limit: 10,
	getResponseData: xhr => {
		let response = JSON.parse(xhr.response);
		response = response['0'];
		console.log('response', response);

		// window.location = `/film/${response._id}`;
		// return {
		// 	url: xhr.responseXML.querySelector('Location').textContent,
		// };
	},
});

uppy.on('complete', result => {
	console.log('successful files:', result.successful);
	console.log('failed files:', result.failed);
});

uppy.on('upload-success', result => {
	console.log(result);
});

uppy.run();

const Uploader = () => {
	return (
		<div>
			<ErrorBoundary>
				<Dashboard uppy={uppy} />
			</ErrorBoundary>
		</div>
	);
};

export default Uploader;
