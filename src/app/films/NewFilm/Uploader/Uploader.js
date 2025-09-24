import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import React, { useEffect, useRef } from 'react';
import { Uppy } from '@uppy/core';
import { Dashboard, DragDrop, ProgressBar } from '@uppy/react';
import XHRUpload from '@uppy/xhr-upload';
import ErrorBoundary from '../../../shared/ErrorBoundary/ErrorBoundary';

const Uploader = () => {
	const uppyRef = useRef(null);

	useEffect(() => {
		const uppy = new Uppy({
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

		uppyRef.current = uppy;

		return () => {
			if (uppyRef.current) {
				uppyRef.current.close();
			}
		};
	}, []);

	return (
		<ErrorBoundary>
			<Dashboard uppy={uppyRef.current} />

			<DragDrop
				uppy={uppyRef.current}
				locale={{
					strings: {
						chooseFile: 'Boop a file',
						orDragDrop: 'or yoink it here',
					},
				}}
			/>

			<h2>Progress Bar</h2>
			<ProgressBar uppy={uppyRef.current} hideAfterFinish={false} />
		</ErrorBoundary>
	);
};

export default Uploader;
