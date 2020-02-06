import React from 'react';
import NoMatch from './NoMatch';

describe('No Match Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const wrapper = shallow(<NoMatch />);
			expect(wrapper).toMatchSnapshot();
		});
	});
});
