import Enzyme, { mount } from 'enzyme';
import React from 'react';
import * as _ from 'lodash';
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
const MockComponentTree = ({ mrtp, render }) => (
  <ConnectionProvider>
    <ConnectedComponent requests={mrtp}>
      {render || (params => <div>{JSON.stringify(params)}</div>)}
    </ConnectedComponent>
  </ConnectionProvider>
);

const lastCalledWith = mockRender => _.chain(mockRender.mock.calls)
  .last()
  .first()
  .value();

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

    const mockRender = jest.fn(() => null);
    mount(<MockComponentTree mrtp={mapRequestsToProps} render={mockRender} />);

    const expectedInitialState = createExpectedState(null, true, null);
    const expectedEndState = createExpectedState('my success msg', false, null);

    expect(lastCalledWith(mockRender).test).toEqual(expectedInitialState);

    setTimeout(() => {
      expect(lastCalledWith(mockRender).test).toEqual(expectedEndState);
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
    const mockRender = jest.fn(() => null);
    mount(<MockComponentTree mrtp={mapRequestsToProps} render={mockRender} />);

    const expectedInitialState = createExpectedState(null, true, null);
    const expectedEndState = createExpectedState(null, false, 'my error msg');

    expect(lastCalledWith(mockRender).test).toEqual(expectedInitialState);

    setTimeout(() => {
      expect(lastCalledWith(mockRender).test).toEqual(expectedEndState);
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

    const mockRender = jest.fn(() => null);

    // eslint-disable-next-line react/prop-types
    const App = ({ id }) => (
      <ConnectionProvider>
        <ConnectedComponent requests={mapRequestsToProps} id={id}>
          {mockRender}
        </ConnectedComponent>
      </ConnectionProvider>
    );

    const component = mount(<App id={1} />);
    let expectedState = createExpectedState(null, true, null);
    expect(lastCalledWith(mockRender).test).toEqual(expectedState);

    setTimeout(() => {
      expectedState = createExpectedState('result 1', false, null);
      expect(lastCalledWith(mockRender).test).toEqual(expectedState);

      component.setProps({ id: 2 });
      expectedState = createExpectedState(null, true, null);
      expect(lastCalledWith(mockRender).test).toEqual(expectedState);
    }, 0);

    setTimeout(() => {
      expectedState = createExpectedState('result 2', false, null);
      expect(lastCalledWith(mockRender).test).toEqual(expectedState);
      done();
    }, 50);
  });

  test('should make request again when request prop is called', (done) => {
    const mapRequestsToProps = () => ([
      {
        request: new Request({
          request: async () => 'result',
          defaultMapping: {
            statusProp: 'test',
            requestProp: 'doTest',
          },
        }),
      },
    ]);

    const mockRender = jest.fn(() => null);
    mount(<MockComponentTree mrtp={mapRequestsToProps} render={mockRender} />);
    let expectedState;

    setTimeout(() => {
      expectedState = createExpectedState('result', false, null);
      expect(lastCalledWith(mockRender).test).toEqual(expectedState);
      const promise = lastCalledWith(mockRender).doTest();
      expectedState = createExpectedState(null, true, null);
      expect(lastCalledWith(mockRender).test).toEqual(expectedState);

      promise.then((result) => {
        expect(result).toEqual('result');
        expectedState = createExpectedState('result', false, null);
        expect(lastCalledWith(mockRender).test).toEqual(expectedState);
        done();
      });
    }, 0);
  });

  test('should allow making unmapped requests with status prop', (done) => {
    const mockRender = jest.fn(() => null);
    mount(<MockComponentTree mrtp={() => []} render={mockRender} />);
    const props = lastCalledWith(mockRender);

    expect(props).toHaveProperty('executeRequest');
    props.executeRequest(new Request({
      request: async () => 'result',
    }), 'test');

    let expectedState = createExpectedState(null, true, null);
    expect(lastCalledWith(mockRender).test).toEqual(expectedState);

    setTimeout(() => {
      expectedState = createExpectedState('result', false, null);
      expect(lastCalledWith(mockRender).test).toEqual(expectedState);
      done();
    }, 0);
  });

  test('should allow making unmapped requests without status prop', (done) => {
    const mockRender = jest.fn(() => null);
    mount(<MockComponentTree mrtp={() => []} render={mockRender} />);
    const props = lastCalledWith(mockRender);

    expect(props).toHaveProperty('executeRequest');
    const promise = props.executeRequest(new Request({
      request: async () => 'result',
    }));

    promise.then((result) => {
      expect(result).toEqual('result');
      done();
    });
  });

  test('should use default prop mappings from config if no prop mappings specified', () => {
    const mapRequestsToProps = () => ([
      {
        request: new Request({
          request: async () => 'result',
          defaultMapping: {
            statusProp: 'test',
            requestProp: 'doTest',
          },
        }),
      },
    ]);

    const mockRender = jest.fn(() => null);
    mount(<MockComponentTree mrtp={mapRequestsToProps} render={mockRender} />);

    expect(lastCalledWith(mockRender)).toHaveProperty('doTest');
    expect(lastCalledWith(mockRender)).toHaveProperty('test');
  });
});
