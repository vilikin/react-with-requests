import _ from 'lodash';
import Request from './Request';

export default class RequestStateHandler {
  constructor() {
    this.state = {
      requests: [],
    };

    this.stateChangeListeners = [];
    this.lastStateChangeListenerId = 0;
  }

  getCurrentState = () => _.cloneDeep(this.state);

  findRequestById = id => _.find(this.state.requests, { id });

  addStateChangeListener = (callback) => {
    this.stateChangeListeners.push({
      callback,
      id: ++this.lastStateChangeListenerId,
    });

    return this.lastStateChangeListenerId;
  }

  removeStateChangeListener = (id) => {
    _.remove(this.stateChangeListeners, listener => listener.id === id);
  }

  callStateChangeListeners = () => {
    _.each(this.stateChangeListeners, listener => listener.callback(this.getCurrentState));
  }

  completeRequest = (id, result, error) => {
    const request = this.findRequestById(id);

    _.merge(request, {
      result,
      error,
      loading: false,
      finishedAt: new Date(),
    });

    this.callStateChangeListeners();
  }

  appendRequest = (requestInstance) => {
    const id = _.uniqueId();

    this.state.requests.push({
      id,
      requestInstance,
      result: null,
      loading: true,
      error: null,
      startedAt: new Date(),
      finishedAt: null,
    });

    this.callStateChangeListeners();

    return id;
  }

  makeRequest = (requestInstance) => {
    if (!(requestInstance instanceof Request)) throw new Error('Expected instance of Request');

    const id = this.appendRequest(requestInstance);

    const executeRequest = async () => {
      try {
        const result = await requestInstance.execute();
        this.completeRequest(id, result, null);

        return result;
      } catch (error) {
        this.completeRequest(id, null, error);
        throw error;
      }
    };

    return {
      id,
      promise: executeRequest(),
    };
  }
}
