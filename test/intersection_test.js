/* eslint-env mocha */

import intersection from '../src/intersection';
import { expect } from 'chai';
import { stub } from 'sinon';

describe.only('intersection', () => {
  let Positive,
      firstCheckerStub,
      secondCheckerStub,
      falseCheckerStub;

  beforeEach(() => {
    firstCheckerStub = stub().returns(true);
    secondCheckerStub = stub().returns(true);
    falseCheckerStub = stub().returns(false);
    Positive = intersection('Test', firstCheckerStub, secondCheckerStub);
  });

  it('combines all provided types to return a result', () => {
    Positive(1);

    expect(firstCheckerStub.called)
      .to.be.true;

    expect(secondCheckerStub.called)
      .to.be.true;
  });

  it('passes the provided value to all types', () => {
    Positive(1);

    expect(firstCheckerStub.firstCall.args[0])
      .to.equal(1);

    expect(secondCheckerStub.firstCall.args[0])
      .to.equal(1);
  });

  context('when a checker returns false', () => {
    beforeEach(() => {
      Positive = intersection('Test', firstCheckerStub, falseCheckerStub, secondCheckerStub);
    });
    it('returns false', () => {
      const result = Positive();

      expect(result)
        .to.be.false;
    });
  })
});
