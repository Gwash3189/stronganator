import T from './types';
import { functor, stringify } from './utils';
import stringifyType from './stringifyType';

const onlyGenerics = (type) => T[type].map(meta => meta.isGeneric);
const removeGenerics = (type) => T[type].map(meta => !meta.isGeneric);
const rebuildObjectDefinition = (obj) => {
  let newDefinition = {};

  Object.keys(obj)
  .forEach(key => {
    const value = obj[key];
    if (T.Hash(value)) {
      newDefinition = rebuildObjectDefinition(value);
    } else {
      newDefinition[key] = value.map(propType => propType.type);
    }
  });

  return newDefinition;
};

const propTypeFactory = (func) => {
  const propType = (props, propName, componentName) => {
    const typeName = func.map(meta => meta.name);
    return func(props[propName])
      ? true
      : new Error(`${propName} is not a ${typeName}. Check render method of ${componentName}`);
  };
  propType.map = functor(() => {
    return { type: func };
  });

  return propType;
};
const genericPropTypeFactory = (func) => {
  return (internalType) => {
    return (props, propName, componentName) => {
      let internalTypeImplementation,
          genericType;

      if (T.Hash(internalType)) {
        internalTypeImplementation = rebuildObjectDefinition(internalType);
      } else {
        internalTypeImplementation = internalType.map(({type}) => type);
      }

      genericType = func(internalTypeImplementation);
      return genericType(props[propName])
        ? true
        : new Error(`${propName} is not ${stringify(stringifyType([genericType]))}. It is ${stringify(props[propName])}. Check render method of ${componentName}`);
    };
  };
};
const toPropTypeApi = (typesObject) => {
  const toPropTypeApi = {};

  const nonGenerics = Object.keys(typesObject)
                      .filter(removeGenerics);
  const generics = Object.keys(typesObject)
                   .filter(onlyGenerics);

  generics.forEach(key => {
    toPropTypeApi[key] = genericPropTypeFactory(typesObject[key]);
  });

  nonGenerics.forEach(key => {
    toPropTypeApi[key] = propTypeFactory(typesObject[key]);
  });

  return toPropTypeApi;
};

export default toPropTypeApi(T);
