'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Request = require('./Request');

var _Request2 = _interopRequireDefault(_Request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RequestStateHandler = function RequestStateHandler() {
  var _this = this;

  _classCallCheck(this, RequestStateHandler);

  this.getCurrentState = function () {
    return _lodash2.default.cloneDeep(_this.state.requests);
  };

  this.findRequestById = function (id) {
    return _lodash2.default.find(_this.state.requests, { id: id });
  };

  this.getExistingRequest = function (instance) {
    return _lodash2.default.find(_this.state.requests, function (_ref) {
      var requestInstance = _ref.requestInstance;
      return requestInstance.equals(instance);
    });
  };

  this.addStateChangeListener = function (callback) {
    _this.stateChangeListeners.push({
      callback: callback,
      id: ++_this.lastStateChangeListenerId
    });

    return _this.lastStateChangeListenerId;
  };

  this.removeStateChangeListener = function (id) {
    _lodash2.default.remove(_this.stateChangeListeners, function (listener) {
      return listener.id === id;
    });
  };

  this.callStateChangeListeners = function () {
    _lodash2.default.each(_this.stateChangeListeners, function (listener) {
      return listener.callback(_this.getCurrentState());
    });
  };

  this.completeRequest = function (id, result, error) {
    var request = _this.findRequestById(id);

    _lodash2.default.merge(request, {
      result: result,
      error: error,
      loading: false,
      finishedAt: new Date()
    });

    _this.callStateChangeListeners();
  };

  this.appendRequest = function (requestInstance) {
    var id = _lodash2.default.uniqueId();

    var request = {
      id: id,
      requestInstance: requestInstance,
      result: null,
      loading: true,
      error: null,
      startedAt: new Date(),
      finishedAt: null
    };

    _this.state.requests.push(request);

    _this.callStateChangeListeners();

    return _lodash2.default.cloneDeep(request);
  };

  this.makeRequest = function (requestInstance) {
    if (!(requestInstance instanceof _Request2.default)) throw new Error('Expected instance of Request');
    var config = requestInstance.getConfig();

    var request = _this.appendRequest(requestInstance);

    return _extends({}, request, {
      promise: new Promise(function (resolve, reject) {
        requestInstance.execute().then(function (result) {
          _this.completeRequest(request.id, result, null);
          resolve(result);
        }).catch(function (originalError) {
          var error = config.transformError ? config.transformError(originalError) : originalError;

          _this.completeRequest(request.id, null, error);
          reject(error);
        });
      })
    });
  };

  this.makeMultipleRequests = function (requestInstances) {
    var requests = _lodash2.default.reduce(requestInstances, function (result, requestInstance) {
      var request = _this.makeRequest(requestInstance);
      request.promise.catch(function (err) {
        console.error('Caught error with request #' + request.id + ': ' + err);
      });
      result.push(request);
      return result;
    }, []);

    return requests;
  };

  this.state = {
    requests: []
  };

  this.stateChangeListeners = [];
  this.lastStateChangeListenerId = 0;

  // TODO Remove this
  window.reqstate = this;
}

// TODO modify state to only contain an array if nothing else needed
;

exports.default = RequestStateHandler;