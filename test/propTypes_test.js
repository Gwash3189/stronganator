/* eslint-env mocha */

import PropTypes from '../src/propTypes';
import { expect } from 'chai';

describe('PropTypes', () => {
  it('is an object', () => {
    expect(PropTypes)
    .to.be.a('object');
  });

  describe('non generic types', () => {
    context('when given a correct type', () => {
      it('returns true', () => {
        expect(PropTypes.String({test: ''}, 'test', 'componentName'))
          .to.be.true;
      });
    });

    context('when given an incorrect type', () => {
      it('returns an Error', () => {
        expect(PropTypes.String({test: 1}, 'test', 'componentName'))
          .to.be.a('Error');
      });

      it('returns an Error with a detailed message', () => {
        const error = PropTypes.String({test: 1}, 'test', 'componentName');

        expect(error.message)
          .to.equal('test is not a String. Check render method of componentName');
      });
    });
  });

  describe('generic types', () => {
    context('when given a correct type', () => {
      it('returns true', () => {
        const result = PropTypes.Array(PropTypes.String)({test: ['']}, 'test', 'componentName');

        expect(result)
          .to.be.true;
      });
    });

    context('when given an incorrect type', () => {
      it('returns an Error', () => {
        const StringArray = PropTypes.Array(PropTypes.String);
        const result = StringArray({test: [1]}, 'test', 'componentName');

        expect(result)
          .to.be.a('Error');
      });

      it('returns an Error with a detailed message', () => {
        const ObjectType = PropTypes.Object({ a: PropTypes.String });
        const error = ObjectType({test: {a: 1}}, 'test', 'componentName');

        expect(error.message)
          .to.equal(`test is not [\n    {\n        "a": "String"\n    }\n]. It is {\n    "a": 1\n}. Check render method of componentName`);
      });
    });
  });
});
