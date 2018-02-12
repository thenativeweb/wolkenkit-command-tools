'use strict';

const ajv = require('ajv');

const ajvInstance = ajv({
  jsonPointers: true
});

const handle = {};

handle.physicalEvents = function (schemas) {
  if (!schemas) {
    throw new Error('Schemas are missing.');
  }

  return async function (aggregateInstance, command) {
    const event = command.data,
          schema = schemas[event.name];

    const isValid = ajvInstance.validate({
      type: 'object',
      properties: {
        name: { type: 'string', enum: Object.keys(schemas) },
        data: schema || {}
      },
      required: [ 'name', 'data' ],
      additionalProperties: false
    }, command.data);

    if (!isValid) {
      return command.reject('Invalid request.');
    }

    aggregateInstance.events.publish(event.name, event.data);
  };
};

module.exports = handle;
