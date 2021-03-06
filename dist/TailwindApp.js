'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs'),
    path = require('path');

var appRoot = require('app-root-path'),
    _require = require('commands-events'),
    Command = _require.Command,
    Event = _require.Event,
    crypto2 = require('crypto2'),
    Datasette = require('datasette'),
    Draht = require('draht'),
    flaschenpost = require('flaschenpost'),
    processenv = require('processenv'),
    Stethoskop = require('stethoskop'),
    Timer = require('timer2');


var IoPort = require('./IoPort');

var TailwindApp = function () {
  function TailwindApp(_ref) {
    var _this = this;

    var identityProvider = _ref.identityProvider,
        profiling = _ref.profiling;
    (0, _classCallCheck3.default)(this, TailwindApp);

    if (identityProvider) {
      if (!identityProvider.name) {
        throw new Error('Identity provider name is missing.');
      }
      if (!identityProvider.certificate) {
        throw new Error('Identity provider certificate is missing.');
      }
    }

    process.on('uncaughtException', function (ex) {
      _this.fail('Application failed unexpectedly.', ex);
    });
    process.on('unhandledRejection', function (ex) {
      _this.fail('Application failed unexpectedly.', ex);
    });

    this.dirname = appRoot.path;
    this.env = processenv;

    /* eslint-disable global-require */
    this.configuration = require(path.join(this.dirname, 'package.json'));
    /* eslint-enable global-require */
    this.name = this.configuration.name;
    this.version = this.configuration.version;
    this.data = new Datasette();

    flaschenpost.use('host', this.name);

    this.logger = flaschenpost.getLogger();

    this.services = {};
    this.services.bus = new Draht();
    this.services.crypto = crypto2;
    this.services.Datasette = Datasette;
    this.services.Emitter = Draht;
    this.services.getLogger = function (source) {
      return flaschenpost.getLogger(source);
    };
    this.services.stethoskop = new Stethoskop({
      from: {
        application: this.name
      },
      to: {
        host: profiling && profiling.host,
        port: profiling && profiling.port
      },
      enabled: Boolean(profiling && profiling.host)
    });
    this.services.Timer = Timer;

    this.identityProvider = {};
    if (identityProvider) {
      this.identityProvider.name = identityProvider.name;
      /* eslint-disable no-sync */
      this.identityProvider.certificate = fs.readFileSync(identityProvider.certificate, { encoding: 'utf8' });
      /* eslint-enable no-sync */
    }

    this.Command = Command;
    this.Event = Event;

    this.api = new IoPort(this);

    // The read function takes the three parameters modelType, modelName and
    // readOptions.
    this.api.read = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              throw new Error('Not implemented.');

            case 1:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    this.commandbus = new IoPort(this);
    this.eventbus = new IoPort(this);
    this.flowbus = new IoPort(this);

    this.api.outgoing.on('data', function () {
      // Register an empty event handler to avoid that outgoing data stacks up
      // if no client is connected. In contrast to the other IO ports it is a
      // valid scenario for the API port that no client is connected. Hence,
      // simply consume potential data and throw it away.
    });

    this.wires = {};

    this.wires.api = {};
    this.wires.api.http = {};
    /* eslint-disable global-require*/
    this.wires.api.http.Server = require('./wires/api/http/Server');
    /* eslint-enable global-require*/

    this.wires.commandbus = {};
    this.wires.commandbus.amqp = {};
    /* eslint-disable global-require*/
    this.wires.commandbus.amqp.Receiver = require('./wires/commandbus/amqp/Receiver');
    this.wires.commandbus.amqp.Sender = require('./wires/commandbus/amqp/Sender');
    /* eslint-enable global-require*/

    this.wires.eventbus = {};
    this.wires.eventbus.amqp = {};
    /* eslint-disable global-require*/
    this.wires.eventbus.amqp.Receiver = require('./wires/eventbus/amqp/Receiver');
    this.wires.eventbus.amqp.Sender = require('./wires/eventbus/amqp/Sender');
    /* eslint-enable global-require*/

    this.wires.flowbus = {};
    this.wires.flowbus.amqp = {};
    /* eslint-disable global-require*/
    this.wires.flowbus.amqp.Receiver = require('./wires/flowbus/amqp/Receiver');
    this.wires.flowbus.amqp.Sender = require('./wires/flowbus/amqp/Sender');
    /* eslint-enable global-require*/
  }

  (0, _createClass3.default)(TailwindApp, [{
    key: 'fail',
    value: function fail(message, err) {
      var _this2 = this;

      this.logger.fatal(message, { err: err });

      // Delay exiting the process to give flaschenpost time to write the log
      // message.
      process.nextTick(function () {
        _this2.exit(1);
      });
    }

    /* eslint-disable class-methods-use-this, no-process-exit */

  }, {
    key: 'exit',
    value: function exit() {
      var code = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      process.exit(code);
    }
    /* eslint-enable class-methods-use-this, no-process-exit */

  }]);
  return TailwindApp;
}();

module.exports = TailwindApp;