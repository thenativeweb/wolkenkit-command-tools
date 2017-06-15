'use strict';

const assert = require('assertthat');

const only = require('../lib/only');

/* eslint-disable prefer-arrow-callback */
suite('only', function () {
  test('is an object.', function (done) {
    assert.that(only).is.ofType('object');
    done();
  });

  suite('ifExists', function () {
    test('is a function.', function (done) {
      assert.that(only.ifExists).is.ofType('function');
      done();
    });

    suite('instance', function () {
      let ifExists;

      setup(() => {
        ifExists = only.ifExists();
      });

      test('is a function.', function (done) {
        assert.that(ifExists).is.ofType('function');
        done();
      });

      test('marks as ready for next if the aggregate instance exists.', function (done) {
        const aggregate = {
          exists () {
            return true;
          }
        };

        const command = {};

        ifExists(aggregate, command, {
          asReadyForNext () {
            done();
          }
        });
      });

      test('marks as rejected if the aggregate instance does not exist.', function (done) {
        const aggregate = {
          exists () {
            return false;
          }
        };

        const command = {
          aggregate: {
            name: 'peerGroup'
          }
        };

        ifExists(aggregate, command, {
          asRejected (reason) {
            assert.that(reason).is.equalTo('Peer group does not exist.');
            done();
          }
        });
      });
    });
  });

  suite('ifNotExists', function () {
    test('is a function.', function (done) {
      assert.that(only.ifNotExists).is.ofType('function');
      done();
    });

    suite('instance', function () {
      let ifNotExists;

      setup(() => {
        ifNotExists = only.ifNotExists();
      });

      test('is a function.', function (done) {
        assert.that(ifNotExists).is.ofType('function');
        done();
      });

      test('marks as ready for next if the aggregate instance does not exist.', function (done) {
        const aggregate = {
          exists () {
            return false;
          }
        };

        const command = {};

        ifNotExists(aggregate, command, {
          asReadyForNext () {
            done();
          }
        });
      });

      test('marks as rejected if the aggregate instance exists.', function (done) {
        const aggregate = {
          exists () {
            return true;
          }
        };

        const command = {
          aggregate: {
            name: 'peerGroup'
          }
        };

        ifNotExists(aggregate, command, {
          asRejected (reason) {
            assert.that(reason).is.equalTo('Peer group already exists.');
            done();
          }
        });
      });
    });
  });

  suite('ifValidatedBy', function () {
    test('is a function.', function (done) {
      assert.that(only.ifValidatedBy).is.ofType('function');
      done();
    });

    test('throws an error if schema is missing.', function (done) {
      assert.that(() => {
        only.ifValidatedBy();
      }).is.throwing('Schema is missing.');
      done();
    });

    suite('instance', function () {
      let ifValidatedBy;

      setup(() => {
        ifValidatedBy = only.ifValidatedBy({
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
            pets: { type: 'array', items: { type: 'string' }}
          },
          required: [ 'name', 'age', 'pets' ]
        });
      });

      test('is a function.', function (done) {
        assert.that(ifValidatedBy).is.ofType('function');
        done();
      });

      test('marks as ready for next if the command data is valid.', function (done) {
        const aggregate = {};

        const command = {
          data: {
            name: 'Jane Doe',
            age: 35,
            pets: [ 'Alice' ]
          }
        };

        ifValidatedBy(aggregate, command, {
          asReadyForNext () {
            done();
          }
        });
      });

      test('marks as rejected if the command data is not valid.', function (done) {
        const aggregate = {};

        const command = {
          data: {
            name: 'Jane Doe',
            age: '35',
            pets: [ 'Alice' ]
          }
        };

        ifValidatedBy(aggregate, command, {
          asRejected (reason) {
            assert.that(reason).is.equalTo('Age is invalid.');
            done();
          }
        });
      });

      test('marks as rejected if nested command data is not valid.', function (done) {
        const aggregate = {};

        const command = {
          data: {
            name: 'Jane Doe',
            age: 35,
            pets: [ 'Alice', 42 ]
          }
        };

        ifValidatedBy(aggregate, command, {
          asRejected (reason) {
            assert.that(reason).is.equalTo('Pets/1 is invalid.');
            done();
          }
        });
      });

      test('marks as rejected if the command data is empty.', function (done) {
        const aggregate = {};

        const command = {
          data: {}
        };

        ifValidatedBy(aggregate, command, {
          asRejected (reason) {
            assert.that(reason).is.equalTo('Data is invalid.');
            done();
          }
        });
      });

      test('marks as rejected if the command data is missing.', function (done) {
        const aggregate = {};

        const command = {};

        ifValidatedBy(aggregate, command, {
          asRejected (reason) {
            assert.that(reason).is.equalTo('Data is invalid.');
            done();
          }
        });
      });

      suite('with a validation function', function () {
        setup(() => {
          ifValidatedBy = only.ifValidatedBy(commandData =>
            typeof commandData.name === 'string');
        });

        test('marks as ready for next if the validation functions returns true.', function (done) {
          const aggregate = {};

          const command = {
            data: {
              name: 'Jane Doe'
            }
          };

          ifValidatedBy(aggregate, command, {
            asReadyForNext () {
              done();
            }
          });
        });

        test('marks as rejected if the validation functions returns false.', function (done) {
          const aggregate = {};

          const command = {
            data: {
              name: 23
            }
          };

          ifValidatedBy(aggregate, command, {
            asRejected (reason) {
              assert.that(reason).is.equalTo('Data is invalid.');
              done();
            }
          });
        });
      });
    });
  });
});
/* eslint-enable prefer-arrow-callback */
