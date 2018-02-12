'use strict';

const ajv = require('ajv'),
      humanizeString = require('humanize-string');

const ajvInstance = ajv({
  jsonPointers: true
});

const only = {};

only.ifExists = function () {
  return async function (aggregateInstance, command) {
    if (!aggregateInstance.exists()) {
      const aggregateName = humanizeString(command.aggregate.name);

      throw new Error(`${aggregateName} does not exist.`);
    }
  };
};

only.ifNotExists = function () {
  return async function (aggregateInstance, command) {
    if (aggregateInstance.exists()) {
      const aggregateName = humanizeString(command.aggregate.name);

      throw new Error(`${aggregateName} already exists.`);
    }
  };
};

only.ifInPhase = function (phase, propertyName = 'phase') {
  let phases = phase;

  if (!Array.isArray(phases)) {
    phases = [ phase ];
  }

  return async function (aggregateInstance) {
    if (!aggregateInstance.state[propertyName]) {
      throw new Error(`State does not contain property ${propertyName}.`);
    }

    const currentPhase = aggregateInstance.state[propertyName];

    if (!phases.includes(currentPhase)) {
      throw new Error(`Invalid ${propertyName}.`);
    }
  };
};

only.ifCommandValidatedBy = function (schema) {
  if (!schema) {
    throw new Error('Schema is missing.');
  }

  if (typeof schema === 'function') {
    return async function (aggregateInstance, command) {
      if (!schema(command.data)) {
        throw new Error('Data is invalid.');
      }
    };
  }

  return async function (aggregateInstance, command) {
    const isValid = ajvInstance.validate(schema, command.data);

    if (!isValid) {
      const propertyName = ajvInstance.errors[0].dataPath.substring(1);

      if (!propertyName) {
        throw new Error('Data is invalid.');
      }

      throw new Error(`${humanizeString(propertyName)} is invalid.`);
    }
  };
};

only.ifStateValidatedBy = function (schema) {
  if (!schema) {
    throw new Error('Schema is missing.');
  }

  if (typeof schema === 'function') {
    return async function (aggregateInstance) {
      if (!schema(aggregateInstance.state)) {
        throw new Error('Data is invalid.');
      }
    };
  }

  return async function (aggregateInstance) {
    const isValid = ajvInstance.validate(schema, aggregateInstance.state);

    if (!isValid) {
      const propertyName = ajvInstance.errors[0].dataPath.substring(1);

      if (!propertyName) {
        throw new Error('Data is invalid.');
      }

      throw new Error(`${humanizeString(propertyName)} is invalid.`);
    }
  };
};

module.exports = only;
