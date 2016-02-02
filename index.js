'use strict'

const co = require('co');
const fse = require('co-fs-extra');
const path = require('path');

/**
 * Given a path to a source file and a remote, resolve the absolute path to the
 * remote.  The remote can be a path relative to the source or a path within
 * a dependency (e.g. 'some-package/path/to/file.md').
 * @param {string} from The source path.
 * @param {string} to The remote path.
 * @return {string} The absolute path to the destination.
 */
function resolve(from, to) {
  let absolute;
  if (path.isAbsolute(to)) {
    absolute = to;
  } else if (to.startsWith('.')) {
    absolute = path.resolve(path.dirname(from), to);
  } else {
    let name;
    if (to.startsWith('@')) { // scoped package
      name = to.split('/').slice(0, 2).join('/');
    } else {
      name = to.split('/').shift();
    }
    const dir = path.dirname(require.resolve(name + '/package.json'));
    absolute = path.join(dir, to.replace(name, ''));
  }
  return absolute;
}

/**
 * Configure the mount plugin.
 * @param {Object} config Optional plugin configuration.
 * @param {string} config.prefix Prefix for mount files (defaults to '@').  Any
 *     filename that starts with the prefix will be treated as a mount file.
 * @return {function(Object, Object, function(Error))} The configured plugin.
 */
function mount(config) {
  config = config || {};
  const prefix = config.prefix || '@';
  return function(files, metalsmith, done) {
    co(function *() {
      const source = metalsmith.source();
      for (let file in files) {
        const basename = path.basename(file);
        if (!basename.startsWith(prefix)) {
          continue;
        }
        const content = String(files[file].contents).trim();
        if (!content) {
          throw new Error(
              `Expected mount file "${file}" to contain path to remote`);
        }
        let remote;
        try {
          remote = resolve(path.join(source, file), content);
        } catch (err) {
          throw new Error(
            `Failed to resolve remote "${content}" for mount file "${file}": ${err.message}`);
        }
        const mount = path.join(path.dirname(file), basename.replace(prefix, ''));
        let stats;
        try {
          stats = yield fse.stat(remote);
        } catch (err) {
          throw new Error(`Failed to find remote for mount file "${file}": ${err.message}`);
        }
        if (stats.isDirectory()) {
          const meta = yield metalsmith.read(remote);
          for (let remoteFile in meta) {
            files[path.join(mount, remoteFile)] = meta[remoteFile];
          }
        } else {
          files[mount] = yield metalsmith.readFile(remote);
        }
        delete files[file];
      }
    }).then(() => done()).catch(done);
  }
}

exports = module.exports = mount;
exports._resolve = resolve;
