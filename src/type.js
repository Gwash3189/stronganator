export default (name, checker, types) => {
  checker.map = (f) => f({name, checker, types});
  return checker;
};
