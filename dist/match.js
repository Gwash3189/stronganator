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

  var unionTypes = matcherList.map(function (tuple) {
    return (0, _utils.first)(tuple);
  });

  innerMatchUnion = (0, _utils.apply)(_types2.default.Union, unionTypes);

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