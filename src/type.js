import { functor } from './utils';

const metaFactory = ({name, checker, types}) => {
  const meta = { name, checker, types };

  meta.map = functor(() => [
    { 'name': name },
    { 'checker': checker },
    { 'types': types }
  ]);

  return meta;
};

const extend = (checker) => (name, newChecker) => {
  return typeFactory(name, (...args) => {
    return checker.apply(null, args) && newChecker.apply(null, args);
  }, [checker, newChecker]);
};

const typeFactory = (name, checker, types) => {
  checker.map = functor(() => {
    return metaFactory({ name, checker, types });
  });

  checker.extend = extend(checker);

  return checker;
};

export default typeFactory;
