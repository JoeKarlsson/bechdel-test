import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import FilmItem from './FilmItem';

configure({ adapter: new Adapter() });

describe('FilmItem', () => {
	let wrapper;

	global.requestAnimationFrame = callback => {
		setTimeout(callback, 0);
	};

	beforeEach(() => {
		wrapper = shallow(<FilmItem />);
	});

	describe('rendering', () => {
		describe('initial state', () => {
			it('is rendered correctly', () => {
				expect(wrapper).toHaveLength(1);
			});
		});
	});
});
