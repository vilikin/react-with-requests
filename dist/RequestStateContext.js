'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRequestStateContext = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-line

var requestStateContext = void 0;

function getRequestStateContext() {
  if (requestStateContext) return requestStateContext;

  requestStateContext = _react2.default.createContext({});

  return requestStateContext;
}

exports.getRequestStateContext = getRequestStateContext;