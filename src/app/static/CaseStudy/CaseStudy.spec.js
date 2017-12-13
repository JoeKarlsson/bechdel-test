import React from 'react';
import renderer from 'react-test-renderer';
import {
	MemoryRouter,
} from 'react-router-dom';
import {
	shallow,
	configure,
} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import CaseStudy from './CaseStudy';

configure({ adapter: new Adapter() });

describe('CaseStudy Page', () => {
	let wrapper;

	beforeEach(() => {
		wrapper = shallow(
			<MemoryRouter>
				<CaseStudy />
			</MemoryRouter>,
		);
	});

	describe('rendering', () => {
		describe('initial state', () => {
			it('match the snapshot', () => {
				const component = renderer.create(
					<MemoryRouter>
						<CaseStudy />
					</MemoryRouter>,
				);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});
			it('should have correct inital instance', () => {
				const initialInstance = wrapper.dive().dive().instance();
				const expectedInstance = null;

				expect(initialInstance).toBe(expectedInstance);
			});
		});
	});
});
