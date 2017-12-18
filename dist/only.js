'use strict';

var util = require('util');

var ajv = require('ajv'),
    humanizeString = require('humanize-string');

var ajvInstance = ajv({
  jsonPointers: true
});

var only = {};

only.ifExists = function () {
  return function (aggregateInstance, command, mark) {
    if (!aggregateInstance.exists()) {
      var aggregateName = humanizeString(command.aggregate.name);

      return mark.asRejected(aggregateName + ' does not exist.');
    }
    mark.asReadyForNext();
  };
};

only.ifNotExists = function () {
  return function (aggregateInstance, command, mark) {
    if (aggregateInstance.exists()) {
      var aggregateName = humanizeString(command.aggregate.name);

      return mark.asRejected(aggregateName + ' already exists.');
    }
    mark.asReadyForNext();
  };
};

only.ifInPhase = function (phase) {
  var propertyName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'phase';

  var phases = phase;

  if (!Array.isArray(phases)) {
    phases = [phase];
  }

  return function (aggregateInstance, command, mark) {
    if (!aggregateInstance.state[propertyName]) {
      throw new Error('State does not contain property ' + propertyName + '.');
    }

    var currentPhase = aggregateInstance.state[propertyName];

    if (!phases.includes(currentPhase)) {
      return mark.asRejected('Invalid ' + propertyName + '.');
    }

    mark.asReadyForNext();
  };
};

only.ifValidatedBy = util.deprecate(function (schema) {
  return only.ifCommandValidatedBy(schema);
}, 'only.ifValidatedBy is deprecated, use only.ifCommandValidatedBy instead.');

only.ifCommandValidatedBy = function (schema) {
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
    var isValid = ajvInstance.validate(schema, command.data);

    if (!isValid) {
      var propertyName = ajvInstance.errors[0].dataPath.substring(1);

      if (!propertyName) {
        return mark.asRejected('Data is invalid.');
      }

      return mark.asRejected(humanizeString(propertyName) + ' is invalid.');
    }
    mark.asReadyForNext();
  };
};

only.ifStateValidatedBy = function (schema) {
  if (!schema) {
    throw new Error('Schema is missing.');
  }

  if (typeof schema === 'function') {
    return function (aggregateInstance, command, mark) {
      if (!schema(aggregateInstance.state)) {
        return mark.asRejected('Data is invalid.');
      }

      mark.asReadyForNext();
    };
  }

  return function (aggregateInstance, command, mark) {
    var isValid = ajvInstance.validate(schema, aggregateInstance.state);

    if (!isValid) {
      var propertyName = ajvInstance.errors[0].dataPath.substring(1);

      if (!propertyName) {
        return mark.asRejected('Data is invalid.');
      }

      return mark.asRejected(humanizeString(propertyName) + ' is invalid.');
    }
    mark.asReadyForNext();
  };
};

module.exports = only;