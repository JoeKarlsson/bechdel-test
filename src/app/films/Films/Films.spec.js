import React from 'react';
import { render } from '@testing-library/react';
import renderer from 'react-test-renderer';
import Films from './Films';

jest.mock('../../helper/api');

describe('Films', () => {
	describe('rendering', () => {
		describe('initial state', () => {
			it('match the snapshot', () => {
				const component = renderer.create(<Films />);
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
