import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { shallow } from 'enzyme';
import Hero from './Hero';

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
				const wrapper = shallow(
					<Hero title={title} bechdelResults={bechdelResults} images={images} />
				);
				expect(wrapper).toMatchSnapshot();
			});
			it('is rendered correctly', () => {
				expect(wrapper).toHaveLength(1);
			});
			it('should not have any inital props', () => {
				const initialProps = inst.props;
				const expectedProps = {
					children: (
						<Hero
							title={title}
							bechdelResults={bechdelResults}
							images={images}
						/>
					),
				};
				expect(initialProps).toMatchObject(expectedProps);
			});
		});
	});
});
