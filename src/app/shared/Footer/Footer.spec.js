import React from 'react';
import Footer from './Footer';

describe('Footer Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const wrapper = shallow(<Footer />);
			expect(wrapper).toMatchSnapshot();
		});
	});
});
