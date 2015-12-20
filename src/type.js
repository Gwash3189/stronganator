const map = (name, checker, types) => (f) => f({name, checker, types});

const extend = (checker) => (name, newChecker) => {
  return typeFactory(name, (...args) => {
    return checker.apply(null, args) && newChecker.apply(null, args);
  }, [checker, newChecker]);
};

const typeFactory = (name, checker, types) => {
  checker.map = map(name, checker, types);

  checker.extend = extend(checker);

  return checker;
};

export default typeFactory;
