import type from './type';
import { filterBlacklist, map, getName } from './utils';

const Any = type('Any', () => true);

const Truthy = type('Truthy', (x) => !!x);

const Falsey = type('Falsey', (x) => !x);

const Nil = type('Nil', (nil) => nil === null || nil === undefined);

const Prom = (prom) => {
  return !!prom.then && T.Function(prom.then);
};

const Hash = (o) => {
  return !Array.isArray(o) && typeof o === 'object';
};

const Tuple = (typeList) => {
  return type('Tuple', (list) => {
    return list.every((x, i) => typeList[i](x));
  }, typeList);
};

const Union = (...types) => {
  const unionName = types.map(x => x.map(getName)).join(' || ');
  const handler = (types) => {
    return (x) => {
      return types.some(type => {
        if (Array.isArray(type)) {
          return handler(type)(x);
        }
        return type(x);
      });
    };
  };
  return type(unionName, handler(types));
};

const Optional = (type) => {
  return Union(type, Nil);
};

const T = {
  Any,
  Truthy,
  Falsey,
  Type: type('Type', (t) => {
    return t && t.map && T.Function(t.map) && map(getName, t);
  }),
  Nil,
  String: type('String', (str) => typeof str === 'string'),
  Number: type('Number', (n) => typeof n === 'number' && !isNaN(n) ),
  Boolean: type('Boolean', (b) => typeof b === 'boolean'),
  Function: type('Function', (f) => typeof f === 'function'),
  Date: type('Date', (date) => date instanceof Date),
  Array: (elementType = Any) => {
    return type('Array', (arr) => {
      return Array.isArray(arr) && arr.every(elementType);
    }, elementType);
  },
  Object: (propTypes) => {
    if (!propTypes) {
      return Any;
    } else if (typeof propTypes === 'object') {
      return type('Object', (obj) => {
        return obj && Object.keys(propTypes)
               .filter(filterBlacklist)
               .every(key => propTypes[key](obj[key]));
      }, propTypes);
    } else if(T.Type(propTypes)) {
      return propTypes;
    }
  },
  Error: type('Error', (e) => e instanceof Error),
  RegExp: type('RegExp', (r) => r instanceof RegExp),
  Union,
  Optional,
  Tuple,
  Hash,
  'Promise': Prom
};

export default T;
