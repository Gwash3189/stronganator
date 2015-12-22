import _ from 'lodash';

import stringifyType from './stringifyType';
import T from './types';
import { mapName } from './utils';

const invalidParamTypes = (types, args) => {
  const requiredTyped = JSON.stringify(stringifyType(types), null, 4);
  const providedArguments = JSON.stringify(_.flatten(args));
  throw new TypeError(`Needed ${requiredTyped} but got ${providedArguments}`);
};

const invalidReturnType = (returnValue, returnType) => {
  const providedReturnValue = typeof returnValue;
  const typeName = mapName(returnType);
  throw new TypeError(`Function returned a ${providedReturnValue} but needed a ${typeName}`);
};

const TypeArray = T.Array(T.Union(T.Type, T.Object()));

const returnsHandler = (types = [], typedFunction) => {
  return (type) => {
    return func(types, type).of(typedFunction);
  };
};

const func = (types = [], returnType) => {
  return {
    of(typedFunction) {
      const funcChecker = function(...args) {
        let returnValue;
        let validTypes;

        if (!TypeArray(types)){
          types = [ types ];
        }

        validTypes = types
                     .every((x, i) => x(args[i]));

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

      funcChecker.returns = returnsHandler(types, typedFunction);

      return funcChecker;
    }
  };
};

export default func;
