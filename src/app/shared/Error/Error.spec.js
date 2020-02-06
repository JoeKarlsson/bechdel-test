import React from 'react';
import Error from './Error';

describe('Error Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const wrapper = shallow(<Error />);
			expect(wrapper).toMatchSnapshot();
		});
	});
});
