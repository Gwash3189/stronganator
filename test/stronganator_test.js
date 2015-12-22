/* eslint-env mocha */

import { expect } from 'chai';
import { func, type, T }  from './../src/stronganator';
import { stub } from 'sinon';

describe('Types', () => {
  describe('Type extension', () => {
    it('exists on all inbuilt types', () => {
      expect(T.String.extend)
        .to.be.a('function');
    });

    it('returns a function', () => {
      expect(T.String.extend('action', T.Any))
        .to.be.a('function');
    });

    it('can chain extends', () => {
      const type = T.String
                   .extend('action', T.Any)
                   .extend('another', T.Any);

      expect(type)
        .to.be.a('function');
    });

    it('calls all of the provided checkers with the provided arguments', () => {
      let stubOne = stub().returns(true);
      let stubTwo = stub().returns(true);

      const type = T.String.extend('action', stubOne).extend('another', stubTwo);
      type('asd');

      expect(stubOne.firstCall.args[0])
        .to.equal('asd');

      expect(stubTwo.firstCall.args[0])
        .to.equal('asd');
    });

    it('returns false if one of the provided types does not pass', () => {
      let stubOne = stub().returns(true);
      let stubTwo = stub().returns(false);

      const type = T.String.extend('action', stubOne).extend('another', stubTwo);
      const result = type('asd');

      expect(result)
        .to.be.false;
    });
  });

  describe('Type', () => {
    it('returns true when provided with a Type', () => {
      expect(T.Type(T.String))
        .to.be.true;
    });

    it('returns false when provided with a non-Type', () => {
      expect(T.Type(''))
        .to.be.false;
    });
  });

  describe('Promise', () => {
    it('returns true when provided with a thenable', () => {
      expect(T.Promise({then: () => {}}))
        .to.be.true;
    });

    it('returns false when provided with a non-thenable', () => {
      expect(T.Promise({}))
        .to.be.false;
    });
  });

  describe('Hash', () => {
    it('returns true when provided with a hash', () => {
      expect(T.Hash({}))
        .to.be.true;
    });

    it('returns false when provided with an array', () => {
      expect(T.Hash([]))
        .to.be.false;
    });
  });

  describe('Optional', () => {
    let OptNumber = T.Optional(T.Number);

    it('returns true when provided nothing', () => {
      expect(OptNumber())
        .to.be.true;
    });

    it('returns false when provided a type outside of the provided type, and nil', () => {
      expect(OptNumber(''))
        .to.be.false;
    });

    it('return true when provided a value that matches the provided type', () => {
      expect(OptNumber(1))
        .to.be.true;
    });
  });

  describe('Tuples', () => {
    let testTuple;

    beforeEach(() => {
      testTuple = T.Tuple([T.Type, T.Function]);
    });

    it('returns false if types aren\'t in expected position', () => {
      const result = testTuple([
        () => {}, T.Number
      ]);

      expect(result)
        .to.be.false;
    });

    it('returns true if types aren in expected position', () => {
      const result = testTuple([
        T.Number, () => {}
      ]);

      expect(result)
        .to.be.true;
    });

    it('works together with arrays', () => {
      const tupleArray = T.Array(testTuple);

      const result = tupleArray([
        [T.Number, () => {}]
      ]);

      expect(result)
        .to.be.ok;
    });
  });

  describe('Dates', () => {
    it('has a Date type', () => {
      expect(T.Date)
        .to.be.ok;
    });

    it('returns true when given a date', () => {
      expect(T.Date(new Date()))
        .to.equal(true);
    });

    it('returns false when not given a date', () => {
      expect(T.Date('string'))
        .to.equal(false);
    });
  });

  describe('Array', () => {
    it('has a Array type', () => {
      expect(T.Array)
        .to.be.ok;
    });

    it('accepts a type to describe the type of the array\'s elements', () => {
      const t = T.Array(T.String);

      expect(t(['string']))
        .to.equal(true);
    });

    it('returns true when given an Array', () => {
      expect(T.Array()([]))
        .to.equal(true);
    });

    it('returns false when not given an Array', () => {
      expect(T.Array()('string'))
        .to.equal(false);
    });
  });

  describe('Nil', () => {
    it('has a Nil type', () => {
      expect(T.Nil)
        .to.be.ok;
    });

    it('returns true when given a null || undefined', () => {
      expect(T.Nil(null))
        .to.equal(true);
      expect(T.Nil(undefined))
        .to.equal(true);
      expect(T.Nil())
        .to.equal(true);
    });

    it('returns false when not given a null || undefined', () => {
      expect(T.Nil('string'))
        .to.equal(false);
    });
  });

  describe('String', () => {
    it('has a String type', () => {
      expect(T.String)
        .to.be.ok;
    });

    it('returns true when given a string', () => {
      expect(T.String(''))
        .to.equal(true);
    });

    it('returns false when not given a string', () => {
      expect(T.String(1))
        .to.equal(false);
    });
  });

  describe('Number', () => {
    it('has a Number type', () => {
      expect(T.Number)
        .to.be.ok;
    });

    it('returns true when given a number', () => {
      expect(T.Number(1))
        .to.equal(true);
    });

    it('returns false when not given a number', () => {
      expect(T.Number(''))
        .to.equal(false);
    });
  });

  describe('Boolean', () => {
    it('has a Boolean type', () => {
      expect(T.Boolean)
        .to.be.ok;
    });

    it('returns true when given a boolean', () => {
      expect(T.Boolean(true))
        .to.equal(true);
    });

    it('returns false when not given a boolean', () => {
      expect(T.Boolean(1))
        .to.equal(false);
    });
  });

  describe('Object', () => {
    it('has a Object type', () => {
      expect(T.Object)
        .to.be.ok;
    });

    it('Should accept an object detailing the prop types', () => {
      const t = T.Object({
        name: T.Any
      });

      expect(t)
        .to.be.ok;
    });

    it('returns true when given an object', () => {
      const t = T.Object();

      expect(t({}))
        .to.equal(true);
    });

    it('Should accept another type as a checker', () => {
      const t = type('custom', (x) => x.check);
      const objT = T.Object(t);

      expect(objT({ check: true }))
        .to.be.ok;
    });
  });

  describe('Function', () => {
    it('has a Function type', () => {
      expect(T.Function)
        .to.be.ok;
    });

    it('returns true when given a function', () => {
      expect(T.Function(() => true))
        .to.equal(true);
    });

    it('returns false when not given a function', () => {
      expect(T.Function(1))
        .to.equal(false);
    });

  });

  describe('Error', () => {
    it('has a Error type', () => {
      expect(T.Error)
        .to.be.ok;
    });

    it('returns true when given an error', () => {
      expect(T.Error(new TypeError()))
        .to.equal(true);
    });

    it('returns false when not given a error', () => {
      expect(T.Error(1))
        .to.equal(false);
    });
  });

  describe('RegExp', () => {
    it('has a RegExp type', () => {
      expect(T.RegExp)
        .to.be.ok;
    });

    it('returns true when given a RegExp', () => {
      expect(T.RegExp(/a/))
        .to.equal(true);
    });

    it('returns false when not given a RegExp', () => {
      expect(T.RegExp(1))
        .to.equal(false);
    });

  });

  describe('Union', () => {
    let t;

    beforeEach(() => {
      t = T.Union(T.String, T.Number);
    });

    it('has a Union type', () => {
      expect(T.Union)
        .to.be.ok;
    });

    it('Should accept types explaining the type union', () => {
      expect(t)
        .to.be.a('function');
    });

    it('returns true when given a Union', () => {
      expect(t(1))
        .to.equal(true);

      expect(t(''))
        .to.equal(true);
    });

    it('returns false when given something outside of the union', () => {
      expect(t(/a/))
        .to.equal(false);
    });
  });
});

