import React from 'react';
import About from './About';

describe('About Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const wrapper = shallow(<About />);
			expect(wrapper).toMatchSnapshot();
		});
	});
});
