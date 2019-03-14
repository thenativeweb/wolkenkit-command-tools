'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var ajv = require('ajv');

var ajvInstance = ajv({
  jsonPointers: true
});
var handle = {};

handle.physicalEvents = function (schemas) {
  if (!schemas) {
    throw new Error('Schemas are missing.');
  }

  return (
    /*#__PURE__*/
    function () {
      var _ref = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee(aggregateInstance, command) {
        var event, schema, isValid;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                event = command.data, schema = schemas[event.name];
                isValid = ajvInstance.validate({
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      enum: Object.keys(schemas)
                    },
                    data: schema || {}
                  },
                  required: ['name', 'data'],
                  additionalProperties: false
                }, command.data);

                if (isValid) {
                  _context.next = 4;
                  break;
                }

                return _context.abrupt("return", command.reject('Invalid request.'));

              case 4:
                aggregateInstance.events.publish(event.name, event.data);

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }()
  );
};

module.exports = handle;