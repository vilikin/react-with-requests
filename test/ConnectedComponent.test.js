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
    const mapRequestsToProps = () => ([
      {
        request: new Request({
          request: async () => 'my success msg',
        }),
        statusProp: 'test',
        requestProp: 'doTest',
      },
    ]);

    const component = mount(<MockComponentTree mrtp={mapRequestsToProps} />);

    const expectedInitialState = createExpectedState('test', null, true, null);
    const expectedEndState = createExpectedState('test', 'my success msg', false, null);

    expect(JSON.parse(component.text())).toEqual(expectedInitialState);

    setTimeout(() => {
      expect(JSON.parse(component.text())).toEqual(expectedEndState);
      done();
    }, 0);
  });

  test('should handle lifecycle of a failing request', (done) => {
    const mapRequestsToProps = () => ([
      {
        request: new Request({
          request: async () => {
            // eslint-disable-next-line no-throw-literal
            throw 'my error msg';
          },
        }),
        statusProp: 'test',
        requestProp: 'doTest',
      },
    ]);

    const component = mount(<MockComponentTree mrtp={mapRequestsToProps} />);

    const expectedInitialState = createExpectedState('test', null, true, null);
    const expectedEndState = createExpectedState('test', null, false, 'my error msg');

    expect(JSON.parse(component.text())).toEqual(expectedInitialState);

    setTimeout(() => {
      expect(JSON.parse(component.text())).toEqual(expectedEndState);
      done();
    }, 0);
  });

  test('should update requests when props change', (done) => {
    const mockRequest = new Request({
      request: async id => `result ${id}`,
    });

    const mapRequestsToProps = props => ([
      {
        request: mockRequest.withParams(props.id),
        statusProp: 'test',
        requestProp: 'doTest',
      },
    ]);

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
    expect(JSON.parse(component.text())).toEqual(expectedState);

    setTimeout(() => {
      expectedState = createExpectedState('test', 'result 1', false, null);
      expect(JSON.parse(component.text())).toEqual(expectedState);

      component.setProps({ id: 2 });
      expectedState = createExpectedState('test', null, true, null);
      expect(JSON.parse(component.text())).toEqual(expectedState);
    }, 0);

    setTimeout(() => {
      expectedState = createExpectedState('test', 'result 2', false, null);
      expect(JSON.parse(component.text())).toEqual(expectedState);
      done();
    }, 50);
  });
});

