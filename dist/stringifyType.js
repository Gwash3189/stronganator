'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var stringifyType = function stringifyType(types) {
  var isNonGeneric = function isNonGeneric(type) {
    return !(0, _utils.mapTypes)(type);
  };

  var handleNestedArrays = function handleNestedArrays(type) {
    var result = stringifyType([(0, _utils.mapTypes)((0, _utils.mapTypes)(type))]);
    return '[[' + result + ']]';
  };

  return types.map(function (type) {
    if (isNonGeneric(type)) {
      return (0, _utils.mapName)(type);
    }

    if ((0, _utils.mapName)(type) === 'Array') {
      //nested arrays
      if ((0, _utils.mapName)((0, _utils.mapTypes)(type)) === 'Array') {
        return handleNestedArrays(type);
      }
      return '[' + (0, _utils.mapName)((0, _utils.mapTypes)(type)) + ']';
    }

    var propNames = Object.keys((0, _utils.mapTypes)(type)).filter(_utils.filterBlacklist);

    var typeName = propNames.map(function (y) {
      return (0, _utils.get)(y, (0, _utils.mapTypes)(type));
    }).map(_utils.mapName);

    var objectTypes = propNames.filter(function (_, i) {
      return typeName[i] === 'Object';
    }).map(function (y) {
      var makeChildTypeObject = _lodash2.default.compose(_utils.first, stringifyType, _utils.arrayify, (0, _utils.get)(y), _utils.mapTypes);
      return _defineProperty({}, y, makeChildTypeObject(type));
    });

    var otherTypes = propNames.filter(function (_, i) {
      return typeName[i] !== 'Object';
    }).map(function (x, i) {
      return _defineProperty({}, x, typeName[i]);
    });

    return (0, _utils.apply)(_lodash2.default.extend, [{}].concat(objectTypes, otherTypes));
  });
};

exports.default = stringifyType;