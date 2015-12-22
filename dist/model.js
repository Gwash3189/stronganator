'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _func = require('./func');

var _func2 = _interopRequireDefault(_func);

var _assign = require('lodash/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _types = require('./types');

var _types2 = _interopRequireDefault(_types);

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _stringifyType = require('./stringifyType');

var _stringifyType2 = _interopRequireDefault(_stringifyType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ModelDefinition = (0, _type2.default)('ModelDefinition', function (modelDef) {
  var handler = function handler(obj) {
    return Object.keys(modelDef).every(function (key) {
      var x = obj[key];

      if (_types2.default.Hash(x)) {
        return handler(x);
      }

      console.log(x);

      return _types2.default.Type(x);
    });
  };
  return handler(modelDef);
});

var errorHandler = function errorHandler(checker, props) {
  var checkerTypes = JSON.stringify((0, _stringifyType2.default)([checker]));
  var propsString = JSON.stringify(props);

  var error = 'Needed ' + checkerTypes + ' but got ' + propsString;
  throw new TypeError(error);
};

var autoBind = function autoBind(obj) {
  Object.keys(obj).filter(function (k) {
    return _types2.default.Function(obj[k]);
  }).forEach(function (k) {
    return obj[k].bind(obj);
  });

  return obj;
};

var addExtendToType = function addExtendToType(type, oldObjDef) {
  type.extend = function (objDef) {
    return modelHandler((0, _assign2.default)({}, oldObjDef, objDef));
  };

  return type;
};

var modelHandler = function modelHandler(objDef) {
  var checker = _types2.default.Object(objDef);

  checker = addExtendToType(checker, objDef);

  var factory = function factory(props) {
    if (checker(props)) {
      autoBind(props);
      return props;
    } else {
      errorHandler(checker, props);
    }
  };

  factory.extend = checker.extend;

  return factory;
};

exports.default = (0, _func2.default)([ModelDefinition], _types2.default.Function).of(modelHandler);