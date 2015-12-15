import func from './func';
import assign from 'lodash/object/assign';
import T from './types';
import type from './type';
import stringifyType from './stringifyType';

const ModelDefinition = type('ModelDefinition', (modelDef) => {
  const handler = (obj) => {
    return Object.keys(modelDef)
           .every(key => {
             const x = obj[key];

             if (T.Hash(x)) {
               return handler(x);
             }

             return T.Type(x);
           });
  };
  return handler(modelDef);
});

const errorHandler = (checker, props) => {
  const checkerTypes = JSON.stringify(stringifyType([checker]));
  const propsString = JSON.stringify(props);

  const error = `Needed ${checkerTypes} but got ${propsString}`;
  throw new TypeError(error);
};

const autoBind = (obj) => {
  Object.keys(obj)
  .filter(k => T.Function(obj[k]))
  .forEach(k => obj[k].bind(obj));

  return obj;
};

const addExtendToType = (type, oldObjDef) => {
  type.extend = (objDef) => {
    return modelHandler(assign({}, oldObjDef, objDef));
  };

  return type;
};

const modelHandler = (objDef) => {
  let checker = T.Object(objDef);

  checker = addExtendToType(checker, objDef);

  const factory =  function(props) {
    if (checker(props)) {
      autoBind(props);
      return props;
    } else {
      errorHandler(checker, props);
    }
  };

  factory.extend = checker.extend;

  return factory;
};

export default func([ModelDefinition], T.Function).of(modelHandler);
