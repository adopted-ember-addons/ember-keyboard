const buildOutputWrapper = require('../src');
const tmp = require('tmp');
const fs = require('fs');
const { expect } = require('chai');

describe('output-wrapper', function() {
  let output, temp, node;

  beforeEach(() => {
    temp = tmp.dirSync();
    node = {
      outputPath: temp.name,
    };
    output = buildOutputWrapper(node);
  });

  it('should write to given location', function() {
    output.writeFileSync('test.md', 'test');
    let content = fs.readFileSync(`${temp.name}/test.md`, 'UTF-8');
    expect(content).to.be.equal('test');
  });

  it(`throws actionable error when absolute path is provided`, function() {
    expect(() => output.writeFileSync(`${temp.name}/test.md`, 'test')).to.throw(
      `Relative path is expected, path ${temp.name}/test.md is an absolute path.`
    );
  });

  it(`throws actionable error when relative path is traverses above outputPath`, function() {
    expect(() => output.writeFileSync(`../../../test.md`, 'test')).to.throw(
      `Traversing above the outputPath is not allowed. Relative path ../../../test.md traverses beyond ${node.outputPath}`
    );
  });

  it(`should not allow other fs operations`, function() {
    expect(() => output.writevSync('test.md', 'test')).to.throw(
      `Operation writevSync is not allowed to use. Allowed operations are readFileSync,existsSync,lstatSync,readdirSync,statSync,writeFileSync,appendFileSync,rmdirSync,mkdirSync`
    );
  });

  it(`should throw if the dir strutcture doesn't exist and attempt to write`, function() {
    expect(() => output.writeFileSync('test/test.md', 'test')).to.throw(
      /.*no such file or directory.*/
    );
  });

  it(`should throw if the dir strutcture doesn't exist and attempt to read`, function() {
    expect(() => output.readFileSync('test/test.md')).to.throw(
      /ENOENT: no such file or directory,/
    );
  });
});