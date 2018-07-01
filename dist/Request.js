'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _joiBrowser = require('joi-browser');

var _joiBrowser2 = _interopRequireDefault(_joiBrowser);

var _objectHash = require('object-hash');

var _objectHash2 = _interopRequireDefault(_objectHash);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var configSchema = _joiBrowser2.default.object({
  request: _joiBrowser2.default.func().required(),
  transformError: _joiBrowser2.default.func(),
  defaultMapping: _joiBrowser2.default.object({
    statusProp: _joiBrowser2.default.string(),
    requestProp: _joiBrowser2.default.string(),
    executeOnMount: _joiBrowser2.default.boolean()
  })
});

var Request = function Request() {
  var _this = this;

  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  _classCallCheck(this, Request);

  var _configSchema$validat = configSchema.validate(config),
      error = _configSchema$validat.error;

  if (error) {
    throw new Error('Couldn\'t instantiate Request object with invalid configuration object: ' + error);
  }

  var requestHash = (0, _objectHash2.default)({
    config: config,
    params: params
  });

  this.withParams = function () {
    for (var _len = arguments.length, parameters = Array(_len), _key = 0; _key < _len; _key++) {
      parameters[_key] = arguments[_key];
    }

    return new Request(config, parameters);
  };
  this.execute = function () {
    return Promise.resolve(config.request.apply(config, _toConsumableArray(params)));
  };
  this.equals = function (otherRequest) {
    return _this.getHash() === otherRequest.getHash();
  };
  this.getConfig = function () {
    return _lodash2.default.cloneDeep(config);
  };
  this.getHash = function () {
    return _lodash2.default.clone(requestHash);
  };
};

exports.default = Request;