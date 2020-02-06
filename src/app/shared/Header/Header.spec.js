import React from 'react';
import Header from './Header';

describe('Header Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const wrapper = shallow(<Header />);
			expect(wrapper).toMatchSnapshot();
		});
	});
});
