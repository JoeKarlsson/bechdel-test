import React from 'react';
import { render } from '@testing-library/react';
import renderer from 'react-test-renderer';
import FilmsContainer from './FilmsContainer';

jest.mock('../../helper/api');

describe('FilmsContainer', () => {
	describe('rendering', () => {
		describe('initial state', () => {
			it('match the snapshot', () => {
				const component = renderer.create(<FilmsContainer />);
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
