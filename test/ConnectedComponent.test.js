import Enzyme, { mount } from 'enzyme';
import React from 'react';
import Adapter from './util/ReactSixteenAdapter';

import ConnectionProvider from '../src/ConnectionProvider';
import ConnectedComponent from '../src/ConnectedComponent';
import Request from '../src/Request';

Enzyme.configure({ adapter: new Adapter() });

/* UTILS */

const createExpectedState = (name, result, loading, error) => ({
  [name]: {
    result,
    loading,
    error,
  },
});

// eslint-disable-next-line react/prop-types
const MockComponentTree = ({ mrtp }) => (
  <ConnectionProvider>
    <ConnectedComponent requests={mrtp}>
      {params => <div>{JSON.stringify(params)}</div>}
    </ConnectedComponent>
  </ConnectionProvider>
);

/* TESTS */

describe('ConnectedComponent', () => {
  test('should handle lifecycle of a successful request', (done) => {
    const mockRequest = new Request({
      request: async () => 'my success msg',
    });

    const mapRequestsToProps = () => ({
      test: mockRequest,
    });

    const component = mount(<MockComponentTree mrtp={mapRequestsToProps} />);

    const expectedInitialState = createExpectedState('test', null, true, null);
    const expectedEndState = createExpectedState('test', 'my success msg', false, null);

    expect(component).toHaveText(JSON.stringify(expectedInitialState));

    setTimeout(() => {
      expect(component).toHaveText(JSON.stringify(expectedEndState));
      done();
    }, 0);
  });

  test('should handle lifecycle of a failing request', (done) => {
    const mockRequest = new Request({
      request: async () => {
        // eslint-disable-next-line no-throw-literal
        throw 'my error msg';
      },
    });

    const mapRequestsToProps = () => ({
      test: mockRequest,
    });

    const component = mount(<MockComponentTree mrtp={mapRequestsToProps} />);

    const expectedInitialState = createExpectedState('test', null, true, null);
    const expectedEndState = createExpectedState('test', null, false, 'my error msg');

    expect(component).toHaveText(JSON.stringify(expectedInitialState));

    setTimeout(() => {
      expect(component).toHaveText(JSON.stringify(expectedEndState));
      done();
    }, 0);
  });

  test('should update requests when props change', (done) => {
    const mockRequest = new Request({
      request: async id => `result ${id}`,
    });

    const mapRequestsToProps = props => ({
      test: mockRequest.withParams(props.id),
    });

    // eslint-disable-next-line react/prop-types
    const App = ({ id }) => (
      <ConnectionProvider>
        <ConnectedComponent requests={mapRequestsToProps} id={id}>
          {params => <div>{JSON.stringify(params)}</div>}
        </ConnectedComponent>
      </ConnectionProvider>
    );

    const component = mount(<App id={1} />);

    let expectedState = createExpectedState('test', null, true, null);
    expect(component).toHaveText(JSON.stringify(expectedState));

    setTimeout(() => {
      expectedState = createExpectedState('test', 'result 1', false, null);
      expect(component).toHaveText(JSON.stringify(expectedState));

      component.setProps({ id: 2 });
      expectedState = createExpectedState('test', null, true, null);
      expect(component).toHaveText(JSON.stringify(expectedState));
    }, 0);

    setTimeout(() => {
      expectedState = createExpectedState('test', 'result 2', false, null);
      expect(component).toHaveText(JSON.stringify(expectedState));
      done();
    }, 50);
  });
});

