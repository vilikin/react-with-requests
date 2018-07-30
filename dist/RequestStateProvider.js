'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _RequestStateHandler = require('./RequestStateHandler');

var _RequestStateHandler2 = _interopRequireDefault(_RequestStateHandler);

var _RequestStateContext = require('./RequestStateContext');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // eslint-disable-line


var _getRequestStateConte = (0, _RequestStateContext.getRequestStateContext)(),
    Provider = _getRequestStateConte.Provider;

var RequestStateProvider = function (_Component) {
  _inherits(RequestStateProvider, _Component);

  function RequestStateProvider(props) {
    _classCallCheck(this, RequestStateProvider);

    var _this = _possibleConstructorReturn(this, (RequestStateProvider.__proto__ || Object.getPrototypeOf(RequestStateProvider)).call(this, props));

    _this.updateRequestState = function (updatedState) {
      _this.setState({
        // eslint-disable-next-line react/no-unused-state
        __requestState__: updatedState
      });
    };

    var requestStateHandler = new _RequestStateHandler2.default();

    _this.state = {
      // eslint-disable-next-line react/no-unused-state
      __requestState__: requestStateHandler.getCurrentState(),
      // eslint-disable-next-line react/no-unused-state
      __requestStateHandler__: requestStateHandler
    };

    requestStateHandler.addStateChangeListener(_this.updateRequestState);
    return _this;
  }

  _createClass(RequestStateProvider, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        Provider,
        { value: this.state },
        this.props.children
      );
    }
  }]);

  return RequestStateProvider;
}(_react.Component);

RequestStateProvider.propTypes = {
  children: _propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes2.default.node), _propTypes2.default.node])
};

exports.default = RequestStateProvider;