/* eslint-env mocha */

import func from '../src/func';
import T from '../src/types';
import model from '../src/model';
import { expect } from 'chai';

const noop = () => {};

describe('func', () => {
  context('when .returns is used', () => {
    it('type checks the return type', () => {
      expect(func(T.Any).of(noop).returns(T.Truthy))
        .to.throw();

      expect(func(T.Any).of(noop).returns(T.Any))
        .not.to.throw();
    });
  });

  it('Should provide a func endpoint', () => {
    expect(func)
      .to.be.a('function');
  });

  it('Should provide a function which takes a list of types, and a return type', () => {
    expect(func([T.Number], T.String))
      .to.have.property('of');
  });

  describe('Of', () => {
    let pointed;

    beforeEach(() => {
      pointed = func([T.Number], T.String);
    });

    it('Should take a function and return a new function', () => {
      expect(pointed.of(() => ''))
        .to.be.a('function');
    });

    it('Should push the \'this\' context as the last argument', () => {
      const UserType = model({
        name: T.String,
        setName: T.Function,
        getName: T.Function
      });

      const user = UserType({
        name: 'Adam',
        setName: func(T.String)
                 .of((name, user) => {
                   user.name = name;
                 }),
        getName: func([], T.String)
                 .of((user) => {
                   return user.name;
                 })
      });

      user.setName('test');

      expect(user.getName())
        .to.equal('test');
    });

    it('throws an error if the incorrect types are past to or returned from the function', () => {
      const f = pointed
                .of(() => true);

      expect(() => f(''))
        .to.throw(TypeError);

      expect(() => f(1))
        .to.throw(TypeError);
    });

    it('Should not throw an error if the correct types are past to and returned from the function', () => {
      const f = pointed
                .of(() => '');

      expect(() => f(1))
        .to.not.throw(TypeError);
    });
  });

  context('when given a single type', () => {
    it('does not require it wrapped in an array', () => {
      const timesByTwo = func(T.Number)
                         .of(x => x* 2);

      expect(timesByTwo(2))
        .to.equal(4);
    });
  });
});
