import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import React, { Component } from 'react';
import { Uppy } from '@uppy/core';
import { Dashboard, DragDrop, ProgressBar } from '@uppy/react';
import XHRUpload from '@uppy/xhr-upload';
import ErrorBoundary from '../../../shared/ErrorBoundary/ErrorBoundary';

class Uploader extends Component {
	constructor(props) {
		super(props);

		this.uppy = new Uppy({
			id: 'uppy',
			meta: { type: 'script' },
			restrictions: {
				maxNumberOfFiles: 10,
				maxFileSize: 1000000,
				minNumberOfFiles: 1,
				allowedFileTypes: ['text/plain/*'],
			},
			thumbnailGeneration: true,
			autoProceed: true,
			debug: true,
		}).use(XHRUpload, {
			endpoint: '/api/film',
			fieldName: 'script',
			method: 'post',
			formData: true,
			limit: 10,
			getResponseData: xhr => {
				let response = JSON.parse(xhr.response);
				response = response['0'];

				window.location = `/film/${response._id}`;
				return {
					url: xhr.responseXML.querySelector('Location').textContent,
				};
			},
		});
	}
	componentWillUnmount() {
		this.uppy.close();
	}

	render() {
		return (
			<ErrorBoundary>
				<Dashboard uppy={this.uppy} />

				<DragDrop
					uppy={this.uppy}
					locale={{
						strings: {
							chooseFile: 'Boop a file',
							orDragDrop: 'or yoink it here',
						},
					}}
				/>

				<h2>Progress Bar</h2>
				<ProgressBar uppy={this.uppy} hideAfterFinish={false} />
			</ErrorBoundary>
		);
	}
}

export default Uploader;
