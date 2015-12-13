'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _stringifyType = require('./stringifyType');

var _stringifyType2 = _interopRequireDefault(_stringifyType);

var _types = require('./types');

var _types2 = _interopRequireDefault(_types);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var invalidParamTypes = function invalidParamTypes(types, args) {
  var requiredTyped = JSON.stringify((0, _stringifyType2.default)(types), null, 4);
  var providedArguments = JSON.stringify(_lodash2.default.flatten(args));
  throw new TypeError('Needed ' + requiredTyped + ' but got ' + providedArguments);
};

var invalidReturnType = function invalidReturnType(returnValue, returnType) {
  var providedReturnValue = typeof returnValue === 'undefined' ? 'undefined' : _typeof(returnValue);
  var typeName = (0, _utils.mapName)(returnType);
  throw new TypeError('Function returned a ' + providedReturnValue + ' but needed a ' + typeName);
};

var TypeArray = _types2.default.Array(_types2.default.Union(_types2.default.Type, _types2.default.Object()));

exports.default = function () {
  var types = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
  var returnType = arguments[1];

  return {
    of: function of(typedFunction) {
      var funcChecker = function funcChecker() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var returnValue = undefined;
        var validTypes = undefined;

        if (!TypeArray(types)) {
          types = [types];
        }

        validTypes = types.every(function (x, i) {
          return x(args[i]);
        });

        if (!validTypes) {
          invalidParamTypes(types, args);
        }

        returnValue = (0, _utils.apply)(typedFunction, args);

        if (returnType && !returnType(returnValue)) {
          invalidReturnType(returnValue, returnType);
        }

        return returnValue;
      };

      return funcChecker;
    }
  };
};
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _func = require('./func');

var _func2 = _interopRequireDefault(_func);

var _types = require('./types');

var _types2 = _interopRequireDefault(_types);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MatcherUnion = _types2.default.Tuple([_types2.default.Type, _types2.default.Function]);
var MatcherList = _types2.default.Array(MatcherUnion);

var errorHandler = function errorHandler(matchedValue, results) {
  var message = matchedValue + ' matched more than one type. Only one type must be matched.\n';
  message = message + results.map(function (result) {
    return 'Type: ' + (0, _utils.mapName)((0, _utils.first)(result)) + ', Result: ' + (0, _utils.second)(result);
  }).join('\n');
  throw new TypeError(message);
};

var matchHandler = function matchHandler(matcherList) {
  var innerMatchUnion = undefined;

  innerMatchUnion = (0, _utils.apply)(_types2.default.Union, matcherList);

  return (0, _func2.default)([innerMatchUnion], _types2.default.Any).of(function (x) {
    var results = [],
        value = undefined;

    matcherList.forEach(function (pair) {
      var type = (0, _utils.first)(pair);
      if (type(x)) {
        value = (0, _utils.second)(pair)(x);
        results.push([(0, _utils.first)(pair), value]);
      }
    });

    if (results.length > 1) {
      errorHandler(x, results);
    }

    return value;
  });
};

var match = (0, _func2.default)([MatcherList], _types2.default.Function).of(matchHandler);

