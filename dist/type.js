'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('./utils');

var metaFactory = function metaFactory(_ref) {
  var name = _ref.name;
  var checker = _ref.checker;
  var types = _ref.types;

  var meta = { name: name, checker: checker, types: types, isGeneric: false };

  meta.map = (0, _utils.functor)(function () {
    return [{ 'name': name }, { 'checker': checker }, { 'types': types }, { 'isGeneric': !!types }];
  });

  return meta;
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
  checker.map = (0, _utils.functor)(function () {
    return metaFactory({ name: name, checker: checker, types: types });
  });

  checker.extend = extend(checker);

  return checker;
};

exports.default = typeFactory;