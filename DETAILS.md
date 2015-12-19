# Type
Types a created by using the `type` factory. It has the following function signature

`type(name:string, implementation: (...args) => Boolean, typesList: [Type])`

* **name**: Used for detailed errors
* **implementation**: The actual implementation of the type. Expected to take the items to be checked, and returned a boolean.
* **types**: If the type is a generic & accepts multiple, a list of the multiple types is expected.

## Usage

Types should used as the lowest level of this type system. The provide no other implementation than a type check, and returning a boolean.

Types should be used in conjunction with the other high-level interfaces such as `func`,  `model` and `match`

## Example

```javascript
const String = type('String', s => typeof s === 'string')
```

```javascript
const Tuple = (typeList) => {
  return type('Tuple', (list) => {
    return list.every((x, i) => typeList[i](x));
  }, typeList);
};
```

# Non-generic Types

the `types` object contains all of the in built supported types.

A list of the provided types is below.

 * `Any`: always returns `true`,
 * `Truthy`: returns true if the item is `truthy`,
 * `Falsey`: returns false if the item is `falsey`,
 * `Date`: returns true if the item is of `new Date`,
 * `Nil`: returns true if the item is `null` or `undefined`,
 * `String`: returns true if the item is a `string`,
 * `Number`: returns true if the item is a `number`,
 * `Boolean`: returns true if the item is a `boolean`,
 * `Function`: returns true if the item is a `function`,
 * `Error` returns true if the item is an `instanceof` `Error`,
 * `RegExp`: returns true if the item is an `instanceof` `RegExp`
 * `Hash`: returns true if the item is an `object`.

# Generic types

Stronganator has support for generic types. The inbuilt generic types are

* `Array`:   `ƒ(types: [Types]) -> ƒ(items: Type) -> Boolean`
* `Object`:  `ƒ(types: Object({ typeName: Type })) -> ƒ(item: Object) -> Boolean`
* `Union`:   `ƒ(types: [Types]) -> ƒ(items: Any) -> Boolean`
* `Tuple`:   `ƒ(types: [Type1, Type2 ...]) -> ƒ(tuple: [type1, type2 ...]) -> Boolean`
* `Optional`:   `ƒ(type: Type) -> ƒ(x: Type || Nil) -> Boolean`

**Generic Types can not be extended until they are further defined**

```javascript
T.Object.extend //no
T.Object({name: T.String}).extend //yes
```


## Implementing a new generic

```javascript
const GenericString = (contains) => {
  return T.String.extend('Generic String', (s) => s.indexOf(contains) > 0);
}

const HttpsURL = GenericString('https://');

console.log(HttpsURL('https://github.com')) //true
console.log(HttpsURL('http://github.com')) //false
```
