'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _types = require('./types');

var _types2 = _interopRequireDefault(_types);

var _utils = require('./utils');

var _stringifyType = require('./stringifyType');

var _stringifyType2 = _interopRequireDefault(_stringifyType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onlyGenerics = function onlyGenerics(type) {
  return _types2.default[type].map(function (meta) {
    return meta.isGeneric;
  });
};
var removeGenerics = function removeGenerics(type) {
  return _types2.default[type].map(function (meta) {
    return !meta.isGeneric;
  });
};
var rebuildObjectDefinition = function rebuildObjectDefinition(obj) {
  var newDefinition = {};

  Object.keys(obj).forEach(function (key) {
    var value = obj[key];
    if (_types2.default.Hash(value)) {
      newDefinition = rebuildObjectDefinition(value);
    } else {
      newDefinition[key] = value.map(function (propType) {
        return propType.type;
      });
    }
  });

  return newDefinition;
};

var propTypeFactory = function propTypeFactory(func) {
  var propType = function propType(props, propName, componentName) {
    var typeName = func.map(function (meta) {
      return meta.name;
    });
    return func(props[propName]) ? true : new Error(propName + ' is not a ' + typeName + '. Check render method of ' + componentName);
  };
  propType.map = (0, _utils.functor)(function () {
    return { type: func };
  });

  return propType;
};
var genericPropTypeFactory = function genericPropTypeFactory(func) {
  return function (internalType) {
    return function (props, propName, componentName) {
      var internalTypeImplementation = undefined,
          genericType = undefined;

      if (_types2.default.Hash(internalType)) {
        internalTypeImplementation = rebuildObjectDefinition(internalType);
      } else {
        internalTypeImplementation = internalType.map(function (_ref) {
          var type = _ref.type;
          return type;
        });
      }

      genericType = func(internalTypeImplementation);
      return genericType(props[propName]) ? true : new Error(propName + ' is not ' + (0, _utils.stringify)((0, _stringifyType2.default)([genericType])) + '. It is ' + (0, _utils.stringify)(props[propName]) + '. Check render method of ' + componentName);
    };
  };
};
var toPropTypeApi = function toPropTypeApi(typesObject) {
  var toPropTypeApi = {};

  var nonGenerics = Object.keys(typesObject).filter(removeGenerics);
  var generics = Object.keys(typesObject).filter(onlyGenerics);

  generics.forEach(function (key) {
    toPropTypeApi[key] = genericPropTypeFactory(typesObject[key]);
  });

  nonGenerics.forEach(function (key) {
    toPropTypeApi[key] = propTypeFactory(typesObject[key]);
  });

  return toPropTypeApi;
};

exports.default = toPropTypeApi(_types2.default);