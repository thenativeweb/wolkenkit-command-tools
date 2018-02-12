'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var ajv = require('ajv'),
    humanizeString = require('humanize-string');

var ajvInstance = ajv({
  jsonPointers: true
});

var only = {};

only.ifExists = function () {
  return function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(aggregateInstance, command) {
      var aggregateName;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (aggregateInstance.exists()) {
                _context.next = 3;
                break;
              }

              aggregateName = humanizeString(command.aggregate.name);
              return _context.abrupt('return', command.reject(aggregateName + ' does not exist.'));

            case 3:
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

only.ifNotExists = function () {
  return function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(aggregateInstance, command) {
      var aggregateName;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!aggregateInstance.exists()) {
                _context2.next = 3;
                break;
              }

              aggregateName = humanizeString(command.aggregate.name);
              return _context2.abrupt('return', command.reject(aggregateName + ' already exists.'));

            case 3:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }();
};

only.ifInPhase = function (phase) {
  var propertyName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'phase';

  var phases = phase;

  if (!Array.isArray(phases)) {
    phases = [phase];
  }

  return function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(aggregateInstance, command) {
      var currentPhase;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (aggregateInstance.state[propertyName]) {
                _context3.next = 2;
                break;
              }

              throw new Error('State does not contain property ' + propertyName + '.');

            case 2:
              currentPhase = aggregateInstance.state[propertyName];

              if (phases.includes(currentPhase)) {
                _context3.next = 5;
                break;
              }

              return _context3.abrupt('return', command.reject('Invalid ' + propertyName + '.'));

            case 5:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    return function (_x6, _x7) {
      return _ref3.apply(this, arguments);
    };
  }();
};

only.ifCommandValidatedBy = function (schema) {
  if (!schema) {
    throw new Error('Schema is missing.');
  }

  if (typeof schema === 'function') {
    return function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(aggregateInstance, command) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (schema(command.data)) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt('return', command.reject('Data is invalid.'));

              case 2:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      return function (_x8, _x9) {
        return _ref4.apply(this, arguments);
      };
    }();
  }

  return function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(aggregateInstance, command) {
      var isValid, propertyName;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              isValid = ajvInstance.validate(schema, command.data);

              if (isValid) {
                _context5.next = 6;
                break;
              }

              propertyName = ajvInstance.errors[0].dataPath.substring(1);

              if (propertyName) {
                _context5.next = 5;
                break;
              }

              return _context5.abrupt('return', command.reject('Data is invalid.'));

            case 5:
              return _context5.abrupt('return', command.reject(humanizeString(propertyName) + ' is invalid.'));

            case 6:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    return function (_x10, _x11) {
      return _ref5.apply(this, arguments);
    };
  }();
};

only.ifStateValidatedBy = function (schema) {
  if (!schema) {
    throw new Error('Schema is missing.');
  }

  if (typeof schema === 'function') {
    return function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(aggregateInstance, command) {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (schema(aggregateInstance.state)) {
                  _context6.next = 2;
                  break;
                }

                return _context6.abrupt('return', command.reject('Data is invalid.'));

              case 2:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      return function (_x12, _x13) {
        return _ref6.apply(this, arguments);
      };
    }();
  }

  return function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(aggregateInstance, command) {
      var isValid, propertyName;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              isValid = ajvInstance.validate(schema, aggregateInstance.state);

              if (isValid) {
                _context7.next = 6;
                break;
              }

              propertyName = ajvInstance.errors[0].dataPath.substring(1);

              if (propertyName) {
                _context7.next = 5;
                break;
              }

              return _context7.abrupt('return', command.reject('Data is invalid.'));

            case 5:
              return _context7.abrupt('return', command.reject(humanizeString(propertyName) + ' is invalid.'));

            case 6:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, this);
    }));

    return function (_x14, _x15) {
      return _ref7.apply(this, arguments);
    };
  }();
};

module.exports = only;