exports.default = match;
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
    return !(0, _utils.map)(_utils.getTypes, type);
  };

  var handleNestedArrays = function handleNestedArrays(type) {
    var result = stringifyType([(0, _utils.map)(_utils.getTypes, (0, _utils.map)(_utils.getTypes, type))]);
    return '[[' + result + ']]';
  };

  return types.map(function (type) {
    if (isNonGeneric(type)) return (0, _utils.map)(_utils.getName, type);

    if ((0, _utils.map)(_utils.getName, type) === 'Array') {
      //nested arrays
      if ((0, _utils.map)(_utils.getName, (0, _utils.map)(_utils.getTypes, type)) === 'Array') {
        return handleNestedArrays(type);
      }
      return '[' + (0, _utils.map)(_utils.getName, (0, _utils.map)(_utils.getTypes, type)) + ']';
    }

    var propNames = Object.keys((0, _utils.map)(_utils.getTypes, type)).filter(_utils.filterBlacklist);

    var typeName = propNames.map(function (y) {
      return (0, _utils.map)(_utils.getName, (0, _utils.get)(y, (0, _utils.map)(_utils.getTypes, type)));
    });

    var objectTypes = propNames.filter(function (_, i) {
      return typeName[i] === 'Object';
    }).map(function (y) {
      var makeChildTypeObject = _lodash2.default.compose(_utils.first, stringifyType, _utils.arrayify, (0, _utils.get)(y), (0, _utils.map)(_utils.getTypes));
      return _defineProperty({}, y, makeChildTypeObject(type));
    });

    var otherTypes = propNames.filter(function (_, i) {
      return typeName[i] !== 'Object';
    }).map(function (x, i) {
      return _defineProperty({}, x, typeName[i]);
    });

    return _lodash2.default.extend.apply(null, [{}].concat(objectTypes, otherTypes));
  });
};

exports.default = stringifyType;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.match = exports.types = exports.func = exports.model = exports.intersection = exports.type = undefined;

var _intersection = require('./intersection');

var _intersection2 = _interopRequireDefault(_intersection);

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _types = require('./types');

var _types2 = _interopRequireDefault(_types);

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _func = require('./func');

var _func2 = _interopRequireDefault(_func);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.type = _type2.default;
exports.intersection = _intersection2.default;
exports.model = _model2.default;
exports.func = _func2.default;
exports.types = _types2.default;
exports.match = _func2.default;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (name, checker, types) {
  checker.map = function (f) {
    return f({ name: name, checker: checker, types: types });
  };
  return checker;
};
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

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

var Prom = function Prom(prom) {
  return !!prom.then && types.Function(prom.then);
};

var Hash = function Hash(o) {
  return !Array.isArray(o) && (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object';
};

var Tuple = function Tuple(typeList) {
  return (0, _type2.default)('Tuple', function (list) {
    return list.every(function (x, i) {
      return typeList[i](x);
    });
  }, typeList);
};

var Union = function Union() {
  for (var _len = arguments.length, types = Array(_len), _key = 0; _key < _len; _key++) {
    types[_key] = arguments[_key];
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
};

var Optional = function Optional(type) {
  return Union(type, Nil);
};

var types = {
  Any: Any,
  Truthy: Truthy,
  Falsey: Falsey,
  Type: (0, _type2.default)('Type', function (t) {
    return t && t.map && types.Function(t.map) && (0, _utils.map)(_utils.getName, t);
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
  Array: (function (_Array) {
    function Array() {
      return _Array.apply(this, arguments);
    }

    Array.toString = function () {
      return _Array.toString();
    };

    return Array;
  })(function () {
    var elementType = arguments.length <= 0 || arguments[0] === undefined ? Any : arguments[0];

    return (0, _type2.default)('Array', function (arr) {
      return Array.isArray(arr) && arr.every(elementType);
    }, elementType);
  }),
  Object: (function (_Object) {
    function Object(_x) {
      return _Object.apply(this, arguments);
    }

    Object.toString = function () {
      return _Object.toString();
    };

    return Object;
  })(function (propTypes) {
    if (!propTypes) {
      return Any;
    } else if ((typeof propTypes === 'undefined' ? 'undefined' : _typeof(propTypes)) === 'object') {
      return (0, _type2.default)('Object', function (obj) {
        return Object.keys(propTypes).filter(_utils.filterBlacklist).every(function (key) {
          return propTypes[key](obj[key]);
        });
      }, propTypes);
    } else if (types.Type(propTypes)) {
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
  Hash: Hash,
  'Promise': Prom
};

exports.default = types;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.apply = exports.filterBlacklist = exports.arrayify = exports.third = exports.second = exports.first = exports.mapTypes = exports.mapName = exports.map = exports.getTypes = exports.getName = exports.get = exports.blacklist = undefined;

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
