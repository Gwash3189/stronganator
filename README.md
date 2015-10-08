# stronganator
Types and (optional) run time type checking for JavaScript

## Why

Often when making a public facing API, or an API that injests third party data, you need to take percautions to ensure you're getting the right type of parameters. This usually comes in the form of `typeof` checks or excessive `if` statments.

stronganator was initally built to abstract these checks into a common set of interfaces that can be expanded and built upon.

## Usage

stronganator exports several interfaces, `types`, `type`, `func` and `model`.

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
 * `Array`:   ƒ(types: [Types]) -> ƒ(items: Type) -> Boolean
 * `Object`:  ƒ(types: Object({ typeName: Type })) -> ƒ(item: Object) -> Boolean
 * `Union`:   ƒ(types: [Types]) -> ƒ(items: Any) -> Boolean
 * `Watched`: ƒ(type: Object(Any) || Array(Any)) -> ƒ(item: Object(Any) || Array(Any)) -> Boolean

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

###### Watched

Watched is a special generic as it calls `Object.observe` on the incoming item, and applies the given type to that item every time changes. this provides **run time type checking**

```
const watchedUser = types.Watched(userType);
const gwash = watchedUser({ name: 'gwash' });
gwash.name = 'adam';
gwash.name = 1; // TypeError

```

```
const watchedUsers = types.Watched(types.Array(userType));
const gwashs = watchedUsers([{ name: 'gwash1' }, { name: 'gwash2' }]);

gwashs.push({ name: 'more gwash'});
gwashs.push({ name: 1}); // TypeError;
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

### Models

Stronganator also support models. This is done through the `model` function. The model function works just like the `types.Object` type as it takes a type definition first, then the model. The model is then checked against the type defintion. However, if an error is found then a `TypeError` is thrown with detailed information. Lastly, instead of returning a `Boolean` the `model` function returns the provided object.

```
const user = model({ name: types.String });
console.log(user({ name: 'gwash' })); // { name: 'gwash' }
console.log(user({ name: 1 })); // TypeError Needed {name: String} but got {name: 1}
```

Additionally, the model function enables **run time type checking** through `Object.observe`. This is done by passing `true` as the second argument to the `model` function.

```
const user = model({ name: types.String }, true);
const gwash = user({ name: 'gwash' });
gwash.name = 1 //TypeError TypeError Needed {name: String} but got {name: 1}
```

Lastly, the model function enables a basic form on composition through extention. This is done by providing an `extend` property on the provided object.

```
const user = model({ name: types.String , extend: { getName(){ return this.name } } }, true);
const gwash = user({ name: 'gwash' });
console.log(gwash.getName()); //gwash
```


