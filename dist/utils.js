'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.functor = exports.apply = exports.filterBlacklist = exports.arrayify = exports.third = exports.second = exports.first = exports.mapTypes = exports.mapName = exports.map = exports.getTypes = exports.getName = exports.get = exports.blacklist = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var blacklist = exports.blacklist = ['extend', 'options', '__set'];
var get = exports.get = _lodash2.default.curry(function (name, obj) {
  return obj[name];
});
var getName = exports.getName = get('name');
var getTypes = exports.getTypes = get('types');
var map = exports.map = _lodash2.default.curry(function (f, a) {
  return a.map(f);
});
var mapName = exports.mapName = map(getName);
var mapTypes = exports.mapTypes = map(getTypes);
var first = exports.first = function first(arr) {
  return arr[0];
};
var second = exports.second = function second(arr) {
  return arr[1];
};
var third = exports.third = function third(arr) {
  return arr[2];
};
var arrayify = exports.arrayify = function arrayify(n) {
  return [n];
};
var filterBlacklist = exports.filterBlacklist = function filterBlacklist(x) {
  return blacklist.indexOf(x) === -1;
};
var apply = exports.apply = function apply(func, arr) {
  return func.apply(null, arr);
};
var functor = exports.functor = function functor(f) {
  return function (fun) {
    return fun(f());
  };
};