'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _reactConnectContext = require('react-connect-context');

var _joiBrowser = require('joi-browser');

var _joiBrowser2 = _interopRequireDefault(_joiBrowser);

var _Request = require('./Request');

var _Request2 = _interopRequireDefault(_Request);

var _RequestStateContext = require('./RequestStateContext');

var _RequestStateHandler = require('./RequestStateHandler');

var _RequestStateHandler2 = _interopRequireDefault(_RequestStateHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // eslint-disable-line


var _getRequestStateConte = (0, _RequestStateContext.getRequestStateContext)(),
    Consumer = _getRequestStateConte.Consumer;

var requestMappingSchema = _joiBrowser2.default.object({
  request: _joiBrowser2.default.object().type(_Request2.default).required(),
  statusProp: _joiBrowser2.default.string().required(),
  requestProp: _joiBrowser2.default.string().required(),
  executeOnMount: _joiBrowser2.default.boolean().required()
});

var defaultMappingValues = {
  executeOnMount: true
};

var compareRequests = function compareRequests(requestInstances1, requestInstances2) {
  return _lodash2.default.differenceWith(requestInstances1, requestInstances2, function (req1, req2) {
    return req1.equals(req2);
  });
};

var RequestStateConsumer = function (_React$Component) {
  _inherits(RequestStateConsumer, _React$Component);

  function RequestStateConsumer(props) {
    _classCallCheck(this, RequestStateConsumer);

    var _this = _possibleConstructorReturn(this, (RequestStateConsumer.__proto__ || Object.getPrototypeOf(RequestStateConsumer)).call(this, props));

    _initialiseProps.call(_this);

    _this.state = {
      requests: [],
      unmappedRequests: []
    };

    var requestMapping = _this.getRequestMapping(_this.props);
    _this.componentWillReceiveRequestMapping(requestMapping, true);
    return _this;
  }

  _createClass(RequestStateConsumer, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var requestMapping = this.getRequestMapping(nextProps);
      this.componentWillReceiveRequestMapping(requestMapping, false);
    }
  }, {
    key: 'render',
    value: function render() {
      var statusProps = this.getStatusProps();
      var requestProps = this.getRequestProps();

      var passPropsToChildren = _extends({}, statusProps, requestProps, {
        executeRequest: this.executeUnmappedRequest
      });

      return this.props.children(passPropsToChildren);
    }
  }]);

  return RequestStateConsumer;
}(_react2.default.Component);

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.getRequestMapping = function (props) {
    if (!_lodash2.default.isFunction(props.requests)) {
      throw new Error('Request mapping has to be a function that returns an array');
    }

    var requestMapping = props.requests(props);
    if (!_lodash2.default.isArray(requestMapping)) {
      throw new Error('Request mapping function should return an array');
    }

    var requestMappingWithDefaults = _lodash2.default.map(requestMapping, function (mapping) {
      var mappingObject = mapping instanceof _Request2.default ? { request: mapping } : mapping;

      var config = mappingObject.request.getConfig();

      // use config as a base, merge properties from global defaults
      var defaultProperties = _lodash2.default.defaults(config.defaultMapping, defaultMappingValues);

      // use directly defined mapping values as base, merge defaults from config and global defaults
      var mappingWithDefaults = _lodash2.default.defaults(mappingObject, defaultProperties);

      _joiBrowser2.default.assert(mappingWithDefaults, requestMappingSchema);

      return mappingWithDefaults;
    });

    return requestMappingWithDefaults;
  };

  this.updateLocalRequestState = function (newRequestState, updateStateDirectly) {
    if (updateStateDirectly) {
      _this2.state.requests = newRequestState;
    } else {
      _this2.setState({
        requests: newRequestState
      });
    }
  };

  this.componentWillReceiveRequestMapping = function (nextRequestMapping, updateStateDirectly) {
    var previousRequestInstances = _lodash2.default.map(_this2.state.requests, 'requestInstance');

    var nextRequestInstances = _lodash2.default.chain(nextRequestMapping).filter({ executeOnMount: true }).map('request').value();

    var nextRequestInstancesUnfiltered = _lodash2.default.map(nextRequestMapping, 'request');

    var addedRequestInstances = compareRequests(nextRequestInstances, previousRequestInstances);

    var removedRequestInstances = compareRequests(previousRequestInstances, nextRequestInstancesUnfiltered);

    var remainingRequests = _this2.state.requests.filter(function (_ref) {
      var requestInstance = _ref.requestInstance;
      return !removedRequestInstances.includes(requestInstance);
    });

    _this2.executeRequests(addedRequestInstances, remainingRequests, updateStateDirectly);
  };

  this.executeRequests = function (requestInstances, remainingRequests, updateStateDirectly) {
    var requestStateHandler = _this2.props.__requestStateHandler__;

    var executedRequests = requestStateHandler.makeMultipleRequests(requestInstances);

    var executedRequestsStripped = _lodash2.default.map(executedRequests, function (executedRequest) {
      return _lodash2.default.pick(executedRequest, 'id', 'requestInstance');
    });

    _this2.updateLocalRequestState([].concat(_toConsumableArray(executedRequestsStripped), _toConsumableArray(remainingRequests)), updateStateDirectly);

    return executedRequests;
  };

  this.executeUnmappedRequest = function (requestInstance, statusProp) {
    var requestStateHandler = _this2.props.__requestStateHandler__;

    var _requestStateHandler$ = requestStateHandler.makeRequest(requestInstance),
        promise = _requestStateHandler$.promise,
        id = _requestStateHandler$.id;

    if (_lodash2.default.isString(statusProp) && !_lodash2.default.isEmpty(statusProp)) {
      _this2.setState({
        unmappedRequests: [].concat(_toConsumableArray(_this2.state.unmappedRequests), [{
          id: id,
          statusProp: statusProp
        }])
      });
    }

    return promise;
  };

  this.areAllRequestsInContext = function () {
    var requestsFromState = _this2.state.requests;
    var requestsFromContext = _this2.props.__requestState__;

    return _lodash2.default.every(requestsFromState, function (_ref2) {
      var id = _ref2.id;
      return _lodash2.default.some(requestsFromContext, { id: id });
    });
  };

  this.getRequestsFromContext = function () {
    var allRequestsInContext = _this2.areAllRequestsInContext();

    if (!allRequestsInContext) {
      return _this2.props.__requestStateHandler__.getCurrentState();
    }

    return _this2.props.__requestState__;
  };

  this.mapContextStateToRequests = function (requests) {
    var requestsFromContext = _this2.getRequestsFromContext();

    return _lodash2.default.chain(requestsFromContext).map(function (requestFromContext) {
      var match = _lodash2.default.find(requests, { id: requestFromContext.id });
      return match ? _lodash2.default.assign(match, { contextState: requestFromContext }) : null;
    }).filter(_lodash2.default.isObject).value();
  };

  this.mergeRequestsWithMapping = function (requestsFromContext) {
    var requestMapping = _this2.getRequestMapping(_this2.props);

    return _lodash2.default.map(requestMapping, function (requestDefinition) {
      var match = _lodash2.default.find(requestsFromContext, function (_ref3) {
        var requestInstance = _ref3.requestInstance;
        return requestInstance.equals(requestDefinition.request);
      });

      return _extends({
        mapping: requestDefinition
      }, match);
    });
  };

  this.getUnmappedRequestsByKey = function (key) {
    var unmappedRequests = _this2.state.unmappedRequests;

    var unmappedRequestsWithContextState = _this2.mapContextStateToRequests(unmappedRequests);

    return _lodash2.default.keyBy(unmappedRequestsWithContextState, key);
  };

  this.getRequestsByKey = function (key) {
    var requestsWithContextState = _this2.mapContextStateToRequests(_this2.state.requests);
    var requests = _this2.mergeRequestsWithMapping(requestsWithContextState);

    return _lodash2.default.chain(requests).keyBy(function (request) {
      return request.mapping[key];
    }).value();
  };

  this.getStatusProps = function () {
    var requestsByStatusProp = _this2.getRequestsByKey('statusProp');
    var unmappedRequestsByStatusProp = _this2.getUnmappedRequestsByKey('statusProp');

    return _lodash2.default.chain(unmappedRequestsByStatusProp).merge(requestsByStatusProp).mapValues(function (_ref4) {
      var contextState = _ref4.contextState;
      return contextState ? _lodash2.default.pick(contextState, 'error', 'loading', 'result') : { error: null, loading: false, result: null };
    }).value();
  };

  this.getRequestProps = function () {
    var requestsByRequestProp = _this2.getRequestsByKey('requestProp');

    return _lodash2.default.mapValues(requestsByRequestProp, function (_ref5) {
      var mapping = _ref5.mapping;
      return function () {
        var requests = _this2.state.requests;


        var remainingRequests = _lodash2.default.filter(requests, function (request) {
          return !request.requestInstance.equals(mapping.request);
        });

        var executedRequests = _this2.executeRequests([mapping.request], remainingRequests, false);

        var _$first = _lodash2.default.first(executedRequests),
            promise = _$first.promise;

        return promise;
      };
    });
  };
};

RequestStateConsumer.propTypes = {
  children: _propTypes2.default.func.isRequired,

  // eslint-disable-next-line react/no-unused-prop-types
  requests: _propTypes2.default.func.isRequired,

  __requestState__: _propTypes2.default.arrayOf(_propTypes2.default.object).isRequired,

  __requestStateHandler__: _propTypes2.default.instanceOf(_RequestStateHandler2.default).isRequired
};

exports.default = (0, _reactConnectContext.connectContext)(Consumer)(RequestStateConsumer);