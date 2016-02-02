'use strict'

const expect = require('code').expect;
const lab = exports.lab = require('lab').script();
const path = require('path');

const index = require('./index');

lab.experiment('resolveRemote(from, to)', function() {
  const resolveRemote = index._resolveRemote;

  lab.test('returns absolute path if "to" if it is in a package', function(done) {
    const from = 'path/to/source';
    const to = 'code/LICENSE';
    const absolute = resolveRemote(from, to);
    expect(path.isAbsolute(absolute)).to.be.true();
    expect(absolute.indexOf('node_modules')).to.be.greaterThan(0);
    done();
  });

  lab.test('returns absolute path if "to" is relative', function(done) {
    const from = 'path/to/source';
    const to = './relative/file';
    expect(resolveRemote(from, to)).to.equal(path.resolve(path.dirname(from), to));
    done();
  });

  lab.test('returns "to" if it is absolute', function(done) {
    expect(resolveRemote('foo', '/bar')).to.equal('/bar');
    expect(resolveRemote('/foo', '/bar/bam')).to.equal('/bar/bam');
    done();
  });

});
