import _ from 'lodash';

import {
  map,
  getTypes,
  getName,
  filterBlacklist,
  get,
  first,
  arrayify } from './utils';

const makeTypeObject = (types) => {
  const isNonGeneric = (type) => {
    return !map(getTypes, type);
  };

  const handleNestedArrays = (type) => {
    const result = makeTypeObject([
      map(getTypes, map(getTypes, type))
    ]);
    return `[[${result}]]`;
  };

  return types.map(type => {
    if (isNonGeneric(type)) return map(getName, type);

    if (map(getName, type) === 'Array') {
      //nested arrays
      if (map(getName, map(getTypes, type)) === 'Array') {
        return handleNestedArrays(type);
      }
      return `[${map(getName, map(getTypes, type))}]`;
    }

    const propNames = Object
                     .keys(map(getTypes, type))
                     .filter(filterBlacklist);

    const typeName = propNames
                     .map(y => {
                       return map(getName, get(y, map(getTypes, type)));
                     });

    const objectTypes = propNames
                        .filter((_, i) => typeName[i] === 'Object')
                        .map(y => {
                          const makeChildTypeObject = _.compose(
                                                        first,
                                                        makeTypeObject,
                                                        arrayify,
                                                        get(y),
                                                        map(getTypes)
                                                      );
                          return { [y]: makeChildTypeObject(type) };
                        });

    const otherTypes = propNames
                       .filter((_, i) => typeName[i] !== 'Object')
                       .map((x, i) => {
                         return { [x]: typeName[i] };
                       });

    return _.extend.apply(null, [{}].concat(objectTypes, otherTypes));
  });
};

export default makeTypeObject;
