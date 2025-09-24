import React from 'react';
import { render } from '@testing-library/react';
import renderer from 'react-test-renderer';
import FilmList from './FilmList';

describe('FilmList', () => {
	global.requestAnimationFrame = callback => {
		setTimeout(callback, 0);
	};

	describe('rendering', () => {
		describe('initial state', () => {
			it('is rendered', () => {
				const component = renderer.create(<FilmList />);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});

			it('is rendered correctly', () => {
				const { container } = render(<FilmList />);
				expect(container.firstChild).toBeTruthy();
			});
		});
	});
});
