'use strict';

const assert = require('assertthat'),
      Command = require('commands-events').Command;

const handle = require('../../lib/handle');

/* eslint-disable prefer-arrow-callback */
suite('handle', function () {
  test('is an object.', function (done) {
    assert.that(handle).is.ofType('object');
    done();
  });

  suite('physicalEvents', function () {
    test('is a function.', function (done) {
      assert.that(handle.physicalEvents).is.ofType('function');
      done();
    });

    test('throws an error if schemas are missing.', function (done) {
      assert.that(() => {
        handle.physicalEvents();
      }).is.throwing('Schemas are missing.');
      done();
    });

    suite('instance', function () {
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

      test('is a function.', function (done) {
        assert.that(physicalEvents).is.ofType('function');
        done();
      });

      test('marks as rejected if the command does not contain an event name.', function (done) {
        const aggregate = {};

        const command = new Command({
          context: { name: 'monitoring' },
          aggregate: { name: 'door', id: 'ddf62286-8639-49cf-9d07-d1c74a0e1824' },
          name: 'record',
          data: {
            data: {}
          }
        });

        const mark = {
          asRejected (reason) {
            assert.that(reason).is.equalTo('Invalid request.');
            done();
          }
        };

        physicalEvents(aggregate, command, mark);
      });

      test('marks as rejected if the command does not contain event data.', function (done) {
        const aggregate = {};

        const command = new Command({
          context: { name: 'monitoring' },
          aggregate: { name: 'door', id: 'ddf62286-8639-49cf-9d07-d1c74a0e1824' },
          name: 'record',
          data: {
            name: 'opened'
          }
        });

        const mark = {
          asRejected (reason) {
            assert.that(reason).is.equalTo('Invalid request.');
            done();
          }
        };

        physicalEvents(aggregate, command, mark);
      });

      test('marks as rejected if an invalid event name is given.', function (done) {
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

        const mark = {
          asRejected (reason) {
            assert.that(reason).is.equalTo('Invalid request.');
            done();
          }
        };

        physicalEvents(aggregate, command, mark);
      });

      test('marks as rejected if the event data does not match the schema.', function (done) {
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

        const mark = {
          asRejected (reason) {
            assert.that(reason).is.equalTo('Invalid request.');
            done();
          }
        };

        physicalEvents(aggregate, command, mark);
      });

      test('publishes the event and marks as done if everything is fine.', function (done) {
        const now = new Date();

        const aggregate = {
          events: {
            publish (name, data) {
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

        const mark = {
          asDone () {
            done();
          }
        };

        physicalEvents(aggregate, command, mark);
      });
    });
  });
});
/* eslint-enable prefer-arrow-callback */
