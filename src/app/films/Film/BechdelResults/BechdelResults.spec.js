import React from 'react';
import { render } from '@testing-library/react';
import renderer from 'react-test-renderer';
import BechdelResults from './BechdelResults';

describe('BechdelResults', () => {
	global.requestAnimationFrame = (callback) => {
		setTimeout(callback, 0);
	};

	describe('rendering', () => {
		describe('initial state', () => {
			it('is rendered', () => {
				const component = renderer.create(<BechdelResults />);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});

			it('is rendered correctly', () => {
				const { container } = render(<BechdelResults />);
				expect(container.firstChild).toBeTruthy();
			});

			it('should be selectable by the class `BechdelResults`', () => {
				const { container } = render(<BechdelResults />);
				expect(container.querySelector('.BechdelResults')).toBeTruthy();
			});

			it('should mount in the full DOM', () => {
				const { container } = render(<BechdelResults />);
				expect(container.querySelector('.BechdelResults')).toBeTruthy();
			});
		});
	});
});
