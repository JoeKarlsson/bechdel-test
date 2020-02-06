import React from 'react';
import Privacy from './Privacy';

describe('Privacy Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const wrapper = shallow(<Privacy />);
			expect(wrapper).toMatchSnapshot();
		});
	});
});
