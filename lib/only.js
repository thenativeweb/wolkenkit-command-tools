'use strict';

const ajv = require('ajv'),
      humanizeString = require('humanize-string');

const ajvInstance = ajv({
  jsonPointers: true
});

const only = {};

only.ifExists = function () {
  return function (aggregateInstance, command, mark) {
    if (!aggregateInstance.exists()) {
      const aggregateName = humanizeString(command.aggregate.name);

      return mark.asRejected(`${aggregateName} does not exist.`);
    }
    mark.asReadyForNext();
  };
};

only.ifNotExists = function () {
  return function (aggregateInstance, command, mark) {
    if (aggregateInstance.exists()) {
      const aggregateName = humanizeString(command.aggregate.name);

      return mark.asRejected(`${aggregateName} already exists.`);
    }
    mark.asReadyForNext();
  };
};

only.ifValidatedBy = function (schema) {
  if (!schema) {
    throw new Error('Schema is missing.');
  }

  if (typeof schema === 'function') {
    return function (aggregateInstance, command, mark) {
      if (!schema(command.data)) {
        return mark.asRejected('Data is invalid.');
      }

      mark.asReadyForNext();
    };
  }

  return function (aggregateInstance, command, mark) {
    const isValid = ajvInstance.validate(schema, command.data);

    if (!isValid) {
      const propertyName = ajvInstance.errors[0].dataPath.substring(1);

      if (!propertyName) {
        return mark.asRejected('Data is invalid.');
      }

      return mark.asRejected(`${humanizeString(propertyName)} is invalid.`);
    }
    mark.asReadyForNext();
  };
};

module.exports = only;
