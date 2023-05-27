/**
 * @file otf2ttf
 * @author junmer
 */

/* eslint-env node */

const isOtf = require('is-otf');
const through = require('through2');
const { otf2ttfobject } = require('fonteditor-core');
const { TTFWriter } = require('fonteditor-core');
const { b2ab } = require('b3b');
const { ab2b } = require('b3b');
const replaceExt = require('replace-ext');
const _ = require('lodash');
const util = require('../lib/util');

/**
 * otf2ttf fontmin plugin
 *
 * @param {Object} opts opts
 * @return {Object} stream.Transform instance
 * @api public
 */
module.exports = function (opts) {
  opts = _.extend({ clone: false, hinting: true }, opts);

  // prepare subset
  const subsetText = util.getSubsetText(opts);
  opts.subset = util.string2unicodes(subsetText);

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

      // check otf
      if (!isOtf(file.contents)) {
        cb(null, file);
        return;
      }

      // clone
      if (opts.clone) {
        this.push(file.clone(false));
      }

      // replace ext
      file.path = replaceExt(file.path, '.ttf');

      // ttf info
      let ttfBuffer;
      let ttfObj;

      // try otf2ttf
      try {
        ttfObj = otf2ttfobject(b2ab(file.contents), opts);

        ttfBuffer = ab2b(new TTFWriter(opts).write(ttfObj));
      } catch (ex) {
        cb(ex);
      }

      if (ttfBuffer) {
        file.contents = ttfBuffer;
        file.ttfObject = ttfObj;
        cb(null, file);
      }
    },
  );
};
