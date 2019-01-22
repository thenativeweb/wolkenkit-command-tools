'use strict';

const assert = require('assertthat'),
      Command = require('commands-events').Command;

const handle = require('../../src/handle');

/* eslint-disable prefer-arrow-callback */
suite('handle', () => {
  test('is an object.', async () => {
    assert.that(handle).is.ofType('object');
  });

  suite('physicalEvents', () => {
    test('is a function.', async () => {
      assert.that(handle.physicalEvents).is.ofType('function');
    });

    test('throws an error if schemas are missing.', async () => {
      assert.that(() => {
        handle.physicalEvents();
      }).is.throwing('Schemas are missing.');
    });

    suite('instance', () => {
      let physicalEvents;

      setup(() => {
        physicalEvents = handle.physicalEvents({
          opened: {
            type: 'object',
            properties: { when: { type: 'object' }},
            required: [ 'when' ],
            additionalProperties: false
          },
          closed: {
            type: 'object',
            properties: { when: { type: 'object' }},
            required: [ 'when' ],
            additionalProperties: false
          }
        });
      });

      test('is a function.', async () => {
        assert.that(physicalEvents).is.ofType('function');
      });

      test('throws an error if the command does not contain an event name.', async () => {
        const aggregate = {};

        const command = new Command({
          context: { name: 'monitoring' },
          aggregate: { name: 'door', id: 'ddf62286-8639-49cf-9d07-d1c74a0e1824' },
          name: 'record',
          data: {
            data: {}
          }
        });

        command.reject = function (reason) {
          throw new Error(reason);
        };

        await assert.that(async () => {
          await physicalEvents(aggregate, command);
        }).is.throwingAsync('Invalid request.');
      });

      test('throws an error if the command does not contain event data.', async () => {
        const aggregate = {};

        const command = new Command({
          context: { name: 'monitoring' },
          aggregate: { name: 'door', id: 'ddf62286-8639-49cf-9d07-d1c74a0e1824' },
          name: 'record',
          data: {
            name: 'opened'
          }
        });

        command.reject = function (reason) {
          throw new Error(reason);
        };

        await assert.that(async () => {
          await physicalEvents(aggregate, command);
        }).is.throwingAsync('Invalid request.');
      });

      test('throws an error if an invalid event name is given.', async () => {
        const aggregate = {};

        const command = new Command({
          context: { name: 'monitoring' },
          aggregate: { name: 'door', id: 'ddf62286-8639-49cf-9d07-d1c74a0e1824' },
          name: 'record',
          data: {
            name: 'nonExistentEvent',
            data: {}
          }
        });

        command.reject = function (reason) {
          throw new Error(reason);
        };

        await assert.that(async () => {
          await physicalEvents(aggregate, command);
        }).is.throwingAsync('Invalid request.');
      });

      test('throws an error if the event data does not match the schema.', async () => {
        const aggregate = {};

        const command = new Command({
          context: { name: 'monitoring' },
          aggregate: { name: 'door', id: 'ddf62286-8639-49cf-9d07-d1c74a0e1824' },
          name: 'record',
          data: {
            name: 'opened',
            data: {}
          }
        });

        command.reject = function (reason) {
          throw new Error(reason);
        };

        await assert.that(async () => {
          await physicalEvents(aggregate, command);
        }).is.throwingAsync('Invalid request.');
      });

      test('publishes the event if everything is fine.', async () => {
        const now = new Date();

        let wasPublished = false;

        const aggregate = {
          events: {
            publish (name, data) {
              wasPublished = true;
              assert.that(name).is.equalTo('opened');
              assert.that(data).is.equalTo({
                when: now
              });
            }
          }
        };

        const command = new Command({
          context: { name: 'monitoring' },
          aggregate: { name: 'door', id: 'ddf62286-8639-49cf-9d07-d1c74a0e1824' },
          name: 'record',
          data: {
            name: 'opened',
            data: {
              when: now
            }
          }
        });

        await physicalEvents(aggregate, command);

        assert.that(wasPublished).is.true();
      });
    });
  });
});
/* eslint-enable prefer-arrow-callback */
