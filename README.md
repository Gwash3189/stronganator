# stronganator
Types and (optional) run time type checking for JavaScript

## Why

Often when making a public facing API, or an API that injests third party data, you need to take percautions to ensure you're getting the right type of parameters. This usually comes in the form of `typeof` checks or excessive `if` statments.

stronganator was initally built to abstract these checks into a common set of interfaces that can be expanded and built upon.

## Usage

stronganator exports several interfaces, `types`, `type`, `func` and `match`;

### Types

`types` is an object that has several properties hanging off of it. These properties are functions that take a single parameter and return a `Boolean`. These functions check the provided parameter to see if it is of a certain type, and return the result. An example of the `Number` type is

```
console.log(types.Number(1)); // true
console.log(types.Number('1')); // false
```

A list of the provided types is below.

 * `Any`: always retuns `true`,
 * `Truthy`: returns true if the item is `truthy`,
 * `Falsey`: returns false if the item is `falsey`,
 * `Date`: returns true if the item is of `new Date`,
 * `Nil`: returns true if the item is `null` or `undefined`,
 * `String`: returns true if the item is a `string`,
 * `Number`: returns true if the item is a `number`,
 * `Boolean`: returns true if the item is a `boolean`,
 * `Function`: returns true if the item is a `function`,
 * `Error` returns true if the item is an instanceof `Error`,
 * `RegExp`: returns true if the item is an instance of `RegExp`

All the above functions can be called in the the following mannor.

```
if(types.Date(item)) {...}
...
items.filter(types.String) //filters out all non strings
```

#### Custom types

To make your own types with stronganator you can use the `type` factory function. It is a higher order function which takes three parameters.

`type(name: string, checker: function, types: object || array)`

 * **name** is the name of the type, such as `Boolean` or `User`.
 * **checker** is the function that is responsible for checking if the item prescribes the the desired type. For example, the checker for the Nil type is `(nil) => nil === null || nil === undefined`.
 * **types** not really important yet, but it's used for error reporting on generic types.

##### Example

`const Nil = type('Nil', (nil) => nil === null || nil === undefined);`

#### Generics

Stronganator has the power to model generic types, this is done through the use of higher order functions. An example of a generic type is an `Array` as it simply a container for other values. To use the Array type (and any generic type) you must first provide a type definition. Then, a function is returned that validates that type definition.

The provided generic types are
 * `Array`:   `ƒ(types: [Types]) -> ƒ(items: Type) -> Boolean`
 * `Object`:  `ƒ(types: Object({ typeName: Type })) -> ƒ(item: Object) -> Boolean`
 * `Union`:   `ƒ(types: [Types]) -> ƒ(items: Any) -> Boolean`
 * `Tuple`:   `ƒ(types: [Type1, Type2 ...]) -> ƒ(tuple: [type1, type2 ...]) -> Boolean`

##### Usage

###### Object

The object generic type consumes an Object that defines the types of it's properties. It then returns a function who is passed an object, and validates the properties of that function against the original provided types.

```
const userType = types.Object({
	name: types.String
});
// returns a function that checks that the provided item is of type { name: type.String }.

console.log(userType({ name: 'gwash' })); // true
console.log(userType({ name: 1 })); // false
```

You can also nest Object types such as

```
const detailedUser = types.Object({
  name: types.String,
  details: types.Object({
    phoneNumber: types.Number,
    address: types.String
  });
})

console.log(detailedUser({ name: 'gwash', details: { phoneNumber: 555, address: 'no where' } })); //true
console.log(detailedUser({ name: 'gwash', details: { phoneNumber: 555, address: 123 } })); //false
```
###### Array

```
const usersType = types.Array(userType);
// returns a function that checks that all elements pass the provided type checking
console.log(usersType(
    [
        { name: 'gwash' }
    ]
); // true
console.log(usersType(
    [
        {name: 1}
    ]
); // false
```

###### Union

```
const studentType = type('Student', (x) => types.Number(x.id));

const studentUserUnion = types.Union([studentType, userType]);

console.log(studentUserUnion({ name: 'gwash' })); //true
console.log(studentUserUnion({ id: 1})); //true
console.log(studentUserUnion({ name: 1 })); //false
console.log(studentUserUnion({ id: '1' })); //false
console.log(studentUserUnion({ id: '1' })); //false
```

###### Tuple
**Note** the type in position one, must match the data in position one, and so on.

```
const Student = types.Tuple([types.String, types.Number]);
//position 1 must be a string
//position 2 must be a number

console.log(Student(['gwash', 1234])) //true
console.log(Student([1234, 'gwash'])) //false
```
### Functions

Stronganator also does typed functions. This is done through the `func` higher order function. The function signature for `func` is

`func(types: [Type], returnType: Type || Nil) -> { of: (ƒ -> returnType) } -> ƒ`

 * `types` is an array who elements match up to the provided parameters. For example, the following call, `func([type.Date])`, would expect that the first parameter to is a Date.
 * `returnType`: is simply a Type (created with the `type` function) that ensures the type of `returnType`.

#### Example
```
const getName = func([userType], types.String).of((user) => user.name);
console.log(getName({name: 'gwash'})); // 'gwash'
console.log(getName({name: 1})); // TypeError (incorrect parameter type)
```

```
const getName = func([userType], types.String).of((user) => 1);
console.log(getName({name: 'gwash'})); // TypeError (incorrect return type)
```
### Pattern Matching

match: `ƒ(tuples: [[Type, Function], ...]) -> ƒ(items: Type) -> Any`

Pattern matching works by accepting a list of Tuples.
These Tuples are of `[type.Type, type.Function]`.

The `match` function returns the pattern matching function.
This pattern matching function accepts **only the types that are to be matched upon**

#### Example

```
const Match = match([
  [types.String, (str) => console.log('String:', str)],
  [types.Number, (n) => console.log('Number:', n)]
]);

console.log(Match(5)) //Number: 5
console.log(Match('5')) //String: 5

console.log(Match({})) // TypeError
```

Additionally, if there are multiple matches for a provided argument, a `TypeError` will be thrown.


```
const Match = match([
  [types.String, (str) => console.log('String:', str)],
  [types.String, (str) => console.log('Another String:', str)],
]);

console.log(Match('5')) //TypeError
```
