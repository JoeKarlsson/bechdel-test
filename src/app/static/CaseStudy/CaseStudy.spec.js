import React from 'react';
import CaseStudy from './CaseStudy';

describe('Case Study Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const wrapper = shallow(<CaseStudy />);
			expect(wrapper).toMatchSnapshot();
		});
	});
});
