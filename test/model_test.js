/* eslint-env mocha */

import model from '../src/model';
import T from '../src/types';
import func from '../src/func';
import { expect } from 'chai';

describe('model', () => {
  let Student;

  beforeEach(() => {
    Student = model({
      name: T.String,
      id: T.Number,
      getName: T.Function
    });
  });

  it('returns a function', () => {
    expect(Student)
      .to.be.a('function');
  });

  it('can be used with the new keyword', () => {
    let stu = new Student({
      name: 'stu',
      id: 1,
      getName: func([], T.String)
               .of(() => this.name)
    });

    expect(stu)
      .to.be.ok;

    expect(stu.name)
      .to.equal('stu');

    expect(stu.id)
      .to.equal(1);
  });

  it('can be used without the new keyword', () => {
    let stu = Student({
      name: 'stu',
      id: 1,
      getName: func([], T.String)
               .of(() => this.name)
    });

    expect(stu)
      .to.be.ok;

    expect(stu.name)
      .to.equal('stu');

    expect(stu.id)
      .to.equal(1);
  });

  it('throws a type error if the provided object doesn\'t match', () => {
    let f = () => {
      Student({
        name: 1,
        id: 1,
        getName: func([], T.String)
                 .of(() => this.name)
      });
    };

    expect(f)
      .to.throw(TypeError,'Needed [{"name":"String","id":"Number","getName":"Function"}] but got {"name":1,"id":1}');
  });

  describe('autoBind', () => {
    const stu = {
      name: 'stu',
      id: 1,
      getName: func([], T.String)
               .of(function() {
                 return this.name;
               })
    };

    let typedStu;

    beforeEach(() => {
      typedStu = Student(stu);
    });

    it('binds \'this\' to stu', () => {
      expect(typedStu.getName())
        .to.equal(stu.name);
    });
  });

  describe('extend', () => {
    let StudentWithAge;

    beforeEach(() => {
      StudentWithAge = Student.extend({
        age: T.Number
      });
    });

    it('returns a function', () => {
      expect(StudentWithAge)
        .to.be.a('function');
    });

    it('extends the previously defined type', () => {
      const result = () => {
        StudentWithAge({
          name: 'stu',
          id: 1,
          age: 1
        });
      };

      expect(result)
        .not.to.throw;
    });

    it('throws if a previously defined property is not defined', () => {
      const result = () => {
        StudentWithAge({
          id: 1,
          age: 1
        });
      };

      expect(result)
        .to.throw(TypeError);
    });

    it('throws if a newly defined property is not defined', () => {
      const result = () => {
        StudentWithAge({
          name: 'stu',
          id: 1
        });
      };

      expect(result)
        .to.throw(TypeError);
    });
  });
});