describe('type errors', () => {
  describe('func', () => {
    const incorrectParamMessage = `Needed [
    "Number",
    "Number"
] but got [1,"2"]`;

    describe('non-generic', () => {
      it('throws a type error detailing the provided types', () => {
        const f = func([T.Number, T.Number]).of((x, y) => x + y);

        expect(() => f(1, '2'))
          .to.throw(TypeError, incorrectParamMessage);
      });

      it('throws a type error detailing the return type', () => {
        const f = func([T.Number, T.Number], T.Number)
                  .of((x, y) => `${x + y}`);

        expect(() => f(1, 1))
          .to.throw(TypeError, 'Function returned a string but needed a Number');
      });
    });

    describe('generics', () => {
      describe('array', () => {
        const genericTypeErrorMessage = `Needed [
    "[String]"
] but got [1]`;

        it('throws a type error detailing the provided generic types', () => {
          const f = func([T.Array(T.String)]).of((x) => x[0]);

          expect(() => f([1]))
            .to.throw(TypeError,genericTypeErrorMessage);
        });

        describe('nested', () => {
          const nestedErrorMessage = `Needed [
    "[[String]]"
] but got [[1]]`;

          it('throws a type error detailing the provided generic types', () => {
            const f = func([T.Array(T.Array(T.String))])
                      .of((x) => x[0]);

            expect(() => f([[1]])).to.throw(TypeError, nestedErrorMessage);
          });
        });
      });

      describe('object', () => {
        const t = T.Object({name: T.String});
        const objectErrorMessage = `Needed [
    {
        "name": "String"
    }
] but got [{"name":1}]`;

        it('throws a type error detailing the provided generic types', () => {
          const f = func([t]).of((x) => x);

          expect(() => f({name: 1}))
            .to.throw(TypeError, objectErrorMessage);

        });

        describe('nested', () => {
          const t = T.Object({
            name: T.Object({
              x: T.String
            })
          });

          const nestedObjectMessage = `Needed [
    {
        "name": {
            "x": "String"
        }
    }
] but got [{"name":{"x":1}}]`;

          it('throws a type error detailing the provided generic types', () => {
            const f = func([t]).of((x) => x);

            expect(() => f({name: {x: 1}}))
              .to.throw(TypeError, nestedObjectMessage);
          });
        });
      });

      describe('object & array', () => {
        const tObject = T.Object({
          name: T.String
        });

        const tArray = T.Array(T.String);

        const objectAndArrayErrorMessage = `Needed [
    {
        "name": "String"
    },
    "[String]"
] but got [{"name":1},1]`;
        it('returns a type error detailing all arguments', () => {
          const f = func([tObject, tArray]).of((x) => x);

          expect(() => f({name: 1}, [1]))
            .to.throw(TypeError, objectAndArrayErrorMessage);
        });

        describe('nested', () => {
          it('returns a type error detailing all arguments', () => {
            const f = func([T.Object({
              name: T.Object({
                x: T.String
              })
            }), T.Array(T.Array(T.String))]).of((x) => x);
            try {
              f({name: 1}, [1]);
            } catch (e) {
              expect(`Needed [
    {
        "name": {
            "x": "String"
        }
    },
    "[[String]]"
] but got [{"name":1},1]`).to.equal(e.message);
            }
          });
        });
      });
    });
  });
});
