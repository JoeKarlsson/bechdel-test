import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import React, { useEffect, useRef, useState } from 'react';
import { Uppy } from '@uppy/core';
import { Dashboard } from '@uppy/react';
import XHRUpload from '@uppy/xhr-upload';
import ErrorBoundary from '../../../shared/ErrorBoundary/ErrorBoundary';

const Uploader = () => {
	const uppyRef = useRef(null);
	const [uppy, setUppy] = useState(null);

	useEffect(() => {
		const uppyInstance = new Uppy({
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

		uppyRef.current = uppyInstance;
		setUppy(uppyInstance);

		return () => {
			if (uppyRef.current) {
				uppyRef.current.close();
			}
		};
	}, []);

	// Don't render components until Uppy is initialized
	if (!uppy) {
		return <div>Loading uploader...</div>;
	}

	return (
		<ErrorBoundary>
			<Dashboard 
				uppy={uppy}
				locale={{
					strings: {
						chooseFile: 'Boop a file',
						orDragDrop: 'or yoink it here',
					},
				}}
				showProgressDetails={true}
				hideUploadButton={false}
				hideRetryButton={false}
				hidePauseResumeButton={false}
				hideCancelButton={false}
			/>
		</ErrorBoundary>
	);
};

export default Uploader;
