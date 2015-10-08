import _ from 'lodash';
import observe from 'object.observe';

const get = _.curry((name, obj) => obj[name]);
const getName = get('name');
const getTypes = get('types');
const map = _.curry((f, a) => a.map(f));
const mapName = map(getName);
const mapTypes = map(getTypes);
const first = (arr) => arr[0]
const arrayify = (n) => [n];
const filterBlacklist = (x) => blacklist.indexOf(x) === -1;
const blacklist = ['extend', 'options'];

export const model = (opts = {}, watch = false) => {
  opts.options = opts.options || {};
  const factory = types.Object(opts);
  return (props) => {
    const result = factory(props);
    if (result) {
      let clone = _.clone(props, true);
      clone =  _.extend(
        clone,
        opts.extend || {},
        {
          check(){
            if (!factory(clone)) {
              const error = `Needed ${JSON.stringify(makeTypeObject([factory]))} but got ${JSON.stringify(clone)}`
              throw new TypeError(error);
            }
            return true;
          }
        }
      );
      if (watch){
        Object.observe(clone, clone.check);
      }
      return clone;
    } else {
      const error = `Needed ${JSON.stringify(makeTypeObject([factory]))} but got ${JSON.stringify(props)}`
      throw new TypeError(error);
    }
  }
};

const makeTypeObject = (types) => {
  return types.map(x => {
    if (!x.map(getTypes)) {
      // not generic
      return map(getName, x);
    }

    if (map(getName, x) === 'Array') {
      //nested arrays
      if (map(getName, map(getTypes, x)) === 'Array') {
        return `[[${makeTypeObject([map(getTypes, map(getTypes,x))])}]]`;
      }
      return `[${map(getName, map(getTypes, x))}]`;
    }

    const propName = Object
                     .keys(map(getTypes, x))
                     .filter(filterBlacklist);


    const typeName = propName
                     .map(y => {
                      return map(getName, get(y, map(getTypes, x)))
                    });

    const objectTypes = propName
                        .filter((x, i) => typeName[i] === 'Object')
                        .map(y => {
                          const makeChildTypeObject = _.compose(
                                                        first,
                                                        makeTypeObject,
                                                        arrayify,
                                                        get(y),
                                                        map(getTypes)
                                                      );
                          return {[y]: makeChildTypeObject(x)}
                        });
    const otherTypes = propName
                       .filter((x, i) => typeName[i] !== 'Object')
                       .map((x, i) => {
                        return {[x]: typeName[i]}
                      });

    return _.extend.apply(null, [{}].concat(objectTypes, otherTypes));
  });
}

export const func = (types = [], retType) => {
  return {
    of(func) {
      const funcChecker = (...args) => {
        const validTypes = types.every((x, i) => x(args[i]));
        if (!validTypes) {
          throw new TypeError(`Needed ${JSON.stringify(makeTypeObject(types), null, 4)} but got ${JSON.stringify(_.flatten(args))}`)
        }
        const returnValue = func.apply(null, args);
        if (retType && !retType(returnValue)) {
          throw new TypeError(`Function returned a ${typeof returnValue} but needed a ${map(getName, retType)}`);
        }
          return returnValue
      };
      return funcChecker;
    }
  }
};

export const type = (name, checker, types) => {
  checker.map = (f) => {
    return f({name, checker, types});
  };
  return checker;
}

export const types = {
  Any: type('Any', () => true),
  Watched: (propType = types.Any) => {
    return (value) => {
      if (map(getName,propType) === 'Object' || map(getName,propType) === 'Array') {
        Object.observe(value, propType);
        propType.unwatch = () => {
          Object.unobserve(value, propType);
        }
        return propType(value);
      }
    }
  },
  Truthy: type('Truthy', (x) => !!x),
  Falsey: type('Falsey', (x) => !!!x),
  Type: type('Type', (t) => {
    return t.map && types.Function(t.map) && map(getName, t);
  }),
  Date: type('Date', (date) => date instanceof Date),
  Array: (elementType = types.Any) => {
    return type('Array', (arr) => {
      return Array.isArray(arr) && arr.every(elementType)
    }, elementType)
  },
  Nil: type('Nil', (nil) => nil === null || nil === undefined),
  String: type('String', (str) => typeof str === 'string'),
  Number: type('Number', (n) => typeof n === 'number' ),
  Boolean: type('Boolean', (b) => typeof b === 'boolean'),
  Object: (propTypes) => {
    return !propTypes
      ? types.Any
      : types.Type(propTypes)
        ? propTypes
        : type('Object', (obj) => {
            return Object.keys(propTypes).filter(filterBlacklist).every(key => propTypes[key](obj[key]));
          }, propTypes);
  },
  Function: type('Function', (f) => typeof f === 'function'),
  Error: type('Error', (e) => e instanceof Error),
  RegExp: type('RegExp', (r) => r instanceof RegExp),
  Union: (...types) => {
    const unionName = types.map(x => x.map(getName)).join(' || ');
    return type(unionName, (x) => {
      return types.some(f => f(x));
    });
  }
}


