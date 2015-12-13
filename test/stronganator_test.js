/* eslint-env mocha */

import { expect } from 'chai';
import { func, type, types }  from './../src/stronganator';

describe('Types', () => {
  describe('Promise', () => {
    it('returns true when provided with a thenable', () => {
      expect(types.Promise({then: () => {}}))
        .to.be.true;
    });

    it('returns false when provided with a non-thenable', () => {
      expect(types.Promise({}))
        .to.be.false;
    });
  });

  describe('Hash', () => {
    it('returns true when provided with a hash', () => {
      expect(types.Hash({}))
        .to.be.true;
    });

    it('returns false when provided with an array', () => {
      expect(types.Hash([]))
        .to.be.false;
    });
  });

  describe('Optional', () => {
    let OptNumber = types.Optional(types.Number);

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
      testTuple = types.Tuple([types.Type, types.Function]);
    });

    it('returns false if types aren\'t in expected position', () => {
      const result = testTuple([
        () => {}, types.Number
      ]);

      expect(result)
        .to.be.false;
    });

    it('returns true if types aren in expected position', () => {
      const result = testTuple([
        types.Number, () => {}
      ]);

      expect(result)
        .to.be.true;
    });

    it('works together with arrays', () => {
      const tupleArray = types.Array(testTuple);

      const result = tupleArray([
        [types.Number, () => {}]
      ]);

      expect(result)
        .to.be.ok;
    });
  });

  describe('Dates', () => {
    it('has a Date type', () => {
      expect(types.Date)
        .to.be.ok;
    });

    it('returns true when given a date', () => {
      expect(types.Date(new Date()))
        .to.equal(true);
    });

    it('returns false when not given a date', () => {
      expect(types.Date('string'))
        .to.equal(false);
    });
  });

  describe('Array', () => {
    it('has a Array type', () => {
      expect(types.Array)
        .to.be.ok;
    });

    it('accepts a type to describe the type of the array\'s elements', () => {
      const t = types.Array(types.String);

      expect(t(['string']))
        .to.equal(true);
    });

    it('returns true when given an Array', () => {
      expect(types.Array()([]))
        .to.equal(true);
    });

    it('returns false when not given an Array', () => {
      expect(types.Array()('string'))
        .to.equal(false);
    });
  });

  describe('Nil', () => {
    it('has a Nil type', () => {
      expect(types.Nil)
        .to.be.ok;
    });

    it('returns true when given a null || undefined', () => {
      expect(types.Nil(null))
        .to.equal(true);
      expect(types.Nil(undefined))
        .to.equal(true);
      expect(types.Nil())
        .to.equal(true);
    });

    it('returns false when not given a null || undefined', () => {
      expect(types.Nil('string'))
        .to.equal(false);
    });
  });

  describe('String', () => {
    it('has a String type', () => {
      expect(types.String)
        .to.be.ok;
    });

    it('returns true when given a string', () => {
      expect(types.String(''))
        .to.equal(true);
    });

    it('returns false when not given a string', () => {
      expect(types.String(1))
        .to.equal(false);
    });
  });

  describe('Number', () => {
    it('has a Number type', () => {
      expect(types.Number)
        .to.be.ok;
    });

    it('returns true when given a number', () => {
      expect(types.Number(1))
        .to.equal(true);
    });

    it('returns false when not given a number', () => {
      expect(types.Number(''))
        .to.equal(false);
    });
  });

  describe('Boolean', () => {
    it('has a Boolean type', () => {
      expect(types.Boolean)
        .to.be.ok;
    });

    it('returns true when given a boolean', () => {
      expect(types.Boolean(true))
        .to.equal(true);
    });

    it('returns false when not given a boolean', () => {
      expect(types.Boolean(1))
        .to.equal(false);
    });
  });

  describe('Object', () => {
    it('has a Object type', () => {
      expect(types.Object)
        .to.be.ok;
    });

    it('Should accept an object detailing the prop types', () => {
      const t = types.Object({
        name: types.Any
      });

      expect(t)
        .to.be.ok;
    });

    it('returns true when given an object', () => {
      const t = types.Object();

      expect(t({}))
        .to.equal(true);
    });

    it('Should accept another type as a checker', () => {
      const t = type('custom', (x) => x.check);
      const objT = types.Object(t);

      expect(objT({ check: true }))
        .to.be.ok;
    });
  });

  describe('Function', () => {
    it('has a Function type', () => {
      expect(types.Function)
        .to.be.ok;
    });

    it('returns true when given a function', () => {
      expect(types.Function(() => true))
        .to.equal(true);
    });

    it('returns false when not given a function', () => {
      expect(types.Function(1))
        .to.equal(false);
    });

  });

  describe('Error', () => {
    it('has a Error type', () => {
      expect(types.Error)
        .to.be.ok;
    });

    it('returns true when given an error', () => {
      expect(types.Error(new TypeError()))
        .to.equal(true);
    });

    it('returns false when not given a error', () => {
      expect(types.Error(1))
        .to.equal(false);
    });
  });

  describe('RegExp', () => {
    it('has a RegExp type', () => {
      expect(types.RegExp)
        .to.be.ok;
    });

    it('returns true when given a RegExp', () => {
      expect(types.RegExp(/a/))
        .to.equal(true);
    });

    it('returns false when not given a RegExp', () => {
      expect(types.RegExp(1))
        .to.equal(false);
    });

  });

  describe('Union', () => {
    let t;

    beforeEach(() => {
      t = types.Union(types.String, types.Number);
    });

    it('has a Union type', () => {
      expect(types.Union)
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
        const f = func([types.Number, types.Number]).of((x, y) => x + y);

        expect(() => f(1, '2'))
          .to.throw(TypeError, incorrectParamMessage);
      });

      it('throws a type error detailing the return type', () => {
        const f = func([types.Number, types.Number], types.Number)
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
          const f = func([types.Array(types.String)]).of((x) => x[0]);

          expect(() => f([1]))
            .to.throw(TypeError,genericTypeErrorMessage);
        });

        describe('nested', () => {
          const nestedErrorMessage = `Needed [
    "[[String]]"
] but got [[1]]`;

          it('throws a type error detailing the provided generic types', () => {
            const f = func([types.Array(types.Array(types.String))])
                      .of((x) => x[0]);

            expect(() => f([[1]])).to.throw(TypeError, nestedErrorMessage);
          });
        });
      });

      describe('object', () => {
        const t = types.Object({name: types.String});
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
          const t = types.Object({
            name: types.Object({
              x: types.String
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
        const tObject = types.Object({
          name: types.String
        });

        const tArray = types.Array(types.String);

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
            const f = func([types.Object({
              name: types.Object({
                x: types.String
              })
            }), types.Array(types.Array(types.String))]).of((x) => x);
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
