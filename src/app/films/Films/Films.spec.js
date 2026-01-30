import React from 'react';
import { render, AllTheProviders } from '../../test-utils';
import renderer from 'react-test-renderer';
import Films from './Films';

describe('Films', () => {
	describe('rendering', () => {
		describe('initial state', () => {
			it('match the snapshot', () => {
				const component = renderer.create(
					<AllTheProviders>
						<Films />
					</AllTheProviders>
				);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});
			it('is rendered correctly', () => {
				const { container } = render(<Films />);
				expect(container.firstChild).toBeTruthy();
			});
		});
	});
});
