import React from 'react';
import { render, AllTheProviders } from '../../test-utils';
import renderer from 'react-test-renderer';
import FilmsContainer from './FilmsContainer';

jest.mock('../../helper/api-static');

describe('FilmsContainer', () => {
	describe('rendering', () => {
		describe('initial state', () => {
			it('match the snapshot', () => {
				const component = renderer.create(
					<AllTheProviders>
						<FilmsContainer />
					</AllTheProviders>
				);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});
			it('is rendered correctly', () => {
				const { container } = render(<FilmsContainer />);
				expect(container.firstChild).toBeTruthy();
			});
		});
	});
});
