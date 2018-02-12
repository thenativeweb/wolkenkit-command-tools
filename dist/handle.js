'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var ajv = require('ajv');

var ajvInstance = ajv({
  jsonPointers: true
});

var handle = {};

handle.physicalEvents = function (schemas) {
  if (!schemas) {
    throw new Error('Schemas are missing.');
  }

  return function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(aggregateInstance, command) {
      var event, schema, isValid;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              event = command.data, schema = schemas[event.name];
              isValid = ajvInstance.validate({
                type: 'object',
                properties: {
                  name: { type: 'string', enum: Object.keys(schemas) },
                  data: schema || {}
                },
                required: ['name', 'data'],
                additionalProperties: false
              }, command.data);

              if (isValid) {
                _context.next = 4;
                break;
              }

              return _context.abrupt('return', command.reject('Invalid request.'));

            case 4:

              aggregateInstance.events.publish(event.name, event.data);

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
};

module.exports = handle;