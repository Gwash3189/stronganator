# stronganator
Types with run time type checking for JavaScript

## Why

To keep some sanity in large projects, and to provide detailed debugging information to developers.

## Usage

Stronganator exports several interfaces, `types`, `type`, `func`, `model` and `match`;

### Types

`import { T } from 'stronganator'`

`T` is an object that has several properties hanging off of it. These properties are functions that take a single parameter and return a `Boolean`. These functions check the provided parameter to see if it is of a certain type, and return the result. An example of the `Number` type is

```javascript
console.log(T.Number(1)); // true
console.log(T.Number('1')); // false
```

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

All the above functions can be called in the the following manner.

```javascript
if(T.Date(item)) {...}
...
items.filter(T.String) //filters out all non strings
```

#### Custom types

To make your own types with stronganator you can use the `type` factory function. It is a higher order function which takes three parameters.

`type(name: string, checker: function, types: object || array)`

 * **name** is the name of the type, such as `Boolean` or `User`.
 * **checker** is the function that is responsible for checking if the item prescribes the the desired type. For example, the checker for the Nil type is `(nil) => nil === null || nil === undefined`.
 * **types** used for detailed error reporting when creating **generics**.

##### Example

###### Non-generic

```javascript
const Nil = type('Nil', (nil) => nil === null || nil === undefined); //non-generic
```

###### Generic
```javascript
const Array = (internalType) => {
  return type('Array', (arr) => arr.every(internalType), internalType);
};

const StringArray = T.Array(T.String);
```

#### Generics

Stronganator has the power to model generic types, this is done through the use of higher order functions. An example of a generic type is an `Array` as it simply a container for other values. To use the Array type (and any generic type) you must first provide a type definition. Then, a function is returned that validates that type definition against the provided data.

The provided generic types are
 * `Array`:   `ƒ(types: [Types]) -> ƒ(items: Type) -> Boolean`
 * `Object`:  `ƒ(types: Object({ typeName: Type })) -> ƒ(item: Object) -> Boolean`
 * `Union`:   `ƒ(types: [Types]) -> ƒ(items: Any) -> Boolean`
 * `Tuple`:   `ƒ(types: [Type1, Type2 ...]) -> ƒ(tuple: [type1, type2 ...]) -> Boolean`
 * `Optional`:   `ƒ(type: Type) -> ƒ(x: Type || Nil) -> Boolean`

##### Usage

###### Object

The Object generic consumes an object that defines the types of it's properties.
It then returns a function who is passed an object, and validates the properties of that function against the original provided T.

```javascript
const User = T.Object({
	name: T.String
});
// returns a function that checks that the provided item is of type { name: type.String }.

console.log(User({ name: 'gwash' })); // true
console.log(User({ name: 1 })); // false
```

You can also nest Object types such as

```javascript
const DetailedUser = T.Object({
  name: T.String,
  details: T.Object({
    phoneNumber: T.Number,
    address: T.String
  });
})

console.log(DetailedUser({
  name: 'gwash',
  details: {
    phoneNumber: 555,
    address: 'no where'
  }
})); //true

console.log(DetailedUser({
  name: 'gwash',
  details: {
    phoneNumber: 555,
    address: 123
  }
})); //false
```
###### Array

```javascript
const UserArray = T.Array(userType);
// returns a function that checks that all elements pass the provided type checking
console.log(UserArray([
    { name: 'gwash' }
]); // true

console.log(UserArray([
  {name: 1}
]); // false
```

###### Union

```javascript
const Student = type('Student', (x) => T.Number(x.id));

const StudentUserUnion = T.Union([Student, User]);

console.log(StudentUserUnion({ name: 'gwash' })); //true
console.log(StudentUserUnion({ id: 1})); //true
console.log(StudentUserUnion({ name: 1 })); //false
console.log(StudentUserUnion({ id: '1' })); //false
```

###### Tuple

```javascript
const Student = T.Tuple([T.String, T.Number]);
//position 1 must be a string
//position 2 must be a number

console.log(Student(['gwash', 1234])) //true

console.log(Student([1234, 'gwash'])) //false
```

###### Optional

```javascript
const OptionalNumber = T.Optional(T.Number);
console.log(OptionalNumber(4)) //true
console.log(OptionalNumber('')) //false
console.log(OptionalNumber()) //true
```

##### Type Extension

