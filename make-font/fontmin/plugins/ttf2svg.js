/**
 * @file ttf2svg
 * @author junmer
 */

/* eslint-env node */

const isTtf = require('is-ttf');
const through = require('through2');
const { ttf2svg } = require('fonteditor-core');
const { b2ab } = require('b3b');
const replaceExt = require('replace-ext');
const _ = require('lodash');

function compileTtf(buffer, cb) {
  let output;
  try {
    output = Buffer.from(ttf2svg(b2ab(buffer)));
  } catch (ex) {
    cb(ex);
  }

  output && cb(null, output);
}

/**
 * ttf2svg fontmin plugin
 *
 * @param {Object} opts opts
 * @return {Object} stream.Transform instance
 * @api public
 */
module.exports = function (opts) {
  opts = _.extend({ clone: true }, opts);

  return through.ctor(
    {
      objectMode: true,
    },
    function (file, enc, cb) {
      // check null
      if (file.isNull()) {
        cb(null, file);
        return;
      }

      // check stream
      if (file.isStream()) {
        cb(new Error('Streaming is not supported'));
        return;
      }

      // check ttf
      if (!isTtf(file.contents)) {
        cb(null, file);
        return;
      }

      // clone
      if (opts.clone) {
        this.push(file.clone(false));
      }

      // replace ext
      file.path = replaceExt(file.path, '.svg');

      compileTtf(file.contents, (err, buffer) => {
        if (err) {
          cb(err);
          return;
        }

        file.contents = buffer;
        cb(null, file);
      });
    },
  );
};
