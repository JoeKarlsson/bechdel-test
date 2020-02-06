import React from 'react';
import Home from './Home';

describe('Home Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const wrapper = shallow(<Home />);
			expect(wrapper).toMatchSnapshot();
		});
	});
});
