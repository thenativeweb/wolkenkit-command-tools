'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(aggregateInstance, command) {
      var event, schema, isValid;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              event = command.data, schema = schemas[event.name];
              isValid = ajvInstance.validate({
                type: 'object',
                properties: {
                  name: { type: 'string', enum: (0, _keys2.default)(schemas) },
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