import type from './type';

export default (name, ...checkers) => {
  return type(name, (...args) => {
    return checkers.every(x => x.apply(null, args));
  });
};
