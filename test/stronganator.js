import { expect } from 'chai';
import { model, func, type, types }  from './../src/stronganator';


describe('Types', () => {
  describe('Watched', () => {
    it('Should have a Watched type', () => {
      expect(types.Watched).to.be.ok;
    });
    it('Should return a function when given a type', () => {
      expect(types.Watched()).to.be.a('function');
    });
    it('Should call the provided type checker when given a value', () => {
      expect(types.Watched(types.Object({name:types.String}))({name: 1})).to.not.be.ok;
    })
  });
  describe('Dates', () => {
    it('Should have a Date type', () => {
      expect(types.Date).to.be.ok;
    });
    it('Should return true when given a date', () => {
      expect(types.Date(new Date())).to.equal(true);
    });
    it('Should return false when not given a date', () => {
      expect(types.Date('string')).to.equal(false);
    });
  });
  describe('Array', () => {
    it('Should have a Array type', () => {
      expect(types.Array).to.be.ok;
    });
    it('Should accept a type to describe the type of the array\'s elements', () => {
      expect(types.Array(types.String)(['string'])).to.equal(true);
    });
    it('Should return true when given an Array', () => {
      expect(types.Array()([])).to.equal(true);
    });
    it('Should return false when not given an Array', () => {
      expect(types.Array()('string')).to.equal(false);
    });
  });
  describe('Nil', () => {
    it('Should have a Nil type', () => {
      expect(types.Nil).to.be.ok;
    });
    it('Should return true when given a null || undefined', () => {
      expect(types.Nil(null)).to.equal(true);
      expect(types.Nil(undefined)).to.equal(true);
      expect(types.Nil()).to.equal(true);
    });
    it('Should return false when not given a null || undefined', () => {
      expect(types.Nil('string')).to.equal(false);
    });
  });
  describe('String', () => {
    it('Should have a String type', () => {
      expect(types.String).to.be.ok;
    });
    it('Should return true when given a string', () => {
      expect(types.String('')).to.equal(true);
    });
    it('Should return false when not given a string', () => {
      expect(types.String(1)).to.equal(false);
    });
  });
  describe('Number', () => {
    it('Should have a Number type', () => {
      expect(types.Number).to.be.ok;
    });
    it('Should return true when given a number', () => {
      expect(types.Number(1)).to.equal(true);
    });
    it('Should return false when not given a number', () => {
      expect(types.Number('')).to.equal(false);
    });
  });
  describe('Boolean', () => {
    it('Should have a Boolean type', () => {
      expect(types.Boolean).to.be.ok;
    });
    it('Should return true when given a boolean', () => {
      expect(types.Boolean(true)).to.equal(true);
    });
    it('Should return false when not given a boolean', () => {
      expect(types.Boolean(1)).to.equal(false);
    });
  });
  describe('Object', () => {
    it('Should have a Object type', () => {
      expect(types.Object).to.be.ok;
    });
    it('Should accept an object detailing the prop types', () => {
      expect(types.Object({
        name: types.Any
      })).to.be.ok;
    });
    it('Should return true when given an object', () => {
      expect(types.Object()({})).to.equal(true);
    });
    it('Should accept another type as a checker', () => {
      const t = type('custom', (x) => x.check);
      const objT = types.Object(t);
      expect(objT({
        check: true
      })).to.be.ok
    });
  });
  describe('Function', () => {
    it('Should have a Function type', () => {
      expect(types.Function).to.be.ok;
    });
    it('Should return true when given a function', () => {
      expect(types.Function(() => true)).to.equal(true);
    });
    it('Should return false when not given a function', () => {
      expect(types.Function(1)).to.equal(false);
    });
  });
  describe('Error', () => {
    it('Should have a Error type', () => {
      expect(types.Error).to.be.ok;
    });
    it('Should return true when given an error', () => {
      expect(types.Error(new TypeError())).to.equal(true);
    });
    it('Should return false when not given a error', () => {
      expect(types.Error(1)).to.equal(false);
    });
  });
  describe('RegExp', () => {
    it('Should have a RegExp type', () => {
      expect(types.RegExp).to.be.ok;
    });
    it('Should return true when given a RegExp', () => {
      expect(types.RegExp(/a/)).to.equal(true);
    });
    it('Should return false when not given a RegExp', () => {
      expect(types.RegExp(1)).to.equal(false);
    });
  });
  describe('Union', () => {
    it('Should have a Union type', () => {
      expect(types.Union).to.be.ok;
    });
    it('Should accept types explaining the type union', () => {
      expect(types.Union(types.String, types.Number)).to.be.a('function');
    });
    it('Should return true when given a Union', () => {
      expect(types.Union(types.String, types.Number)(1)).to.equal(true);
      expect(types.Union(types.String, types.Number)('')).to.equal(true);
    });
    it('Should return false when given something outside of the union', () => {
      expect(types.Union(types.String, types.Number)(/a/)).to.equal(false);
    });
  });
});
describe('Funcs', () => {
  it('Should provide a func endpoint', () => {
    expect(func).to.be.ok;
    expect(func).to.be.a('function');
  });
  it('Should provide a function which takes a list of types, and a return type', () => {
    expect(func([types.Number], types.String)).to.be.ok;
  });
  it('Should return an object with an \'of\' function', () => {
    expect(func([types.Number], types.String).of).to.be.ok;
    expect(func([types.Number], types.String).of).to.be.a('function');
  });
  describe('Of', () => {
    it('Should take a function and return a new function', () => {
      expect(func([types.Number], types.String).of(() => '')).to.be.a('function');
    });
    it('Should throw an error if the incorrect types are past to or returned from the function', () => {
      const f = func([types.Number], types.String).of(() => true);
      expect(() => f('')).to.throw(TypeError);
      expect(() => f(1)).to.throw(TypeError);
    });
    it('Should not throw an error if the correct types are past to and returned from the function', () => {
      const f = func([types.Number], types.String).of(() => '');
      expect(() => f(1)).to.not.throw(TypeError);
    });
  });
});
describe('Model', () => {
  it('Should provide a model end point', () => {
    expect(model).to.be.ok;
    expect(model).to.be.a('function');
  });
  it('Should consume an object with type functions and return a function', () => {
    expect(model({
      name: type.String
    })).to.be.ok;
    expect(model({
      name: type.String
    })).to.be.a('function');
  });
  it('Should compair the provided props to the provided type', () => {
    let type = model({
      name: types.String
    });
    expect(type({
      name: ''
    })).to.be.ok;
    expect(type({
      name: ''
    })).to.be.a('object');
  });
  it('Should throw an error if the provided props don\'t match the provided type', () => {
    let type = model({
      name: types.String
    });
    expect(() => type({
      name: 1
    })).to.throw(TypeError);
  });
  it('When provided a valid nested strucutre, it should return an object', () => {
    let type = model({
      obj: types.Object({
        stuff: types.String
      })
    });
    expect(type({
      obj: {
        stuff: ''
      }
    })).to.be.a('object');
  });
  it('When provided an invalid nested strucutre, it should throw a type error', () => {
    let type = model({
      obj: types.Object({
        stuff: types.String
      })
    });
    expect(() => type({
      obj: {
        stuff: 1
      }
    })).to.throw(TypeError);
  });
  it('Should work in combination with custom types', () => {
    let player = model({
      name: types.String,
      comments: types.Array(types.String),
      goals: types.Number,
      assits: types.Number
    });

    let team = model({
      players: types.Array(player)
    });

    expect(team({
      players: [{
        name: 'Adam',
        comments: ['comment'],
        goals: 4,
        assits: 1
      }]
    })).to.be.ok;
  });

  it('Should still throw TypeError\'s in combination with custom types', () => {
    let player = model({
      name: types.String,
      comments: types.Array(types.String),
      goals: types.Number,
      assits: types.Number
    });

    let team = model({
      players: types.Array(player)
    });

    expect(() => {
      team({
        players: [{
          name: 1,
          comments: ['comment'],
          goals: 4,
          assits: 1
        }]
      });
    }).to.throw(TypeError);
  });
  describe('check', () => {
    it('Should throw a type error if the check fails', () => {
      const t = model({
        name: types.String
      }, true);
      const adam = t({name: 'adam'});
      adam.name = 1;
      expect(adam.check).to.throw(TypeError)
    });
    it('Should throw a type error with a good message if the check fails', () => {
      const t = model({
        name: types.String
      }, true);
      const adam = t({name: 'adam'});
      adam.name = 1;
      try {
        adam.check();
      } catch (e) {
        expect(e.message).to.equal('Needed [{"name":"String"}] but got {"name":1}')
      }
    });
  });
});
describe('type errors', () => {

  describe('func', () => {
    describe('non-generic', () => {
      it('Should throw a type error detailing the provided types', () => {
        const f = func([types.Number, types.Number]).of((x, y) => x + y);
        try {
          f(1,'2');
        } catch (e) {
          expect(`Needed [
    "Number",
    "Number"
] but got [1,"2"]`).to.equal(e.message)
        }
      });
      it('Should throw a type error detailing the return type', () => {
        const f = func([types.Number, types.Number], types.Number).of((x, y) => `${x + y}`);
        try {
          f(1,1);
        } catch (e) {
          expect(`Function returned a string but needed a Number`).to.equal(e.message)
        }
      });
    });
    describe('generics', () => {
      describe('array', () => {
        it('Should throw a type error detailing the provided generic types', () => {
          const f = func([types.Array(types.String)]).of((x) => x[0]);
          try {
            f([1]);
          } catch (e) {
            expect(`Needed [
    "[String]"
] but got [1]`).to.equal(e.message)
          }
        });
        describe('nested', () => {
          it('Should throw a type error detailing the provided generic types', () => {
            const f = func([types.Array(types.Array(types.String))]).of((x) => x[0]);
            try {
              f([[1]]);
            } catch (e) {
              expect(`Needed [
    "[[String]]"
] but got [[1]]`).to.equal(e.message)
            }
          });
        });
      });
      describe('object', () => {
        it('Should throw a type error detailing the provided generic types', () => {
          const f = func([types.Object({name: types.String})]).of((x) => x);
          try {
            f({name: 1});
          } catch (e) {
            expect(`Needed [
    {
        "name": "String"
    }
] but got [{"name":1}]`).to.equal(e.message)
          }
        });
        describe('nested', () => {
          it('Should throw a type error detailing the provided generic types', () => {
            const f = func([types.Object({
              name: types.Object({
                x: types.String
              })
            })]).of((x) => x);
            try {
              f({name: {x: 1}});
            } catch (e) {
              expect(`Needed [
    {
        "name": {
            "x": "String"
        }
    }
] but got [{"name":{"x":1}}]`).to.equal(e.message)
            }
          });
        });
      });
      describe('object & array', () => {
        it('should return a type error detailing all arguments', () => {
          const f = func([types.Object({
              name: types.String
            }), types.Array(types.String)]).of((x) => x);
            try {
              f({name: 1}, [1]);
            } catch (e) {
              expect(`Needed [
    {
        "name": "String"
    },
    "[String]"
] but got [{"name":1},1]`).to.equal(e.message)
            }
        });
        describe('nested', () => {
          it('should return a type error detailing all arguments', () => {
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
] but got [{"name":1},1]`).to.equal(e.message)
              }
          });
        });
      });
      describe('all types', () => {
        it('should return a type error detailing all arguments', () => {
          const f = func([types.Object({
                name: types.Object({
                  x: types.String
                })
              }), types.Array(types.Array(types.String)), types.Number, types.Date]).of((x) => x);
              try {
                f({name: {x: ''}}, [['']], 1, 1);
              } catch (e) {
                expect(`Needed [
    {
        "name": {
            "x": "String"
        }
    },
    "[[String]]",
    "Number",
    "Date"
] but got [{"name":{"x":""}},[""],1,1]`).to.equal(e.message)
              }
        });
      });
    });
  });
describe('model', () => {
    describe('non-generic', () => {
      it('should return a type error with a good message', () => {

        const t = model({
          name: types.String
        });
        try {
          t({});
        } catch (e) {
          expect(e.message).to.equal(`Needed [{"name":"String"}] but got {}`);
        }
      });
    });
  });
});
