'use strict';

const assert = require('assertthat');

const only = require('../../lib/only');

suite('only', () => {
  test('is an object.', done => {
    assert.that(only).is.ofType('object');
    done();
  });

  suite('ifExists', () => {
    test('is a function.', done => {
      assert.that(only.ifExists).is.ofType('function');
      done();
    });

    suite('instance', () => {
      let ifExists;

      setup(() => {
        ifExists = only.ifExists();
      });

      test('is a function.', done => {
        assert.that(ifExists).is.ofType('function');
        done();
      });

      test('marks as ready for next if the aggregate instance exists.', done => {
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

      test('marks as rejected if the aggregate instance does not exist.', done => {
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

  suite('ifNotExists', () => {
    test('is a function.', done => {
      assert.that(only.ifNotExists).is.ofType('function');
      done();
    });

    suite('instance', () => {
      let ifNotExists;

      setup(() => {
        ifNotExists = only.ifNotExists();
      });

      test('is a function.', done => {
        assert.that(ifNotExists).is.ofType('function');
        done();
      });

      test('marks as ready for next if the aggregate instance does not exist.', done => {
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

      test('marks as rejected if the aggregate instance exists.', done => {
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

  suite('ifInPhase', () => {
    test('is a function.', done => {
      assert.that(only.ifInPhase).is.ofType('function');
      done();
    });

    suite('instance', () => {
      test('is a function.', done => {
        const ifInPhase = only.ifInPhase('draft');

        assert.that(ifInPhase).is.ofType('function');
        done();
      });

      test('marks as ready for next if the aggregate instance state contains the given phase.', done => {
        const ifInPhase = only.ifInPhase('draft');

        const aggregate = {
          state: {
            phase: 'draft'
          }
        };

        const command = {};

        ifInPhase(aggregate, command, {
          asReadyForNext () {
            done();
          }
        });
      });

      test('marks as ready for next if the aggregate instance state contains one of the given phases.', done => {
        const ifInPhase = only.ifInPhase([ 'initial', 'draft', 'final' ]);

        const aggregate = {
          state: {
            phase: 'draft'
          }
        };

        const command = {};

        ifInPhase(aggregate, command, {
          asReadyForNext () {
            done();
          }
        });
      });

      test('marks as ready for next if the aggregate instance state contains the given phase, albeit using a different name.', done => {
        const ifInPhase = only.ifInPhase('draft', 'workflowStep');

        const aggregate = {
          state: {
            workflowStep: 'draft'
          }
        };

        const command = {};

        ifInPhase(aggregate, command, {
          asReadyForNext () {
            done();
          }
        });
      });

      test('marks as rejected if the aggregate instance state does not contain the given phase.', done => {
        const ifInPhase = only.ifInPhase([ 'initial', 'final' ]);

        const aggregate = {
          state: {
            phase: 'draft'
          }
        };

        const command = {};

        ifInPhase(aggregate, command, {
          asRejected (reason) {
            assert.that(reason).is.equalTo('Invalid phase.');
            done();
          }
        });
      });
    });
  });

  suite('ifValidatedBy', () => {
    test('is a function.', done => {
      assert.that(only.ifValidatedBy).is.ofType('function');
      done();
    });

    suite('instance', () => {
      test('marks as ready for next if the command data is valid.', done => {
        const ifValidatedBy = only.ifValidatedBy({
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
            pets: { type: 'array', items: { type: 'string' }}
          },
          required: [ 'name', 'age', 'pets' ]
        });

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
    });
  });

  suite('ifCommandValidatedBy', () => {
    test('is a function.', done => {
      assert.that(only.ifCommandValidatedBy).is.ofType('function');
      done();
    });

    test('throws an error if schema is missing.', done => {
      assert.that(() => {
        only.ifCommandValidatedBy();
      }).is.throwing('Schema is missing.');
      done();
    });

    suite('instance', () => {
      let ifCommandValidatedBy;

      setup(() => {
        ifCommandValidatedBy = only.ifCommandValidatedBy({
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
            pets: { type: 'array', items: { type: 'string' }}
          },
          required: [ 'name', 'age', 'pets' ]
        });
      });

      test('is a function.', done => {
        assert.that(ifCommandValidatedBy).is.ofType('function');
        done();
      });

      test('marks as ready for next if the command data is valid.', done => {
        const aggregate = {};

        const command = {
          data: {
            name: 'Jane Doe',
            age: 35,
            pets: [ 'Alice' ]
          }
        };

        ifCommandValidatedBy(aggregate, command, {
          asReadyForNext () {
            done();
          }
        });
      });

      test('marks as rejected if the command data is not valid.', done => {
        const aggregate = {};

        const command = {
          data: {
            name: 'Jane Doe',
            age: '35',
            pets: [ 'Alice' ]
          }
        };

        ifCommandValidatedBy(aggregate, command, {
          asRejected (reason) {
            assert.that(reason).is.equalTo('Age is invalid.');
            done();
          }
        });
      });

      test('marks as rejected if nested command data is not valid.', done => {
        const aggregate = {};

        const command = {
          data: {
            name: 'Jane Doe',
            age: 35,
            pets: [ 'Alice', 42 ]
          }
        };

        ifCommandValidatedBy(aggregate, command, {
          asRejected (reason) {
            assert.that(reason).is.equalTo('Pets/1 is invalid.');
            done();
          }
        });
      });

      test('marks as rejected if the command data is empty.', done => {
        const aggregate = {};

        const command = {
          data: {}
        };

        ifCommandValidatedBy(aggregate, command, {
          asRejected (reason) {
            assert.that(reason).is.equalTo('Data is invalid.');
            done();
          }
        });
      });

      test('marks as rejected if the command data is missing.', done => {
        const aggregate = {};

        const command = {};

        ifCommandValidatedBy(aggregate, command, {
          asRejected (reason) {
            assert.that(reason).is.equalTo('Data is invalid.');
            done();
          }
        });
      });

      suite('with a validation function', () => {
        setup(() => {
          ifCommandValidatedBy = only.ifCommandValidatedBy(commandData =>
            typeof commandData.name === 'string');
        });

        test('marks as ready for next if the validation functions returns true.', done => {
          const aggregate = {};

          const command = {
            data: {
              name: 'Jane Doe'
            }
          };

          ifCommandValidatedBy(aggregate, command, {
            asReadyForNext () {
              done();
            }
          });
        });

        test('marks as rejected if the validation functions returns false.', done => {
          const aggregate = {};

          const command = {
            data: {
              name: 23
            }
          };

          ifCommandValidatedBy(aggregate, command, {
            asRejected (reason) {
              assert.that(reason).is.equalTo('Data is invalid.');
              done();
            }
          });
        });
      });
    });
  });

  suite('ifStateValidatedBy', () => {
    test('is a function.', done => {
      assert.that(only.ifStateValidatedBy).is.ofType('function');
      done();
    });

    test('throws an error if schema is missing.', done => {
      assert.that(() => {
        only.ifStateValidatedBy();
      }).is.throwing('Schema is missing.');
      done();
    });

    suite('instance', () => {
      let ifStateValidatedBy;

      setup(() => {
        ifStateValidatedBy = only.ifStateValidatedBy({
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
            pets: { type: 'array', items: { type: 'string' }}
          },
          required: [ 'name', 'age', 'pets' ]
        });
      });

      test('is a function.', done => {
        assert.that(ifStateValidatedBy).is.ofType('function');
        done();
      });

      test('marks as ready for next if the aggregate state is valid.', done => {
        const aggregate = {
          state: {
            name: 'Jane Doe',
            age: 35,
            pets: [ 'Alice' ]
          }
        };

        const command = {};

        ifStateValidatedBy(aggregate, command, {
          asReadyForNext () {
            done();
          }
        });
      });

      test('marks as rejected if the aggregate state is not valid.', done => {
        const aggregate = {
          state: {
            name: 'Jane Doe',
            age: '35',
            pets: [ 'Alice' ]
          }
        };

        const command = {};

        ifStateValidatedBy(aggregate, command, {
          asRejected (reason) {
            assert.that(reason).is.equalTo('Age is invalid.');
            done();
          }
        });
      });

      test('marks as rejected if nested aggregate state is not valid.', done => {
        const aggregate = {
          state: {
            name: 'Jane Doe',
            age: 35,
            pets: [ 'Alice', 42 ]
          }
        };

        const command = {};

        ifStateValidatedBy(aggregate, command, {
          asRejected (reason) {
            assert.that(reason).is.equalTo('Pets/1 is invalid.');
            done();
          }
        });
      });

      test('marks as rejected if the aggregate state is empty.', done => {
        const aggregate = {
          state: {}
        };

        const command = {};

        ifStateValidatedBy(aggregate, command, {
          asRejected (reason) {
            assert.that(reason).is.equalTo('Data is invalid.');
            done();
          }
        });
      });

      test('marks as rejected if the aggregate state is missing.', done => {
        const aggregate = {};

        const command = {};

        ifStateValidatedBy(aggregate, command, {
          asRejected (reason) {
            assert.that(reason).is.equalTo('Data is invalid.');
            done();
          }
        });
      });

      suite('with a validation function', () => {
        setup(() => {
          ifStateValidatedBy = only.ifStateValidatedBy(aggregateState =>
            typeof aggregateState.name === 'string');
        });

        test('marks as ready for next if the validation functions returns true.', done => {
          const aggregate = {
            state: {
              name: 'Jane Doe'
            }
          };

          const command = {};

          ifStateValidatedBy(aggregate, command, {
            asReadyForNext () {
              done();
            }
          });
        });

        test('marks as rejected if the validation functions returns false.', done => {
          const aggregate = {
            state: {
              name: 23
            }
          };

          const command = {};

          ifStateValidatedBy(aggregate, command, {
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
