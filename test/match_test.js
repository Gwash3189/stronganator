/* eslint-env mocha */

import match from '../src/match';
import T from '../src/types';
import type from '../src/type';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('match', () => {
  let matchList,
      matcher,
      numberStub;

  const Even = type('Even', (n) => T.Number(n) && n % 2 === 0);

  beforeEach(() => {
    numberStub = stub().returns(4);

    matcher = match(
      [T.Number, numberStub],
      [Even, numberStub]
    );
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

  context('T.Default match type', () => {
    it('is available', () => {
      expect(T.Default)
        .to.be.ok;
    });

    it('is used when no other type is valid', () => {
      const Action = T.String.extend('Action', (string) => string.indexOf('people/') > -1);
      const ADD_ALERT_TYPE = Action.extend('ADD_ALERT', (action) => action === 'derps/alerts/ADD_ALERT');
      const CLEAR_ALERT_TYPE = Action.extend('CLEAR_ALERT', (action) => action === 'derps/alerts/CLEAR_ALERT');

      const matchFunc = match(
        [ADD_ALERT_TYPE, (x) => x[0] ],
        [CLEAR_ALERT_TYPE, (x) => x[1]],
        [T.Default, (x) => x]
      );

      expect(matchFunc('derps'))
        .to.equal('derps');
    });
  });
});
