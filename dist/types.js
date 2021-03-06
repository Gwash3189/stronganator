'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var genericFunctor = function genericFunctor(generic) {
  generic.map = (0, _utils.functor)(function () {
    return { isGeneric: true };
  });
  return generic;
};

var Any = (0, _type2.default)('Any', function () {
  return true;
});

var Truthy = (0, _type2.default)('Truthy', function (x) {
  return !!x;
});

var Falsey = (0, _type2.default)('Falsey', function (x) {
  return !x;
});

var Nil = (0, _type2.default)('Nil', function (nil) {
  return nil === null || nil === undefined;
});

var Prom = (0, _type2.default)('Promise', function (prom) {
  return !!prom.then && T.Function(prom.then);
});

var Hash = (0, _type2.default)('Hash', function (o) {
  return !Array.isArray(o) && (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object';
});

var Tuple = genericFunctor(function (typeList) {
  return (0, _type2.default)('Tuple', function (list) {
    return list.every(function (x, i) {
      return typeList[i](x);
    });
  }, typeList);
});

var Spread = genericFunctor(function () {
  var elementType = arguments.length <= 0 || arguments[0] === undefined ? Any : arguments[0];

  return (0, _type2.default)('Spread', function () {
    for (var _len = arguments.length, values = Array(_len), _key = 0; _key < _len; _key++) {
      values[_key] = arguments[_key];
    }

    return T.Array(elementType)(values);
  });
});

var Union = genericFunctor(function () {
  for (var _len2 = arguments.length, types = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    types[_key2] = arguments[_key2];
  }

  var unionName = types.map(function (x) {
    return x.map(_utils.getName);
  }).join(' || ');
  var handler = function handler(types) {
    return function (x) {
      return types.some(function (type) {
        if (Array.isArray(type)) {
          return handler(type)(x);
        }
        return type(x);
      });
    };
  };
  return (0, _type2.default)(unionName, handler(types));
});

var Optional = genericFunctor(function (type) {
  return Union(type, Nil);
});

var T = {
  Any: Any,
  Default: Any.extend('Default', function () {
    return true;
  }),
  Truthy: Truthy,
  Falsey: Falsey,
  Type: (0, _type2.default)('Type', function (t) {
    return !!(t && t.map && T.Function(t.map) && (0, _utils.mapName)(t));
  }),
  Nil: Nil,
  String: (0, _type2.default)('String', function (str) {
    return typeof str === 'string';
  }),
  Number: (0, _type2.default)('Number', function (n) {
    return typeof n === 'number' && !isNaN(n);
  }),
  Boolean: (0, _type2.default)('Boolean', function (b) {
    return typeof b === 'boolean';
  }),
  Function: (0, _type2.default)('Function', function (f) {
    return typeof f === 'function';
  }),
  Date: (0, _type2.default)('Date', function (date) {
    return date instanceof Date;
  }),
  Array: genericFunctor(function () {
    var elementType = arguments.length <= 0 || arguments[0] === undefined ? Any : arguments[0];

    return (0, _type2.default)('Array', function (arr) {
      return Array.isArray(arr) && arr.every(elementType);
    }, elementType);
  }),
  Object: genericFunctor(function (propTypes) {
    if (!propTypes) {
      return Any;
    } else if ((typeof propTypes === 'undefined' ? 'undefined' : _typeof(propTypes)) === 'object') {
      return (0, _type2.default)('Object', function (obj) {
        return obj && Object.keys(propTypes).filter(_utils.filterBlacklist).every(function (key) {
          return propTypes[key](obj[key]);
        });
      }, propTypes);
    } else if (T.Type(propTypes)) {
      return propTypes;
    }
  }),
  Error: (0, _type2.default)('Error', function (e) {
    return e instanceof Error;
  }),
  RegExp: (0, _type2.default)('RegExp', function (r) {
    return r instanceof RegExp;
  }),
  Union: Union,
  Optional: Optional,
  Tuple: Tuple,
  Spread: Spread,
  Hash: Hash,
  'Promise': Prom
};

exports.default = T;