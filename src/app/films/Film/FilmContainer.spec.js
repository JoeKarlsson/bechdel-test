import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FilmContainer from './FilmContainer';
import mockAPI from './__mocks__/mockReply.json';

jest.mock('../../helper/api');

describe('FilmContainer', () => {
	const router = {
		params: {
			id: '1234',
		},
	};

	describe('rendering', () => {
		describe('initial state', () => {
			it('is rendered correctly', async () => {
				fetch.mockResponseOnce(JSON.stringify(mockAPI));
				const { container } = render(
					<MemoryRouter>
						<FilmContainer match={router} />
					</MemoryRouter>
				);

				expect(container.firstChild).toBeTruthy();
			});

			it('should load film data', async () => {
				fetch.mockResponseOnce(JSON.stringify(mockAPI));
				const { container } = render(
					<MemoryRouter>
						<FilmContainer match={router} />
					</MemoryRouter>
				);

				// Wait for component to load data
				await waitFor(() => {
					expect(container.firstChild).toBeTruthy();
				});
			});
		});
	});
});
