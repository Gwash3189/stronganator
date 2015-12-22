'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.match = exports.type = exports.func = exports.model = exports.T = undefined;

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _types = require('./types');

var _types2 = _interopRequireDefault(_types);

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _func = require('./func');

var _func2 = _interopRequireDefault(_func);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.T = _types2.default;
exports.model = _model2.default;
exports.func = _func2.default;
exports.type = _type2.default;
exports.match = _func2.default;