import _ from 'lodash';

export const blacklist = ['extend', 'options', '__set'];
export const get = _.curry((name, obj) => obj[name]);
export const getName = get('name');
export const getTypes = get('types');
export const map = _.curry((f, a) => a.map(f));
export const mapName = map(getName);
export const mapTypes = map(getTypes);
export const first = (arr) => arr[0];
export const second = (arr) => arr[1];
export const third = (arr) => arr[2];
export const arrayify = (n) => [n];
export const filterBlacklist = (x) => blacklist.indexOf(x) === -1;
export const apply = (func, arr) => func.apply(null, arr);
export const functor = (f) => (fun) => fun(f());
export const stringify = (json) => JSON.stringify(json, null, 4);
