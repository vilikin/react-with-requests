import Enzyme, { mount } from 'enzyme';
import React from 'react';
import Adapter from './util/ReactSixteenAdapter';

import ConnectionProvider from '../src/ConnectionProvider';
import ConnectedComponent from '../src/ConnectedComponent';
import Request from '../src/Request';

Enzyme.configure({ adapter: new Adapter() });

/* UTILS */

const createExpectedState = (result, loading, error) => ({
  result,
  loading,
  error,
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

    const expectedInitialState = createExpectedState(null, true, null);
    const expectedEndState = createExpectedState('my success msg', false, null);

    const actualInitialState = JSON.parse(component.text()).test;
    expect(actualInitialState).toEqual(expectedInitialState);

    setTimeout(() => {
      const actualEndState = JSON.parse(component.text()).test;
      expect(actualEndState).toEqual(expectedEndState);
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

    const expectedInitialState = createExpectedState(null, true, null);
    const expectedEndState = createExpectedState(null, false, 'my error msg');

    const actualInitialState = JSON.parse(component.text()).test;
    expect(actualInitialState).toEqual(expectedInitialState);

    setTimeout(() => {
      const actualEndState = JSON.parse(component.text()).test;
      expect(actualEndState).toEqual(expectedEndState);
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
    let expectedState = createExpectedState(null, true, null);
    let actualState = JSON.parse(component.text()).test;
    expect(actualState).toEqual(expectedState);

    setTimeout(() => {
      expectedState = createExpectedState('result 1', false, null);
      actualState = JSON.parse(component.text()).test;
      expect(actualState).toEqual(expectedState);

      component.setProps({ id: 2 });
      expectedState = createExpectedState(null, true, null);
      actualState = JSON.parse(component.text()).test;
      expect(actualState).toEqual(expectedState);
    }, 0);

    setTimeout(() => {
      expectedState = createExpectedState('result 2', false, null);
      actualState = JSON.parse(component.text()).test;
      expect(actualState).toEqual(expectedState);
      done();
    }, 50);
  });

  test('should use default prop mappings from config if no prop mappings specified', () => {
    const mapRequestsToProps = () => ([
      {
        request: new Request({
          request: async () => {
            // eslint-disable-next-line no-throw-literal
            throw 'my error msg';
          },
          defaultMapping: {
            statusProp: 'test',
            requestProp: 'doTest',
          },
        }),
      },
    ]);

    const component = mount(<MockComponentTree mrtp={mapRequestsToProps} />);

    const actualState = JSON.parse(component.text());
    expect(actualState).toHaveProperty('test');
    expect(actualState).toHaveProperty('doTest');
  });
});

