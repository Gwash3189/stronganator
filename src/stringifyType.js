import _ from 'lodash';

import {
  filterBlacklist,
  get,
  first,
  arrayify,
  mapName,
  mapTypes,
  apply
} from './utils';

const stringifyType = (types) => {
  const isNonGeneric = (type) => {
    return !mapTypes(type);
  };

  const handleNestedArrays = (type) => {
    const result = stringifyType([
      mapTypes(mapTypes(type))
    ]);
    return `[[${result}]]`;
  };

  return types.map(type => {
    if (isNonGeneric(type)) {
      return mapName(type);
    }

    if (mapName(type) === 'Array') {
      //nested arrays
      if (mapName(mapTypes(type)) === 'Array') {
        return handleNestedArrays(type);
      }
      return `[${mapName(mapTypes(type))}]`;
    }

    const propNames = Object
                     .keys(mapTypes(type))
                     .filter(filterBlacklist);

    const typeName = propNames
                     .map(y => get(y, mapTypes(type)))
                     .map(x => {
                       const propTypeImplementation = x.map(y => y.type);
                       if (propTypeImplementation) {
                         return propTypeImplementation;
                       }
                       return x;
                     })
                     .map(mapName);

    const objectTypes = propNames
                        .filter((_, i) => typeName[i] === 'Object')
                        .map(y => {
                          const makeChildTypeObject = _.compose(
                                                        first,
                                                        stringifyType,
                                                        arrayify,
                                                        get(y),
                                                        mapTypes
                                                      );
                          return { [y]: makeChildTypeObject(type) };
                        });

    const otherTypes = propNames
                       .filter((_, i) => typeName[i] !== 'Object')
                       .map((x, i) => {
                         return { [x]: typeName[i] };
                       });

    return apply(_.extend,[{}].concat(objectTypes, otherTypes));
  });
};

export default stringifyType;
