import _ from 'lodash';

import makeTypeObject from './errorHandler';
import { map, getName } from './utils';

export default (types = [], retType) => {
  return {
    of(func) {
      const funcChecker = (...args) => {
        const validTypes = types.every((x, i) => x(args[i]));
        if (!validTypes) {
          throw new TypeError(`Needed ${JSON.stringify(makeTypeObject(types), null, 4)} but got ${JSON.stringify(_.flatten(args))}`);
        }
        const returnValue = func.apply(null, args);
        if (retType && !retType(returnValue)) {
          throw new TypeError(`Function returned a ${typeof returnValue} but needed a ${map(getName, retType)}`);
        }
        return returnValue;
      };
      return funcChecker;
    }
  };
};
