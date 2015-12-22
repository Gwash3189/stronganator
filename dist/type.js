"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var map = function map(name, checker, types) {
  return function (f) {
    return f({ name: name, checker: checker, types: types });
  };
};

var extend = function extend(checker) {
  return function (name, newChecker) {
    return typeFactory(name, function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return checker.apply(null, args) && newChecker.apply(null, args);
    }, [checker, newChecker]);
  };
};

var typeFactory = function typeFactory(name, checker, types) {
  checker.map = map(name, checker, types);

  checker.extend = extend(checker);

  return checker;
};

exports.default = typeFactory;