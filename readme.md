# `metalsmith-mount`

[![Greenkeeper badge](https://badges.greenkeeper.io/tschaub/metalsmith-mount.svg)](https://greenkeeper.io/)

A Metalsmith plugin for mounting additional resources onto a source tree.

## what it does

The `mount` plugin scans your source tree for files that start with the `@` prefix (use the `prefix` option to change this).  The contents of a mount file should be a single line with the path to the resource(s) to be mounted.  This can be a relative path, and absolute path, or a module identifier (for one of your project dependencies).  If the remote path leads to a file, the file contents will be made available at the mount file path (minus the `@` prefix).  If the remote path leads to a directory, all files in the directory (and any subdirectories) will be read and made available at the mount path (minus the `@` prefix).

## example

Assume you want to pull in a directory of files from one of your project dependencies (named `some-package`).  And you want files within this directory to be available at `some/path` relative to your source directory.

```
src/
  some/
    @path

node_modules/
  some-package/
    sub/
      directory/
        file1.md
        file2.md
```

If the `src/some/@path` mount file has the contents `some-package/sub/directory`, then the files in this directory will be made available to other Metalsmith plugins at `some/path/file1.md` and `some/path/file2.md`.

## use

Install Metalsmith and the mount plugin (requires Node >= 0.4):

    npm install metalsmith metalsmith-mount --save-dev

Configure the plugin:

```js
var metalsmith = require('metalsmith');
var mount = require('metalsmith-mount');

metalsmith(__dirname)
  .use(mount())
  .build(function(err) {
    if (err) {
      process.stderr.write(err.message + '\n');
      process.exit(1);
    }
  });
```

## options

You can configure the `mount` plugin by calling it with an `options` object with any of the properties below:

 * `prefix` - `string` Filename prefix for mount files.  Default is `'@'`.
