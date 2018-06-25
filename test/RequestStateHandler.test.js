import _ from 'lodash';
import RequestStateHandler from '../src/RequestStateHandler';
import Request from '../src/Request';

const mockRequestSuccess = new Request({
  request: async () => ({ test: true }),
});

const mockRequestFail = new Request({
  request: async () => {
    throw new Error('Oops');
  },
});

const mockRequestNoop = new Request({
  request: () => {},
});

let requestStateHandler;

describe('RequestStateHandler', () => {
  beforeEach(() => {
    requestStateHandler = new RequestStateHandler();
  });

  test('.makeRequest() should only accept a Request instance', () => {
    expect(() => requestStateHandler.makeRequest({})).toThrowError();
    expect(() => requestStateHandler.makeRequest(mockRequestSuccess)).not.toThrowError();
  });

  test('.makeRequest() should generate unique id for requests', async () => {
    const requests = [];

    _.times(100, () => requests.push(requestStateHandler.makeRequest(mockRequestNoop)));
    expect(_.uniqBy(requests, req => req.id).length).toBe(100);
  });

  test('.makeRequest() should resolve promises correctly', async () => {
    const req1 = requestStateHandler.makeRequest(mockRequestSuccess);
    const req2 = requestStateHandler.makeRequest(mockRequestFail);

    expect(req1.promise).resolves.toEqual({ test: true });

    expect(req2.promise).resolves.toThrowError();
  });

  test('.makeRequest() should handle lifecycle of a successful request', async () => {
    const stateInitial = requestStateHandler.getCurrentState();
    expect(stateInitial).toEqual([]);

    const req = requestStateHandler.makeRequest(mockRequestSuccess);
    const stateWhileLoading = requestStateHandler.getCurrentState()[0];

    expect(stateWhileLoading.loading).toBe(true);
    expect(stateWhileLoading.error).toBeNull();
    expect(stateWhileLoading.result).toBeNull();

    const result = await req.promise;
    const stateFinished = requestStateHandler.getCurrentState()[0];

    expect(stateFinished.loading).toBe(false);
    expect(stateFinished.error).toBeNull();
    expect(stateFinished.result).toEqual(result);
  });

  test('.makeRequest() should update status of a failed request', async () => {
    const req = requestStateHandler.makeRequest(mockRequestFail);

    try {
      await req.promise;
    } catch (err) {
      const stateFinished = requestStateHandler.getCurrentState()[0];

      expect(stateFinished.loading).toBe(false);
      expect(stateFinished.error).toEqual(err);
      expect(stateFinished.result).toBeNull();
    }
  });

  test('.makeRequest() should transform error when transform function is provided', async () => {
    const request = new Request({
      request: async () => { throw new Error('404'); },
      transformError: (originalError) => {
        if (originalError.message === '404') {
          return 'Not found';
        }

        return 'Unknown';
      },
    });

    const req = requestStateHandler.makeRequest(request);

    try {
      await req.promise;
    } catch (err) {
      const stateFinished = requestStateHandler.getCurrentState()[0];

      expect(stateFinished.error).toEqual('Not found');
    }
  });

  test('.addStateChangeListener() should subscribe to state changes', async () => {
    const mockListener = jest.fn();
    const listenerId = requestStateHandler.addStateChangeListener(mockListener);
    expect(listenerId).toBe(1);

    const { promise } = requestStateHandler.makeRequest(mockRequestSuccess);
    expect(mockListener).toHaveBeenCalledTimes(1);

    await promise;
    expect(mockListener).toHaveBeenCalledTimes(2);
  });

  test('.removeStateChangeListener() should unsubscribe from state changes', async () => {
    const mockListener1 = jest.fn();
    const mockListener2 = jest.fn();

    const listenerId1 = requestStateHandler.addStateChangeListener(mockListener1);
    requestStateHandler.addStateChangeListener(mockListener2);

    const { promise } = requestStateHandler.makeRequest(mockRequestSuccess);
    expect(mockListener1).toHaveBeenCalledTimes(1);
    expect(mockListener2).toHaveBeenCalledTimes(1);

    requestStateHandler.removeStateChangeListener(listenerId1);

    await promise;
    expect(mockListener1).toHaveBeenCalledTimes(1);
    expect(mockListener2).toHaveBeenCalledTimes(2);
  });
});
