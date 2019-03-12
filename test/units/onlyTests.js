'use strict';

const assert = require('assertthat');

const only = require('../../src/only');

suite('only', () => {
  test('is an object.', async () => {
    assert.that(only).is.ofType('object');
  });

  suite('ifExists', () => {
    test('is a function.', async () => {
      assert.that(only.ifExists).is.ofType('function');
    });

    suite('instance', () => {
      let ifExists;

      setup(() => {
        ifExists = only.ifExists();
      });

      test('is a function.', async () => {
        assert.that(ifExists).is.ofType('function');
      });

      test('passes if the aggregate instance exists.', async () => {
        const aggregate = {
          exists () {
            return true;
          }
        };

        const command = {};

        await ifExists(aggregate, command);
      });

      test('throws an error if the aggregate instance does not exist.', async () => {
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

        command.reject = function (reason) {
          throw new Error(reason);
        };

        await assert.that(async () => {
          await ifExists(aggregate, command);
        }).is.throwingAsync('Peer group does not exist.');
      });
    });
  });

  suite('ifNotExists', () => {
    test('is a function.', async () => {
      assert.that(only.ifNotExists).is.ofType('function');
    });

    suite('instance', () => {
      let ifNotExists;

      setup(() => {
        ifNotExists = only.ifNotExists();
      });

      test('is a function.', async () => {
        assert.that(ifNotExists).is.ofType('function');
      });

      test('passes if the aggregate instance does not exist.', async () => {
        const aggregate = {
          exists () {
            return false;
          }
        };

        const command = {};

        await ifNotExists(aggregate, command);
      });

      test('throws an error if the aggregate instance exists.', async () => {
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

        command.reject = function (reason) {
          throw new Error(reason);
        };

        await assert.that(async () => {
          await ifNotExists(aggregate, command);
        }).is.throwingAsync('Peer group already exists.');
      });
    });
  });

  suite('ifInPhase', () => {
    test('is a function.', async () => {
      assert.that(only.ifInPhase).is.ofType('function');
    });

    suite('instance', () => {
      test('is a function.', async () => {
        const ifInPhase = only.ifInPhase('draft');

        assert.that(ifInPhase).is.ofType('function');
      });

      test('passes if the aggregate instance state contains the given phase.', async () => {
        const ifInPhase = only.ifInPhase('draft');

        const aggregate = {
          state: {
            phase: 'draft'
          }
        };

        const command = {};

        await ifInPhase(aggregate, command);
      });

      test('passes if the aggregate instance state contains one of the given phases.', async () => {
        const ifInPhase = only.ifInPhase([ 'initial', 'draft', 'final' ]);

        const aggregate = {
          state: {
            phase: 'draft'
          }
        };

        const command = {};

        await ifInPhase(aggregate, command);
      });

      test('passes if the aggregate instance state contains the given phase, albeit using a different name.', async () => {
        const ifInPhase = only.ifInPhase('draft', 'workflowStep');

        const aggregate = {
          state: {
            workflowStep: 'draft'
          }
        };

        const command = {};

        await ifInPhase(aggregate, command);
      });

      test('throws an error if the aggregate instance state does not contain the given phase.', async () => {
        const ifInPhase = only.ifInPhase([ 'initial', 'final' ]);

        const aggregate = {
          state: {
            phase: 'draft'
          }
        };

        const command = {};

        command.reject = function (reason) {
          throw new Error(reason);
        };

        await assert.that(async () => {
          await ifInPhase(aggregate, command);
        }).is.throwingAsync('Invalid phase.');
      });
    });
  });

  suite('ifCommandValidatedBy', () => {
    test('is a function.', async () => {
      assert.that(only.ifCommandValidatedBy).is.ofType('function');
    });

    test('throws an error if schema is missing.', async () => {
      assert.that(() => {
        only.ifCommandValidatedBy();
      }).is.throwing('Schema is missing.');
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

      test('is a function.', async () => {
        assert.that(ifCommandValidatedBy).is.ofType('function');
      });

      test('passes if the command data is valid.', async () => {
        const aggregate = {};

        const command = {
          data: {
            name: 'Jane Doe',
            age: 35,
            pets: [ 'Alice' ]
          }
        };

        await ifCommandValidatedBy(aggregate, command);
      });

      test('throws an error if the command data is not valid.', async () => {
        const aggregate = {};

        const command = {
          data: {
            name: 'Jane Doe',
            age: '35',
            pets: [ 'Alice' ]
          }
        };

        command.reject = function (reason) {
          throw new Error(reason);
        };

        await assert.that(async () => {
          await ifCommandValidatedBy(aggregate, command);
        }).is.throwingAsync('Age is invalid.');
      });

      test('throws an error if nested command data is not valid.', async () => {
        const aggregate = {};

        const command = {
          data: {
            name: 'Jane Doe',
            age: 35,
            pets: [ 'Alice', 42 ]
          }
        };

        command.reject = function (reason) {
          throw new Error(reason);
        };

        await assert.that(async () => {
          await ifCommandValidatedBy(aggregate, command);
        }).is.throwingAsync('Pets/1 is invalid.');
      });

      test('throws an error if the command data is empty.', async () => {
        const aggregate = {};

        const command = {
          data: {}
        };

        command.reject = function (reason) {
          throw new Error(reason);
        };

        await assert.that(async () => {
          await ifCommandValidatedBy(aggregate, command);
        }).is.throwingAsync('Data is invalid.');
      });

      test('throws an error if the command data is missing.', async () => {
        const aggregate = {};

        const command = {};

        command.reject = function (reason) {
          throw new Error(reason);
        };

        await assert.that(async () => {
          await ifCommandValidatedBy(aggregate, command);
        }).is.throwingAsync('Data is invalid.');
      });

      suite('with a validation function', () => {
        setup(() => {
          ifCommandValidatedBy = only.ifCommandValidatedBy(commandData =>
            typeof commandData.name === 'string');
        });

        test('passes if the validation functions returns true.', async () => {
          const aggregate = {};

          const command = {
            data: {
              name: 'Jane Doe'
            }
          };

          await ifCommandValidatedBy(aggregate, command);
        });

        test('throws an error if the validation functions returns false.', async () => {
          const aggregate = {};

          const command = {
            data: {
              name: 23
            }
          };

          command.reject = function (reason) {
            throw new Error(reason);
          };

          await assert.that(async () => {
            await ifCommandValidatedBy(aggregate, command);
          }).is.throwingAsync('Data is invalid.');
        });
      });
    });
  });

  suite('ifStateValidatedBy', () => {
    test('is a function.', async () => {
      assert.that(only.ifStateValidatedBy).is.ofType('function');
    });

    test('throws an error if schema is missing.', async () => {
      assert.that(() => {
        only.ifStateValidatedBy();
      }).is.throwing('Schema is missing.');
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

      test('is a function.', async () => {
        assert.that(ifStateValidatedBy).is.ofType('function');
      });

      test('passes if the aggregate state is valid.', async () => {
        const aggregate = {
          state: {
            name: 'Jane Doe',
            age: 35,
            pets: [ 'Alice' ]
          }
        };

        const command = {};

        await ifStateValidatedBy(aggregate, command);
      });

      test('throws an error if the aggregate state is not valid.', async () => {
        const aggregate = {
          state: {
            name: 'Jane Doe',
            age: '35',
            pets: [ 'Alice' ]
          }
        };

        const command = {};

        command.reject = function (reason) {
          throw new Error(reason);
        };

        await assert.that(async () => {
          await ifStateValidatedBy(aggregate, command);
        }).is.throwingAsync('Age is invalid.');
      });

      test('throws an error if nested aggregate state is not valid.', async () => {
        const aggregate = {
          state: {
            name: 'Jane Doe',
            age: 35,
            pets: [ 'Alice', 42 ]
          }
        };

        const command = {};

        command.reject = function (reason) {
          throw new Error(reason);
        };

        await assert.that(async () => {
          await ifStateValidatedBy(aggregate, command);
        }).is.throwingAsync('Pets/1 is invalid.');
      });

      test('throws an error if the aggregate state is empty.', async () => {
        const aggregate = {
          state: {}
        };

        const command = {};

        command.reject = function (reason) {
          throw new Error(reason);
        };

        await assert.that(async () => {
          await ifStateValidatedBy(aggregate, command);
        }).is.throwingAsync('Data is invalid.');
      });

      test('throws an error if the aggregate state is missing.', async () => {
        const aggregate = {};

        const command = {};

        command.reject = function (reason) {
          throw new Error(reason);
        };

        await assert.that(async () => {
          await ifStateValidatedBy(aggregate, command);
        }).is.throwingAsync('Data is invalid.');
      });

      suite('with a validation function', () => {
        setup(() => {
          ifStateValidatedBy = only.ifStateValidatedBy(aggregateState =>
            typeof aggregateState.name === 'string');
        });

        test('passes if the validation functions returns true.', async () => {
          const aggregate = {
            state: {
              name: 'Jane Doe'
            }
          };

          const command = {};

          await ifStateValidatedBy(aggregate, command);
        });

        test('throws an error if the validation functions returns false.', async () => {
          const aggregate = {
            state: {
              name: 23
            }
          };

          const command = {};

          command.reject = function (reason) {
            throw new Error(reason);
          };

          await assert.that(async () => {
            await ifStateValidatedBy(aggregate, command);
          }).is.throwingAsync('Data is invalid.');
        });
      });
    });
  });

  suite('ifAggregateExists', () => {
    const context = 'context';
    const aggregate = 'aggregate';
    const defaultCommand = {
      reject (reason) {
        throw new Error(reason);
      }
    };

    test('is a function.', async () => {
      assert.that(only.ifAggregateExists).is.ofType('function');
    });

    test('throws an error if context is missing.', async () => {
      assert.that(() => {
        only.ifAggregateExists({});
      }).is.throwing('Context is missing.');
    });

    test('throws an error if aggregate is missing.', async () => {
      assert.that(() => {
        only.ifAggregateExists({ context });
      }).is.throwing('Aggregate is missing.');
    });

    test('throws an error if provider is missing.', async () => {
      assert.that(() => {
        only.ifAggregateExists({ context, aggregate });
      }).is.throwing('Provider is missing.');
    });

    suite('instance', () => {
      let ifAggregateExists;

      setup(() => {
        ifAggregateExists = only.ifAggregateExists({
          context,
          aggregate,
          provider: command => command.data.id
        });
      });

      test('is a function.', async () => {
        assert.that(ifAggregateExists).is.ofType('function');
      });

      test('throws an error when context does not exist', async () => {
        const services = {
          app: {}
        };

        assert.that(async () => {
          await ifAggregateExists({}, defaultCommand, services);
        }).is.throwingAsync('context does not exist.');
      });

      test('throws an error when aggregate does not exist', async () => {
        const services = {
          app: {
            context: {}
          }
        };

        assert.that(async () => {
          await ifAggregateExists({}, defaultCommand, services);
        }).is.throwingAsync('context.aggregate does not exist.');
      });

      test('throws an error when id provider fails to extract id', async () => {
        const services = {
          app: {
            context: {
              aggregate () {
              }
            }
          }
        };

        assert.that(async () => {
          await ifAggregateExists({}, defaultCommand, services);
        }).is.throwingAsync('Unable to extract aggregate id: Cannot read property \'id\' of undefined');
      });

      test('throws an error when it should reject on missing id and no id is extracted', async () => {
        const services = {
          app: {
            context: {
              aggregate () {
              }
            }
          }
        };

        const ifAggregateExistsRejectWhenMissingId = only.ifAggregateExists({
          context,
          aggregate,
          provider: command => command.data.id,
          options: { rejectWhenMissingId: true }
        });

        const command = {
          ...defaultCommand,
          data: {}
        };

        assert.that(async () => {
          await ifAggregateExistsRejectWhenMissingId({}, command, services);
        }).is.throwingAsync('Unable to extract aggregate id');
      });

      test('throws an error when reading aggregate fails', async () => {
        const services = {
          app: {
            context: {
              aggregate: () => ({
                read () {
                  throw new Error('Aggregate not found.');
                }
              })
            }
          }
        };

        const command = {
          ...defaultCommand,
          data: { id: 'some-id' }
        };

        assert.that(async () => {
          await ifAggregateExists({}, command, services);
        }).is.throwingAsync('Aggregate not found.');
      });

      test('passes when read succeeds', async () => {
        const services = {
          app: {
            context: {
              aggregate: id => {
                if (!id) {
                  throw new Error('Aggregate id is missing.');
                }

                return {
                  read () {
                    return Promise.resolve();
                  }
                };
              }
            }
          }
        };

        const command = {
          ...defaultCommand,
          data: { id: 'some-id' }
        };

        await ifAggregateExists({}, command, services);
      });

      test('passes when relation is optional', async () => {
        const services = {
          app: {
            context: {
              aggregate: id => {
                if (!id) {
                  throw new Error('Aggregate id is missing.');
                }

                return {
                  read () {
                    return Promise.resolve();
                  }
                };
              }
            }
          }
        };

        const command = {
          ...defaultCommand,
          data: {}
        };

        await ifAggregateExists({}, command, services);
      });
    });
  });
});
