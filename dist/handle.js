'use strict';

var ajv = require('ajv');

var ajvInstance = ajv({
  jsonPointers: true
});

var handle = {};

handle.physicalEvents = function (schemas) {
  if (!schemas) {
    throw new Error('Schemas are missing.');
  }

  return function (aggregateInstance, command, mark) {
    var event = command.data,
        schema = schemas[event.name];

    var isValid = ajvInstance.validate({
      type: 'object',
      properties: {
        name: { type: 'string', enum: Object.keys(schemas) },
        data: schema || {}
      },
      required: ['name', 'data'],
      additionalProperties: false
    }, command.data);

    if (!isValid) {
      return mark.asRejected('Invalid request.');
    }

    aggregateInstance.events.publish(event.name, event.data);

    mark.asDone();
  };
};

module.exports = handle;