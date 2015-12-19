const type = (name, checker, types) => {
  checker.map = (f) => f({name, checker, types});

  checker.extend = (name, newChecker) => {
    return type(name, (...args) => {
      return checker.apply(null, args) && newChecker.apply(null, args);
    }, [checker, newChecker]);
  };
  
  return checker;
};

export default type;
