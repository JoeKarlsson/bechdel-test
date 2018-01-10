import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Hero from './Hero';

configure({ adapter: new Adapter() });

describe('Hero', () => {
	let wrapper;
	let inst;
	const title = 'Boyhood';
	const bechdelResults = {
		pass: true,
		bechdelScore: 3,
	};
	const images = {};

	beforeEach(() => {
		wrapper = shallow(
			<MemoryRouter>
				<Hero title={title} bechdelResults={bechdelResults} images={images} />
			</MemoryRouter>
		);
		inst = wrapper.instance();
	});

	describe('rendering', () => {
		describe('initial state', () => {
			it('match the snapshot', () => {
				const component = renderer.create(
					<MemoryRouter>
						<Hero
							title={title}
							bechdelResults={bechdelResults}
							images={images}
						/>
					</MemoryRouter>
				);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});
			it('is rendered correctly', () => {
				expect(wrapper).toHaveLength(1);
			});
			it('should not have any inital props', () => {
				const initialProps = inst.props;
				const expectedProps = {
					children: <Hero />,
				};
				expect(initialProps).toMatchObject(expectedProps);
			});
			it('should not have any inital state', () => {
				const initialState = inst.state;
				const expectedState = {};
				expect(initialState).toMatchObject(expectedState);
			});
		});
	});
});
