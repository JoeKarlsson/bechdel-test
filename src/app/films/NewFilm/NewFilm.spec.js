import React from 'react';
import { render } from '@testing-library/react';
import renderer from 'react-test-renderer';
import NewFilm from './NewFilm';

jest.mock('./Uploader/Uploader');

describe('NewFilm', () => {
	describe('rendering', () => {
		describe('initial state', () => {
			it('is rendered', () => {
				const component = renderer.create(<NewFilm />);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});
			it('is rendered correctly', () => {
				const { container } = render(<NewFilm />);
				expect(container.firstChild).toBeTruthy();
			});
		});
	});
});
