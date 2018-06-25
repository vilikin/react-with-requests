import Enzyme, { mount } from 'enzyme';
import React from 'react';
import Adapter from './util/ReactSixteenAdapter';

import ConnectionProvider from '../src/ConnectionProvider';
import withRequests from '../src/util/withRequests';
import Request from '../src/Request';

Enzyme.configure({ adapter: new Adapter() });

/* TESTS */

describe('HOC created by withResources utility', () => {
  test('should provide props from ConnectedComponent to wrapped component', () => {
    const mapRequestsToProps = () => ([
      {
        request: new Request({
          request: async () => 'result',
        }),
        statusProp: 'test',
        requestProp: 'doTest',
      },
    ]);

    const MockComponent = props => (
      <div>
        {JSON.stringify(props)}
      </div>
    );

    const MockComponentWithRequests = withRequests(mapRequestsToProps)(MockComponent);

    const MockComponentTree = () => (
      <ConnectionProvider>
        <MockComponentWithRequests />
      </ConnectionProvider>
    );

    const tree = mount(<MockComponentTree />);

    const component = tree.find(MockComponentWithRequests);

    expect(component).toHaveText(JSON.stringify({
      test: {
        error: null,
        loading: true,
        result: null,
      },
    }));
  });

  test('should provide original props to wrapped component', () => {
    const mapRequestsToProps = () => ([
      {
        request: new Request({
          request: async () => 'result',
        }),
        statusProp: 'test',
        requestProp: 'doTest',
      },
    ]);

    const MockComponent = props => (
      <div>
        {JSON.stringify(props)}
      </div>
    );

    const MockComponentWithRequests = withRequests(mapRequestsToProps)(MockComponent);

    const MockComponentTree = () => (
      <ConnectionProvider>
        <MockComponentWithRequests id={1} />
      </ConnectionProvider>
    );

    const tree = mount(<MockComponentTree />);

    const component = tree.find(MockComponentWithRequests);

    expect(component).toHaveText(JSON.stringify({
      id: 1,
      test: {
        error: null,
        loading: true,
        result: null,
      },
    }));
  });
});
