/* eslint-env mocha */

import func from '../src/func';
import T from '../src/types';
import { expect } from 'chai';

describe('func', () => {
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
