import React from 'react';
import Hero from './Hero';

describe('Hero Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const wrapper = shallow(<Hero />);
			expect(wrapper).toMatchSnapshot();
		});
	});
});