Types can be extended. This creates a strict union between the parent type, and the child type.

###### Example

```javascript
const ActionType = T.String.extend('Action', (s) => s.indexOf('/') > 0);
const RandomActionType = ActionType.extend('RandomAction', s => s.indexOf('random') > 0);

console.log(ActionType('/')) //true
console.log(RandomAction('/random')) //true
console.log(RandomAction('random')) //false
```

### Functions

`import { func } from 'stronganator';`

Stronganator also does typed functions. This is done through the `func` higher order function. The function signature for `func` is

`func(type: [Type] || Type, returnType: Any?) -> { of: (ƒ -> returnType) } -> ƒ`

 * `types` is an array who elements match up to the provided parameters. For example, the following call, `func([type.Date])`, would expect that the first parameter to is a Date.
 * `returnType`: is simply a Type (created with the `type` function) that ensures the type of `returnType`.

#### Example
```javascript
const getName = func([User], T.String).of((user) => user.name);
console.log(getName({name: 'gwash'})); // 'gwash'
console.log(getName({name: 1})); // TypeError: Function returned a number but needed a String
```

```javascript
const getName = func([userType], T.String).of((user) => 1);
console.log(getName({name: 'gwash'})); // TypeError: Needed [{ "name": "String"}] but got [{"name":1}]
```

### Pattern Matching

`import { match } from 'stronganator';`

match: `ƒ(tuples: [[Type, Function], ...]) -> ƒ(items: Type) -> Any`

Pattern matching works by accepting a list of Tuples.
These Tuples are of `[type.Type, type.Function]`.

The `match` function returns the pattern matching function.
This pattern matching function accepts **only the types that are to be matched upon**

#### Example

```javascript
const Match = match([
  [T.String, (str) => console.log('String:', str)],
  [T.Number, (n) => console.log('Number:', n)]
]);

console.log(Match(5)) //Number: 5
console.log(Match('5')) //String: 5

console.log(Match({})) // TypeError: Needed ["Number || Even"] but got [{}]
```

Additionally, if there are multiple matches for a provided argument, a `TypeError` will be thrown.


```javascript
const Match = match([
  [T.Number, (n) => n * 1
  [T.Number, (n) => n * 2
]);

console.log(Match('5')) //TypeError: 5 matched more than one type. Only one type must be matched. Type: Number, Result: 5 Type: Number, Result: 10
```

### Model

`import { model } from 'stronganator'`

Used to describe a class, model or objects types. The resulting type only checks the for defined properties. It will not type check undefined properties;

object: `ƒ(object: {property: PropertyType}) -> ƒ(object: PropertyType) -> PropertyType`

**Note** Use `function` keyword to make typed functions here, so they get bound to the object instance
#### Example

```javascript
const UserType = model({
  name: T.String,
  setName: T.Function,
  getName: T.Function
});
let user;

user = UserType({
  name: 'Adam',
  setName: func(T.String)
           .of(funtion(name) {
             this.name = name;
           }),
  getName: func([], T.String)
           .of(function() {
             return this.name;
           }),
}); // returns instance

user = UserType({
  name: 'Adam',
  setName: func(T.String)
           .of(funtion(name) {
             this.name = name;
           }),
  getName: func([], T.String)
           .of(function() {
             return this.name;
           }),
  birthday: new Date() //untyped and unchecked
});

user = UserType({
  name: 'Adam',
  setName: func(T.String)
           .of(funtion(name) {
             this.name = name;
           })
}); //TypeError

```

If you would prefer to use the ES6 function syntax `() => {}` then the object instance is available as the last parameter.

```javascript
const UserType = model({
  name: T.String,
  setName: T.Function,
  getName: T.Function
});
let user;

user = UserType({
  name: 'Adam',
  setName: func(T.String)
           .of((name, user) => {
             user.name = name;
           }),
  getName: func([], T.String)
           .of((user) => {
             return user.name;
           }),
}); // returns instance
```

#### Extension

Model types can be extended by using the `.extend` method.

##### Example

```javascript
const StudentType = UserType.extend({
  id: T.String
});
...

const student = StudentType({
  name: 'Adam',
  getName() {},
  setName() {},
  id: '123'
}); //returns instance

const student = StudentType({
  name: 'Adam',
  getName() {},
  setName() {},
  id: 123
}); //TypeError
```
