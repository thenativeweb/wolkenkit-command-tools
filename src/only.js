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

      return command.reject(`${aggregateName} does not exist.`);
    }
  };
};

only.ifNotExists = function () {
  return async function (aggregateInstance, command) {
    if (aggregateInstance.exists()) {
      const aggregateName = humanizeString(command.aggregate.name);

      return command.reject(`${aggregateName} already exists.`);
    }
  };
};

only.ifAggregateExists = function ({
  contextName,
  aggregateName,
  aggregateId,
  isOptional = false
}) {
  if (!contextName) {
    throw new Error('Context name is missing.');
  }
  if (!aggregateName) {
    throw new Error('Aggregate name is missing.');
  }
  if (!aggregateId) {
    throw new Error('Aggregate id is missing.');
  }

  return async function (aggregateInstance, command, { app }) {
    if (!app[contextName]) {
      return command.reject(`Invalid context '${contextName}'.`);
    }
    if (!app[contextName][aggregateName]) {
      return command.reject(`Invalid aggregate '${aggregateName}' in context '${contextName}'.`);
    }

    let aggregateInstanceId;

    try {
      aggregateInstanceId = aggregateId(command);
    } catch (err) {
      return command.reject('Failed to get aggregate id.');
    }

    if (!aggregateInstanceId) {
      if (isOptional) {
        return;
      }

      return command.reject('Failed to get aggregate id.');
    }

    try {
      await app[contextName][aggregateName](aggregateInstanceId).read();
    } catch (err) {
      command.reject(err.message);
    }
  };
};

only.ifInPhase = function (phase, propertyName = 'phase') {
  let phases = phase;

  if (!Array.isArray(phases)) {
    phases = [ phase ];
  }

  return async function (aggregateInstance, command) {
    if (!aggregateInstance.state[propertyName]) {
      throw new Error(`State does not contain property ${propertyName}.`);
    }

    const currentPhase = aggregateInstance.state[propertyName];

    if (!phases.includes(currentPhase)) {
      return command.reject(`Invalid ${propertyName}.`);
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
        return command.reject('Data is invalid.');
      }
    };
  }

  return async function (aggregateInstance, command) {
    const isValid = ajvInstance.validate(schema, command.data);

    if (!isValid) {
      const propertyName = ajvInstance.errors[0].dataPath.substring(1);

      if (!propertyName) {
        return command.reject('Data is invalid.');
      }

      return command.reject(`${humanizeString(propertyName)} is invalid.`);
    }
  };
};

only.ifStateValidatedBy = function (schema) {
  if (!schema) {
    throw new Error('Schema is missing.');
  }

  if (typeof schema === 'function') {
    return async function (aggregateInstance, command) {
      if (!schema(aggregateInstance.state)) {
        return command.reject('Data is invalid.');
      }
    };
  }

  return async function (aggregateInstance, command) {
    const isValid = ajvInstance.validate(schema, aggregateInstance.state);

    if (!isValid) {
      const propertyName = ajvInstance.errors[0].dataPath.substring(1);

      if (!propertyName) {
        return command.reject('Data is invalid.');
      }

      return command.reject(`${humanizeString(propertyName)} is invalid.`);
    }
  };
};

module.exports = only;
