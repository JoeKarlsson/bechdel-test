import React, { useState } from 'react';
import './ApiDocs.scss';

const ApiDocs = () => {
	const [activeEndpoint, setActiveEndpoint] = useState('get-all-films');

	const endpoints = [
		{
			id: 'get-all-films',
			method: 'GET',
			path: '/api/film',
			title: 'Get All Films',
			description: 'Retrieve a paginated list of films in the database with their Bechdel Test results.',
		},
		{
			id: 'get-film-by-id',
			method: 'GET',
			path: '/api/film/:id',
			title: 'Get Film by ID',
			description: 'Retrieve detailed information about a specific film by its ID.',
		},
		{
			id: 'upload-film',
			method: 'POST',
			path: '/api/film',
			title: 'Upload Film Script',
			description: 'Upload a movie script file (.txt) to analyze with the Bechdel Test.',
		},
		{
			id: 'health-check',
			method: 'GET',
			path: '/health',
			title: 'Health Check',
			description: 'Check the health status of the API server.',
		},
	];

	const getEndpointDetails = (endpointId) => {
		const details = {
			'get-all-films': {
				request: {
					method: 'GET',
					url: '/api/film?page=1&limit=10',
					headers: {
						'Content-Type': 'application/json',
					},
					queryParameters: {
						page: 'number (optional) - Page number to retrieve (default: 1)',
						limit: 'number (optional) - Number of films per page (default: 10, max: 100)',
					},
				},
				response: {
					success: {
						films: [
							{
								_id: '507f1f77bcf86cd799439011',
								title: 'American Hustle',
								plot: 'A con man, Irving Rosenfeld, along with his seductive partner Sydney Prosser...',
								year: 2013,
								actors: [
									{
										actorName: 'Christian Bale',
										character: 'Irving Rosenfeld',
										actorActress: 'male',
									},
									{
										actorName: 'Amy Adams',
										character: 'Sydney Prosser',
										actorActress: 'female',
									},
								],
								directors: [{ name: 'David O. Russell', id: 'nm0000756' }],
								writers: [{ name: 'Eric Warren Singer', id: 'nm0801402' }],
								genres: ['Comedy', 'Crime', 'Drama'],
								bechdelResults: {
									pass: true,
									bechdelScore: 3,
									numScenesPass: 5,
									numScenesDontPass: 2,
									numOfFemalesChars: 8,
									numOfMaleChars: 12,
									numOfFemalesCharsWithDialogue: 6,
									numOfMaleCharsWithDialogue: 10,
									totalLinesFemaleDialogue: 245,
									totalLinesMaleDialogue: 312,
									scenesThatPass: ['Scene 1', 'Scene 3', 'Scene 5', 'Scene 7', 'Scene 9'],
								},
								createdAt: '2023-01-15T10:30:00.000Z',
							},
						],
						pagination: {
							currentPage: 1,
							totalPages: 5,
							totalCount: 47,
							limit: 10,
							hasNextPage: true,
							hasPrevPage: false,
						},
					},
					error: {
						success: false,
						error: 'No list of films returned from film.listAllPaginated()',
					},
				},
				statusCodes: [
					{ code: 200, description: 'Success - Returns paginated array of films' },
					{ code: 400, description: 'Bad Request - Invalid pagination parameters' },
					{ code: 500, description: 'Server Error - Database connection issue' },
				],
			},
			'get-film-by-id': {
				request: {
					method: 'GET',
					url: '/api/film/507f1f77bcf86cd799439011',
					headers: {
						'Content-Type': 'application/json',
					},
				},
				response: {
					success: {
						_id: '507f1f77bcf86cd799439011',
						title: 'American Hustle',
						plot: 'A con man, Irving Rosenfeld, along with his seductive partner Sydney Prosser...',
						year: 2013,
						releaseDate: '2013-12-20',
						actors: [
							{
								actorName: 'Christian Bale',
								character: 'Irving Rosenfeld',
								actorActress: 'male',
							},
							{
								actorName: 'Amy Adams',
								character: 'Sydney Prosser',
								actorActress: 'female',
							},
						],
						directors: [{ name: 'David O. Russell', id: 'nm0000756' }],
						writers: [{ name: 'Eric Warren Singer', id: 'nm0801402' }],
						genres: ['Comedy', 'Crime', 'Drama'],
						rated: 'R',
						rating: '7.2',
						metascore: 90,
						urlPoster: 'https://example.com/poster.jpg',
						idIMDB: 'tt1065073',
						urlIMDB: 'https://www.imdb.com/title/tt1065073/',
						bechdelResults: {
							pass: true,
							bechdelScore: 3,
							numScenesPass: 5,
							numScenesDontPass: 2,
							numOfFemalesChars: 8,
							numOfMaleChars: 12,
							numOfFemalesCharsWithDialogue: 6,
							numOfMaleCharsWithDialogue: 10,
							totalLinesFemaleDialogue: 245,
							totalLinesMaleDialogue: 312,
							scenesThatPass: ['Scene 1', 'Scene 3', 'Scene 5', 'Scene 7', 'Scene 9'],
						},
						images: {
							backdrop: 'https://example.com/backdrop.jpg',
							poster: 'https://example.com/poster.jpg',
						},
						createdAt: '2023-01-15T10:30:00.000Z',
						dateUploaded: '2023-01-15T10:30:00.000Z',
					},
					error: {
						success: false,
						error: 'No movie found by that ID',
					},
				},
				statusCodes: [
					{ code: 200, description: 'Success - Returns film details' },
					{ code: 500, description: 'Error - Film not found' },
				],
			},
			'upload-film': {
				request: {
					method: 'POST',
					url: '/api/film',
					headers: {
						'Content-Type': 'multipart/form-data',
					},
					body: 'FormData with file field containing .txt script',
				},
				response: {
					success: {
						_id: '507f1f77bcf86cd799439011',
						title: 'American Hustle',
						plot: 'A con man, Irving Rosenfeld, along with his seductive partner Sydney Prosser...',
						year: 2013,
						actors: [
							{
								actorName: 'Christian Bale',
								character: 'Irving Rosenfeld',
								actorActress: 'male',
							},
							{
								actorName: 'Amy Adams',
								character: 'Sydney Prosser',
								actorActress: 'female',
							},
						],
						directors: [{ name: 'David O. Russell', id: 'nm0000756' }],
						writers: [{ name: 'Eric Warren Singer', id: 'nm0801402' }],
						genres: ['Comedy', 'Crime', 'Drama'],
						bechdelResults: {
							pass: true,
							bechdelScore: 3,
							numScenesPass: 5,
							numScenesDontPass: 2,
							numOfFemalesChars: 8,
							numOfMaleChars: 12,
							numOfFemalesCharsWithDialogue: 6,
							numOfMaleCharsWithDialogue: 10,
							totalLinesFemaleDialogue: 245,
							totalLinesMaleDialogue: 312,
							scenesThatPass: ['Scene 1', 'Scene 3', 'Scene 5', 'Scene 7', 'Scene 9'],
						},
						createdAt: '2023-01-15T10:30:00.000Z',
					},
					error: {
						success: false,
						error: 'No script submitted, please try again',
					},
				},
				statusCodes: [
					{ code: 200, description: 'Success - Film processed and analyzed' },
					{ code: 500, description: 'Error - Invalid file format or processing error' },
				],
			},
			'health-check': {
				request: {
					method: 'GET',
					url: '/health',
					headers: {
						'Content-Type': 'application/json',
					},
				},
				response: {
					success: {
						status: 'healthy',
						timestamp: '2023-01-15T10:30:00.000Z',
						uptime: 3600,
						environment: 'production',
					},
				},
				statusCodes: [
					{ code: 200, description: 'Success - Server is healthy' },
				],
			},
		};

		return details[endpointId] || {};
	};

	const formatJson = (obj) => {
		return JSON.stringify(obj, null, 2);
	};

	const getMethodColor = (method) => {
		const colors = {
			GET: '#61affe',
			POST: '#49cc90',
			PUT: '#fca130',
			DELETE: '#f93e3e',
		};
		return colors[method] || '#61affe';
	};

	return (
		<div className="api-docs">
			<div className="container">
				<header className="api-docs-header">
					<h1>bechdel.io API Documentation</h1>
					<p className="api-docs-subtitle">
						RESTful API for analyzing movie scripts with the Bechdel Test. Upload scripts,
						retrieve analysis results, and explore feminist film data.
					</p>
					<div className="api-info">
						<div className="api-info-item">
							<strong>Base URL:</strong> <code>https://bechdel.io</code>
						</div>
						<div className="api-info-item">
							<strong>Content Type:</strong> <code>application/json</code>
						</div>
						<div className="api-info-item">
							<strong>Authentication:</strong> None required
						</div>
					</div>
				</header>

				<div className="api-docs-content">
					<nav className="api-docs-nav">
						<h3>Endpoints</h3>
						<ul>
							{endpoints.map((endpoint) => (
								<li key={endpoint.id}>
									<button
										className={`nav-item ${activeEndpoint === endpoint.id ? 'active' : ''}`}
										onClick={() => setActiveEndpoint(endpoint.id)}
									>
										<span
											className="method-badge"
											style={{ backgroundColor: getMethodColor(endpoint.method) }}
										>
											{endpoint.method}
										</span>
										<span className="endpoint-path">{endpoint.path}</span>
									</button>
								</li>
							))}
						</ul>
					</nav>

					<main className="api-docs-main">
						{endpoints.map((endpoint) => {
							if (activeEndpoint !== endpoint.id) return null;

							const details = getEndpointDetails(endpoint.id);

							return (
								<div key={endpoint.id} className="endpoint-details">
									<div className="endpoint-header">
										<div className="endpoint-title">
											<span
												className="method-badge large"
												style={{ backgroundColor: getMethodColor(endpoint.method) }}
											>
												{endpoint.method}
											</span>
											<h2>{endpoint.title}</h2>
										</div>
										<code className="endpoint-url">{endpoint.path}</code>
									</div>

									<div className="endpoint-description">
										<p>{endpoint.description}</p>
									</div>

									{details.request && (
										<section className="request-section">
											<h3>Request</h3>
											<div className="code-block">
												<div className="code-header">
													<span className="code-label">Method</span>
													<code>{details.request.method}</code>
												</div>
												<div className="code-header">
													<span className="code-label">URL</span>
													<code>{details.request.url}</code>
												</div>
												{details.request.headers && (
													<div className="code-header">
														<span className="code-label">Headers</span>
														<pre><code>{formatJson(details.request.headers)}</code></pre>
													</div>
												)}
												{details.request.body && (
													<div className="code-header">
														<span className="code-label">Body</span>
														<pre><code>{details.request.body}</code></pre>
													</div>
												)}
											</div>
										</section>
									)}

									{details.response && (
										<section className="response-section">
											<h3>Response</h3>

											{details.response.success && (
												<div className="response-example">
													<h4>Success Response</h4>
													<div className="code-block">
														<pre><code>{formatJson(details.response.success)}</code></pre>
													</div>
												</div>
											)}

											{details.response.error && (
												<div className="response-example">
													<h4>Error Response</h4>
													<div className="code-block error">
														<pre><code>{formatJson(details.response.error)}</code></pre>
													</div>
												</div>
											)}
										</section>
									)}

									{details.statusCodes && (
										<section className="status-codes-section">
											<h3>Status Codes</h3>
											<div className="status-codes">
												{details.statusCodes.map((status, index) => (
													<div key={index} className="status-code">
														<span className="status-number">{status.code}</span>
														<span className="status-description">{status.description}</span>
													</div>
												))}
											</div>
										</section>
									)}
								</div>
							);
						})}
					</main>
				</div>

				<section className="data-models">
					<h2>Data Models</h2>

					<div className="model-section">
						<h3>Film Object</h3>
						<div className="model-description">
							<p>Represents a movie with its metadata and Bechdel Test analysis results.</p>
						</div>
						<div className="code-block">
							<pre><code>{formatJson({
								_id: 'string (MongoDB ObjectId)',
								title: 'string (required)',
								plot: 'string',
								simplePlot: 'string',
								year: 'number',
								releaseDate: 'string (ISO date)',
								actors: [
									{
										actorName: 'string',
										character: 'string',
										actorActress: 'string (male/female)',
									}
								],
								directors: [
									{
										name: 'string',
										id: 'string',
									}
								],
								writers: [
									{
										name: 'string',
										id: 'string',
									}
								],
								genres: ['string'],
								rated: 'string',
								rating: 'string',
								metascore: 'number',
								urlPoster: 'string (URL)',
								idIMDB: 'string',
								urlIMDB: 'string (URL)',
								bechdelResults: {
									pass: 'boolean',
									bechdelScore: 'number (0-3)',
									numScenesPass: 'number',
									numScenesDontPass: 'number',
									numOfFemalesChars: 'number',
									numOfMaleChars: 'number',
									numOfFemalesCharsWithDialogue: 'number',
									numOfMaleCharsWithDialogue: 'number',
									totalLinesFemaleDialogue: 'number',
									totalLinesMaleDialogue: 'number',
									scenesThatPass: ['string'],
								},
								images: {
									backdrop: 'string (URL)',
									poster: 'string (URL)',
								},
								createdAt: 'string (ISO date)',
								dateUploaded: 'string (ISO date)',
							})}</code></pre>
						</div>
					</div>

				</section>

				<section className="error-handling">
					<h2>Error Handling</h2>
					<p>
						The API uses standard HTTP status codes to indicate success or failure.
						All error responses follow a consistent format:
					</p>
					<div className="code-block error">
						<pre><code>{formatJson({
							success: false,
							error: 'Error message describing what went wrong',
						})}</code></pre>
					</div>

					<h3>Common Error Scenarios</h3>
					<ul>
						<li><strong>500 Internal Server Error:</strong> Database connection issues, file processing errors</li>
						<li><strong>400 Bad Request:</strong> Invalid file format (only .txt files accepted), invalid pagination parameters</li>
						<li><strong>404 Not Found:</strong> Film ID not found in database</li>
					</ul>
				</section>

				<section className="pagination">
					<h2>Pagination</h2>
					<p>
						The GET /api/film endpoint supports pagination to efficiently retrieve large datasets.
						Use the following query parameters to control pagination:
					</p>
					<ul>
						<li><strong>page</strong> (optional): Page number to retrieve (default: 1)</li>
						<li><strong>limit</strong> (optional): Number of films per page (default: 10, maximum: 100)</li>
					</ul>
					<p>
						The response includes a <code>pagination</code> object with metadata about the current page,
						total pages, total count, and navigation flags.
					</p>
					<div className="code-block">
						<pre><code>{formatJson({
							pagination: {
								currentPage: 1,
								totalPages: 5,
								totalCount: 47,
								limit: 10,
								hasNextPage: true,
								hasPrevPage: false,
							},
						})}</code></pre>
					</div>
				</section>

				<section className="rate-limiting">
					<h2>Rate Limiting</h2>
					<p>
						Currently, there are no rate limits imposed on the API. However, we reserve the right
						to implement rate limiting in the future to ensure fair usage for all users.
					</p>
				</section>

				<section className="support">
					<h2>Support</h2>
					<p>
						For questions, bug reports, or feature requests, please visit our
						<a href="https://github.com/JoeKarlsson/bechdel-test" target="_blank" rel="noopener noreferrer"> GitHub repository</a>.
					</p>
				</section>

				<section className="detailed-bechdel-analysis">
					<h2>Detailed Bechdel Analysis</h2>
					<div className="analysis-description">
						<p>The Bechdel Test analysis results for a film. The test passes if:</p>
						<ol>
							<li>The film has at least two named female characters</li>
							<li>These characters have at least one conversation</li>
							<li>The conversation is about something other than a man</li>
						</ol>
					</div>
					<div className="analysis-table-container">
						<table className="bechdel-analysis-table">
							<thead>
								<tr>
									<th>Field</th>
									<th>Type</th>
									<th>Description</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td><code>pass</code></td>
									<td>boolean</td>
									<td>Whether the film passes the Bechdel Test</td>
								</tr>
								<tr>
									<td><code>bechdelScore</code></td>
									<td>number</td>
									<td>Score from 0-3 based on criteria met</td>
								</tr>
								<tr>
									<td><code>numScenesPass</code></td>
									<td>number</td>
									<td>Number of scenes that pass the test</td>
								</tr>
								<tr>
									<td><code>numScenesDontPass</code></td>
									<td>number</td>
									<td>Number of scenes that fail the test</td>
								</tr>
								<tr>
									<td><code>numOfFemalesChars</code></td>
									<td>number</td>
									<td>Total female characters in the film</td>
								</tr>
								<tr>
									<td><code>numOfMaleChars</code></td>
									<td>number</td>
									<td>Total male characters in the film</td>
								</tr>
								<tr>
									<td><code>numOfFemalesCharsWithDialogue</code></td>
									<td>number</td>
									<td>Female characters with speaking roles</td>
								</tr>
								<tr>
									<td><code>numOfMaleCharsWithDialogue</code></td>
									<td>number</td>
									<td>Male characters with speaking roles</td>
								</tr>
								<tr>
									<td><code>totalLinesFemaleDialogue</code></td>
									<td>number</td>
									<td>Total lines spoken by female characters</td>
								</tr>
								<tr>
									<td><code>totalLinesMaleDialogue</code></td>
									<td>number</td>
									<td>Total lines spoken by male characters</td>
								</tr>
								<tr>
									<td><code>scenesThatPass</code></td>
									<td>array</td>
									<td>List of scene descriptions that pass the test</td>
								</tr>
							</tbody>
						</table>
					</div>
				</section>
			</div>
		</div>
	);
};

export default ApiDocs;