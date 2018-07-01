'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _RequestStateConsumer = require('../RequestStateConsumer');

var _RequestStateConsumer2 = _interopRequireDefault(_RequestStateConsumer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function withRequests(requests) {
  return function (Component) {
    var ComponentWithRequests = function ComponentWithRequests(props) {
      return _react2.default.createElement(
        _RequestStateConsumer2.default,
        _extends({ requests: requests }, props),
        function (requestStateProps) {
          var mergedProps = _extends({}, props, requestStateProps);

          return _react2.default.createElement(Component, mergedProps);
        }
      );
    };

    return ComponentWithRequests;
  };
}

exports.default = withRequests;