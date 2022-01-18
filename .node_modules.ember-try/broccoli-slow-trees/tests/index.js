var Heimdall = require('heimdalljs/heimdall');
var chai = require('chai'), expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');

var printSlowNodes = require('../index');

chai.use(chaiAsPromised);

function stubTime(ms) {
  process.hrtime = function () {
    return [0, ms * 1e6];
  };
}

function stubProcessColumnSize(size) {
  process.stdout.columns = size;
}

var originalColumnSize = process.stdout.columns;
var originalHrtime = process.hrtime;

function restoreTime() {
  process.hrtime = originalHrtime;
}

function restoreProcessColumnSize() {
  process.stdout.columns = originalColumnSize;
}

describe('printSlowNodes', function() {
  afterEach(function() {
    restoreTime();
    restoreProcessColumnSize();
  });

  it('prints slow nodes for simple graphs', function() {
    stubTime(100);
    stubProcessColumnSize(100);

    var heimdall = new Heimdall();

    return expect(heimdall.node({ name: 'babel', broccoliNode: true, }, function () {
      stubTime(200);
      return heimdall.node({ name: 'merge-trees', broccoliNode: true }, function () {
        stubTime(350);
      });
    }).then(function () {
      return heimdall.node({ name: 'merge-trees', broccoliNode: true }, function () {
        stubTime(600);
      });
    }).then(function () {
      var output = [];

      printSlowNodes(heimdall, null, function(data) { output.push(data) });

      return output;
    })).to.eventually.deep.equal([
      '\n' +
        'Slowest Nodes (totalTime >= 5%)     | Total (avg) \n' +
        '------------------------------------+-------------\n' +
        'merge-trees (2)                     | 400ms (200 ms)\n' +
        'babel (1)                           | 100ms       \n'
    ]);
  });

  it('prints slow nodes but only takes up as much space as necessary', function() {
    stubTime(100);
    stubProcessColumnSize(70);

    var heimdall = new Heimdall();

    return expect(heimdall.node({ name: 'babel', broccoliNode: true, }, function () {
      stubTime(200);
      return heimdall.node({ name: 'merge-trees-larger-name-data', broccoliNode: true }, function () {
        stubTime(350);
      });
    }).then(function () {
      var output = [];

      printSlowNodes(heimdall, null, function(data) { output.push(data) });

      return output;
    })).to.eventually.deep.equal([
      '\n' +
        'Slowest Nodes (totalTime >= 5%)     | Total (avg)\n' +
        '------------------------------------+---------\n' +
        'merge-trees-larger-name-data (1)    | 150ms   \n' +
        'babel (1)                           | 100ms   \n'
    ]);
  });

  it('prints slow nodes should expand based upon process.stdout.column', function() {
    stubTime(100);
    stubProcessColumnSize(250);

    var heimdall = new Heimdall();

    return expect(heimdall.node({ name: 'babel', broccoliNode: true, }, function () {
      stubTime(200);
      return heimdall.node({ name: 'merge-trees-larger-name-data-with-more-information', broccoliNode: true }, function () {
        stubTime(350);
      });
    }).then(function () {
      var output = [];

      printSlowNodes(heimdall, null, function(data) { output.push(data) });

      return output;
    })).to.eventually.deep.equal([
      '\n' +
        'Slowest Nodes (totalTime >= 5%)                         | Total (avg)                    \n' +
        '--------------------------------------------------------+--------------------------------\n' +
        'merge-trees-larger-name-data-with-more-information (1)  | 150ms                          \n' +
        'babel (1)                                               | 100ms                          \n'
    ]);
  });
});
