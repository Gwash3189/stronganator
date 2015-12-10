import func from './func';
import T from './types';
import { first, second, apply, mapName } from './utils';

const MatcherUnion = T.Tuple([T.Type, T.Function]);
const MatcherList = T.Array(MatcherUnion);

const errorHandler = (matchedValue, results) => {
  let message = `${matchedValue} matched more than one type. Only one type must be matched.\n`;
  message = message + results.map(result => {
    return `Type: ${mapName(first(result))}, Result: ${second(result)}`;
  }).join('\n');
  throw new TypeError(message);
};

const matchHandler = (matcherList) => {
  let innerMatchUnion;

  innerMatchUnion = apply(T.Union, matcherList);

  return func([innerMatchUnion], T.Any)
         .of((x) => {
           let results = [],
               value;

           matcherList.forEach(pair => {
             const type = first(pair);
             if (type(x)) {
               value = second(pair)(x);
               results.push([first(pair), value]);
             }
           });

           if (results.length > 1) {
             errorHandler(x, results);
           }

           return value;
         });
};

const match = func([MatcherList], T.Function)
              .of(matchHandler);

export default match;
