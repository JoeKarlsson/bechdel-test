import React from 'react';
import { mount, shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';

import FilmContainer from './FilmContainer';
import mockAPI from './__mocks__/mockReply.json';

jest.mock('../../helper/api');

configure({ adapter: new Adapter() });

describe('FilmContainer', () => {
	const router = {
		params: {
			id: '1234',
		},
	};

	describe('rendering', () => {
		describe('initial state', () => {
			it('is rendered correctly', async () => {
				fetch.mockResponseOnce(JSON.stringify(mockAPI));
				let wrapper = shallow(<FilmContainer match={router} />);

				expect(wrapper).toHaveLength(1);
			});
			it('should not have any inital props', async () => {
				fetch.mockResponseOnce(JSON.stringify(mockAPI));
				const wrapper = shallow(<FilmContainer match={router} />);

				await wrapper.instance().componentDidMount();
				const inst = wrapper.instance();
				const initialProps = inst.props;
				const expectedProps = {
					match: {
						params: {
							id: '1234',
						},
					},
				};
				expect(initialProps).toMatchObject(expectedProps);
			});
			it('should not have any inital state', async () => {
				fetch.mockResponseOnce(JSON.stringify(mockAPI));
				const wrapper = shallow(<FilmContainer match={router} />);

				await wrapper.instance().componentDidMount();
				const inst = wrapper.instance();
				const initialState = inst.state;
				const expectedState = {
					film: mockAPI,
					loading: false,
				};
				expect(initialState).toMatchObject(expectedState);
			});
		});
	});
});
