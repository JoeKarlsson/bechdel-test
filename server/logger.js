const winston = require('winston'),
      fs      = require('fs'),
      util    = require('util'),
      moment  = require('moment'),
      path    = require('path');

// Setup a custom logger as per https://github.com/flatiron/winston#adding-custom-transports
const SplitFileLogger = winston.transports.SplitFileLogger = function(options) {
  winston.Transport.call(this, options);    // required, otherwise debug level messages will never pass through - https://github.com/flatiron/winston/issues/392
  this.directory = options.directory || path.join(__dirname, 'logs');
};

util.inherits(SplitFileLogger, winston.Transport);

SplitFileLogger.prototype.name = 'SplitFileLogger';

SplitFileLogger.prototype.log = function(level, msg, meta, cb) {
  var self = this;

  if (self.silent) {
    return cb(null, true);
  }

  if (typeof msg !== 'string') {
    msg = '' + msg;
  }

  msg = msg.replace(/"/g, '""');

  var file = path.join(self.directory, getFile(level));

  var metaStr = JSON.stringify(meta);
  metaStr = (metaStr === '{}') ? '' : ',' + metaStr;

  var data = moment().utc().format('HH:mm:ss.SSS') + ',"' + msg + '"' + metaStr + '\n';

  fs.appendFile(file, data, function(err) {
    if (err) throw err;

    cb(null, true);
  });
};

function getFile(level) {
  var d = moment().utc().format('YYYY-MM-DD');
  return d + '_' + level + '.log';
}

// configure winston
winston.setLevels({
  debug : 0,
  info  : 1,
  warn  : 2,
  error : 3,
  fatal : 4
});

winston.add(winston.transports.SplitFileLogger, { level : 'debug', directory : path.resolve(__dirname, '../logs') });
winston.add(winston.transports.File, { level : 'debug', filename : path.resolve(__dirname, '../logs/debug.log'), maxsize : 1024 * 1024 * 10 /* 10MB */ });

exports = module.exports = winston;