'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var ajv = require('ajv'),
    humanizeString = require('humanize-string');

var ajvInstance = ajv({
  jsonPointers: true
});
var only = {};

only.ifExists = function () {
  return (
    /*#__PURE__*/
    function () {
      var _ref = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee(aggregateInstance, command) {
        var aggregateName;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (aggregateInstance.exists()) {
                  _context.next = 3;
                  break;
                }

                aggregateName = humanizeString(command.aggregate.name);
                return _context.abrupt("return", command.reject("".concat(aggregateName, " does not exist.")));

              case 3:
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

only.ifNotExists = function () {
  return (
    /*#__PURE__*/
    function () {
      var _ref2 = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee2(aggregateInstance, command) {
        var aggregateName;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!aggregateInstance.exists()) {
                  _context2.next = 3;
                  break;
                }

                aggregateName = humanizeString(command.aggregate.name);
                return _context2.abrupt("return", command.reject("".concat(aggregateName, " already exists.")));

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }()
  );
};

only.ifAggregateExists = function (_ref3) {
  var contextName = _ref3.contextName,
      aggregateName = _ref3.aggregateName,
      aggregateId = _ref3.aggregateId,
      _ref3$isOptional = _ref3.isOptional,
      isOptional = _ref3$isOptional === void 0 ? false : _ref3$isOptional;

  if (!contextName) {
    throw new Error('Context name is missing.');
  }

  if (!aggregateName) {
    throw new Error('Aggregate name is missing.');
  }

  if (!aggregateId) {
    throw new Error('Aggregate id is missing.');
  }

  return (
    /*#__PURE__*/
    function () {
      var _ref5 = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee3(aggregateInstance, command, _ref4) {
        var app, aggregateInstanceId;
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                app = _ref4.app;

                if (app[contextName]) {
                  _context3.next = 3;
                  break;
                }

                return _context3.abrupt("return", command.reject("Invalid context '".concat(contextName, "'.")));

              case 3:
                if (app[contextName][aggregateName]) {
                  _context3.next = 5;
                  break;
                }

                return _context3.abrupt("return", command.reject("Invalid aggregate '".concat(aggregateName, "' in context '").concat(contextName, "'.")));

              case 5:
                _context3.prev = 5;
                aggregateInstanceId = aggregateId(command);
                _context3.next = 12;
                break;

              case 9:
                _context3.prev = 9;
                _context3.t0 = _context3["catch"](5);
                return _context3.abrupt("return", command.reject('Failed to get aggregate id.'));

              case 12:
                if (aggregateInstanceId) {
                  _context3.next = 16;
                  break;
                }

                if (!isOptional) {
                  _context3.next = 15;
                  break;
                }

                return _context3.abrupt("return");

              case 15:
                return _context3.abrupt("return", command.reject('Failed to get aggregate id.'));

              case 16:
                _context3.prev = 16;
                _context3.next = 19;
                return app[contextName][aggregateName](aggregateInstanceId).read();

              case 19:
                _context3.next = 24;
                break;

              case 21:
                _context3.prev = 21;
                _context3.t1 = _context3["catch"](16);
                command.reject(_context3.t1.message);

              case 24:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, null, [[5, 9], [16, 21]]);
      }));

      return function (_x5, _x6, _x7) {
        return _ref5.apply(this, arguments);
      };
    }()
  );
};

only.ifInPhase = function (phase) {
  var propertyName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'phase';
  var phases = phase;

  if (!Array.isArray(phases)) {
    phases = [phase];
  }

  return (
    /*#__PURE__*/
    function () {
      var _ref6 = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee4(aggregateInstance, command) {
        var currentPhase;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (aggregateInstance.state[propertyName]) {
                  _context4.next = 2;
                  break;
                }

                throw new Error("State does not contain property ".concat(propertyName, "."));

              case 2:
                currentPhase = aggregateInstance.state[propertyName];

                if (phases.includes(currentPhase)) {
                  _context4.next = 5;
                  break;
                }

                return _context4.abrupt("return", command.reject("Invalid ".concat(propertyName, ".")));

              case 5:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      return function (_x8, _x9) {
        return _ref6.apply(this, arguments);
      };
    }()
  );
};

only.ifCommandValidatedBy = function (schema) {
  if (!schema) {
    throw new Error('Schema is missing.');
  }

  if (typeof schema === 'function') {
    return (
      /*#__PURE__*/
      function () {
        var _ref7 = (0, _asyncToGenerator2.default)(
        /*#__PURE__*/
        _regenerator.default.mark(function _callee5(aggregateInstance, command) {
          return _regenerator.default.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  if (schema(command.data)) {
                    _context5.next = 2;
                    break;
                  }

                  return _context5.abrupt("return", command.reject('Data is invalid.'));

                case 2:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5);
        }));

        return function (_x10, _x11) {
          return _ref7.apply(this, arguments);
        };
      }()
    );
  }

  return (
    /*#__PURE__*/
    function () {
      var _ref8 = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee6(aggregateInstance, command) {
        var isValid, propertyName;
        return _regenerator.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                isValid = ajvInstance.validate(schema, command.data);

                if (isValid) {
                  _context6.next = 6;
                  break;
                }

                propertyName = ajvInstance.errors[0].dataPath.substring(1);

                if (propertyName) {
                  _context6.next = 5;
                  break;
                }

                return _context6.abrupt("return", command.reject('Data is invalid.'));

              case 5:
                return _context6.abrupt("return", command.reject("".concat(humanizeString(propertyName), " is invalid.")));

              case 6:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      return function (_x12, _x13) {
        return _ref8.apply(this, arguments);
      };
    }()
  );
};

only.ifStateValidatedBy = function (schema) {
  if (!schema) {
    throw new Error('Schema is missing.');
  }

  if (typeof schema === 'function') {
    return (
      /*#__PURE__*/
      function () {
        var _ref9 = (0, _asyncToGenerator2.default)(
        /*#__PURE__*/
        _regenerator.default.mark(function _callee7(aggregateInstance, command) {
          return _regenerator.default.wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  if (schema(aggregateInstance.state)) {
                    _context7.next = 2;
                    break;
                  }

                  return _context7.abrupt("return", command.reject('Data is invalid.'));

                case 2:
                case "end":
                  return _context7.stop();
              }
            }
          }, _callee7);
        }));

        return function (_x14, _x15) {
          return _ref9.apply(this, arguments);
        };
      }()
    );
  }

  return (
    /*#__PURE__*/
    function () {
      var _ref10 = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee8(aggregateInstance, command) {
        var isValid, propertyName;
        return _regenerator.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                isValid = ajvInstance.validate(schema, aggregateInstance.state);

                if (isValid) {
                  _context8.next = 6;
                  break;
                }

                propertyName = ajvInstance.errors[0].dataPath.substring(1);

                if (propertyName) {
                  _context8.next = 5;
                  break;
                }

                return _context8.abrupt("return", command.reject('Data is invalid.'));

              case 5:
                return _context8.abrupt("return", command.reject("".concat(humanizeString(propertyName), " is invalid.")));

              case 6:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }));

      return function (_x16, _x17) {
        return _ref10.apply(this, arguments);
      };
    }()
  );
};

module.exports = only;