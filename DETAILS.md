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

# Integration with legacy / existing code

## Functions as classes

```javascript
var User = function(name) {
  this.name = name;
};

// adding stronganator

var UserType = T.Object({
  name: T.String
});

var User = func([T.String], UserType)
           .of(function(name) {
             this.name = name;
           });
```

## ES6 Classes

```javascript
// user.js
class User {
  constructor(name) {
    this.name = name;
  }
}

export default User;

//adding stronganator

//user.js
var UserType = T.Object({
  name: T.String
});

class User {
  constructor(name) {
    this.name = name;
  }
}

export default func([T.String], UserType)
               .of((name) => {
                 return new User(name);
               });
```

# Func

Typed functions are created by combining types, and the `func` interface.

## Usage

`func` takes a `function` and returns a `function`. The exact function definition is.

`func(T.Array(T.Type), ReturnType?) -> {of: (T.Function() -> ReturnType)}`
`func(T.Type) -> {of: (T.Function(T.Type) -> T.Any)}`

* **T.Array(T.Type)**: Should be an array of types. Such as `T.String` or a custom type.
  * **T.Type**: Can also be a single type. By using this signature, we assume your function will return a type of `Any` and only has one parameter
* **ReturnType?**: Is an optional parameter, if it is not included, the type of `Any` will be used.
* **of**: is a function, which takes a function that returns the provided `ReturnType`. The parameter types provided to `func` should match in position to the parameters passed to this function.

## Example

```javascript
func([T.String], T.Object({name: T.String}))
.of((name) => {
  return {
    name: name
  }
});
//or
func(T.String) //only type checks the first parameter
.of((name) => {
  return {
    name: name
  }
});
```

# Pattern Matching

Pattern Matching is done through using the `match` function. This function expects pairs (Tuples) of `[Type, Function]`. `match` returns a function, so deep pattern matching is possible.

A match function can only be called with types in which it can match. For example, the following match can only be called with `numbers` and `strings`.

```javascript
const StringNumberMatch = match([
  [T.String, (name) => name.toUpperCase()],
  [T.Number, (n) => n * 2],
]);
```

Calling it with any other type will result in a `TypeError`

Additionally, a type can not match multiple types with the pattern match.

```javascript
const StringNumberMatch = match([
  [T.String, (name) => name.toUpperCase()],
  [T.String, (name) => name.toLowerCase()],
]);
```

Calling the resulting function with a string will also cause a `TypeError`

## Usage
```javascript
match([
  [T.Type, T.Function(T.Type)]
])
```

* **Type**: any type created with a in-built type, or a custom type.
* **func**: A function, that must handle the type provided to it. Functions provided to the `match` interface are automatically typed with their matching type. Such as, `T.Function(T.Type)` will become `func(T.Type).of(...)`

```javascript
const UrlTypeMatch = match([
  [HttpsType, () => return 'its https' ],
  [HttpType, () => return 'its http' ]
]);

const UrlMatch = match([
  [UrlType, UrlTypeMatch]
])
```

# Model

Model is used to create classes, models, really any object that you want to create multiple instances of.

`model(ModelDefinition) -> constructorFunction(T.ModelDefinition) -> Model`

* **ModelDefinition**: An object with key:type pairs that describe the model.

## Usage

```javascript

const User = model({
  name: T.String,
  details: T.Object({
    
  })
});
// or
const User = model({
  name: T.String,
  details: DetailsModel
});

```
