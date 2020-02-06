import React from 'react';
import ApiDocs from './ApiDocs';

describe('Api Docs Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const wrapper = shallow(<ApiDocs />);
			expect(wrapper).toMatchSnapshot();
		});
	});
});
