import React from 'react';
import Uppy from 'uppy/lib/core';
import XHRUpload from 'uppy/lib/plugins/XHRUpload';
import DragDrop from 'uppy/lib/react/DragDrop';
import ErrorBoundary from '../../../shared/ErrorBoundary/ErrorBoundary';
import './Uploader.scss';

const uppy = Uppy({
	meta: { type: 'script' },
	restrictions: { maxNumberOfFiles: 1 },
	autoProceed: true,
});

uppy.use(XHRUpload, {
	endpoint: '/api/film',
	fieldName: 'script',
	method: 'post',
	formData: true,
	limit: 1,
	getResponseData: xhr => {
		let response = JSON.parse(xhr.response);
		response = response['0'];

		window.location = `/film/${response._id}`;
		return {
			url: xhr.responseXML.querySelector('Location').textContent,
		};
	},
});

uppy.on('complete', result => {
	console.log(result);
});

uppy.on('upload-success', result => {
	console.log(result);
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
							chooseFile: 'Choose a script',
						},
					}}
				/>
			</ErrorBoundary>
		</div>
	);
};

export default Uploader;
