/* eslint-env mocha */

import match from '../src/match';
import T from '../src/types';
import type from '../src/type';
import { expect } from 'chai';
import { stub } from 'sinon';

describe.only('match', () => {
  let matchList,
      matcher,
      numberStub;

  const Even = type('Even', (n) => T.Number(n) && n % 2 === 0);

  beforeEach(() => {
    numberStub = stub().returns(4);

    matchList = [
      [T.Number, numberStub],
      [Even, numberStub]
    ];

    matcher = match(matchList);
  });

  it('returns a function', () => {
    expect(matcher)
      .to.be.a('function');
  });

  it('calls the matched function when provided the corresponding type', () => {
    matcher(1);

    expect(numberStub.called)
      .to.be.true;
  });

  it('returns the result of the matched function', () => {
    const result = matcher(1);

    expect(result)
      .to.equal(4);
  });

  context('when more than one type is matched', () => {
    it('throws a TypeError', () => {
      expect(() => matcher(2))
        .to.throw(TypeError);
    });

    it('throws a TypeError with a detailed message', () => {
      expect(() => matcher(2))
        .to.throw(TypeError, `2 matched more than one type. Only one type must be matched.\nType: Number, Result: 4\nType: Even, Result: 4`);
    });
  });
});
