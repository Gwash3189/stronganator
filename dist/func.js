'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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
        args.push(this);
        returnValue = typedFunction.apply(this, args);

        if (returnType && !returnType(returnValue)) {
          invalidReturnType(returnValue, returnType);
        }

        return returnValue;
      };

      return funcChecker;
    }
  };
};

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

;