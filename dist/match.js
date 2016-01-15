'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

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

var tooManyResultsErrorHandler = function tooManyResultsErrorHandler(matchedValue, results) {
  var message = 'Parameter ' + matchedValue + ' matched more than one type. Only one type must be matched.\n';

  message = message + results.map(function (result) {
    return 'Type: ' + (0, _utils.mapName)((0, _utils.first)(result)) + ', Result: ' + (0, _utils.second)(result);
  }).join('\n');

  throw new TypeError(message);
};

var matchHandler = function matchHandler(matcherList) {
  var unionTypes = matcherList.map(_utils.first);
  var innerMatchUnion = (0, _utils.apply)(_types2.default.Union, unionTypes);

  return (0, _func2.default)([innerMatchUnion], _types2.default.Any).of(function (x) {
    var results = [],
        value = undefined,
        defaultMatchFunc = undefined;

    matcherList.filter(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var type = _ref2[0];
      var func = _ref2[1];

      if ((0, _utils.mapName)(type) === 'Default') {
        defaultMatchFunc = func;
        return false;
      }
      return true;
    }).forEach(function (pair) {
      var _pair = _slicedToArray(pair, 1);

      var type = _pair[0];

      if (type(x)) {
        value = (0, _utils.second)(pair)(x);
        results.push([type, value]);
      }
    });

    if (results.length === 0) {
      if (defaultMatchFunc) {
        return defaultMatchFunc(x);
      }
    }

    if (results.length > 1) {
      tooManyResultsErrorHandler(x, results);
    }

    return value;
  });
};

var match = (0, _func2.default)([MatcherList], _types2.default.Function).of(matchHandler);

exports.default = match;