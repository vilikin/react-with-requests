import Request from '../src/Request';

const noop = async () => {};
const noopSync = () => {};

describe('Request', () => {
  test('should make sure that request function is called with correct params', async () => {
    const mockRequest = jest.fn();

    const exampleRequestUsingParams = new Request({
      request: mockRequest,
    });

    await exampleRequestUsingParams.withParams(1, 2).execute();

    expect(mockRequest).toBeCalledWith(1, 2);
  });

  test('should wrap sync functions into promises', async () => {
    const exampleRequest = new Request({
      request: noopSync,
    });

    const request = exampleRequest.execute();

    expect(request).toBeInstanceOf(Promise);
  });

  test('.equals() should know which requests', () => {
    const noopRequest = new Request({
      request: noopSync,
    });

    const noopRequestCopy = new Request({
      request: noopSync,
    });

    const asyncNoopRequest = new Request({
      request: noop,
    });

    const noopRequestWithParams = noopRequest.withParams(1, 2, 3);
    const noopRequestWithParamsCopy = noopRequest.withParams(1, 2, 3);

    const noopRequestWithObjectParam = noopRequest.withParams({ a: 1, b: 2 });
    const noopRequestWithShuffledObjectParam = noopRequest.withParams({ b: 2, a: 1 });

    expect(noopRequest.equals(noopRequestCopy)).toBe(true);
    expect(asyncNoopRequest.equals(noopRequest)).toBe(false);
    expect(noopRequestWithParams.equals(noopRequest)).toBe(false);
    expect(noopRequestWithParamsCopy.equals(noopRequestWithParams)).toBe(true);
    expect(noopRequestWithObjectParam.equals(noopRequestWithShuffledObjectParam)).toBe(true);
  });
});
