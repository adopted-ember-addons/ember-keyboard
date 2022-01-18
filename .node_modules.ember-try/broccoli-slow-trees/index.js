var calculateSummary = require('./calculate-summary');

function ellipsize(string, desiredLength) {
  if (string.length > desiredLength) {
    return string.slice(0, desiredLength - 3) + '...';
  } else {
    return string;
  }
}

function getLargestString(strings) {
  return Math.max.apply(Math, strings.map(function(string) { return string.length; }));
}

module.exports = function printSlowNodes(tree, factor, log) {
  try {
    log = log || console.log;
    var summary = calculateSummary(tree);
    var pcThreshold = factor || 0.05;
    var msThreshold = pcThreshold * summary.totalTime;
    var cumulativeLogLines = [];


    // get the max table length, which is found by looping over all the strings and getting the largest one.
    // If that is larger than the terminal width we will ellipsize
    var largestStringLength = getLargestString(summary.groupedNodes.map(function(group) {
      return group.name
    })) + 5 // compensate for additional space for group string

    // this is the length of 'Slowest Nodes (totalTime >= 5%)'
    var MIN_NAME_CELL_LENGTH = 35;

    var MAX_TABLE_LENGTH = process.stdout.columns;
    // the name column is 8/10th the size of the value cell
    var MAX_NAME_CELL_LENGTH = largestStringLength < Math.floor(MAX_TABLE_LENGTH / 2) ? Math.max(MIN_NAME_CELL_LENGTH, largestStringLength) : Math.floor(MAX_TABLE_LENGTH / 2);
    // the name column is 2/10th the size of the value celll
    var MAX_VALUE_CELL_LENGTH = Math.floor(MAX_TABLE_LENGTH / 8);

    for (var i = 0; i < summary.groupedNodes.length; i++) {
      var group = summary.groupedNodes[i];
      var averageStr;

      if (group.totalSelfTime > msThreshold) {
        if (group.count > 1) {
          averageStr = ' (' + Math.floor(group.averageSelfTime) + ' ms)';
        } else {
          averageStr = '';
        }

        var countStr = ' (' + group.count + ')'
        var nameStr = ellipsize(group.name, MAX_NAME_CELL_LENGTH - countStr.length)

        cumulativeLogLines.push(pad(nameStr + countStr, MAX_NAME_CELL_LENGTH) + ' | ' + pad(Math.floor(group.totalSelfTime) + 'ms' + averageStr, MAX_VALUE_CELL_LENGTH))
      }
    }

    cumulativeLogLines.unshift(pad('', MAX_NAME_CELL_LENGTH, '-') + '-+-' + pad('', MAX_VALUE_CELL_LENGTH, '-'))
    cumulativeLogLines.unshift(pad('Slowest Nodes (totalTime >= ' + (pcThreshold * 100) +'%)', MAX_NAME_CELL_LENGTH) + ' | ' + pad('Total (avg)', MAX_VALUE_CELL_LENGTH))

    log('\n' + cumulativeLogLines.join('\n') + '\n')
  } catch (e) {
    console.error('Error when printing slow nodes:', e);
    console.error(e.stack)
  }
}


function pad(str, len, char, dir) {
  if (!char) { char = ' '}

  if (len + 1 >= str.length)
    switch (dir){
      case 'left':
        str = Array(len + 1 - str.length).join(char) + str
        break

      case 'both':
        var padlen = len - str.length
        var right = Math.ceil(padlen / 2)
        var left = padlen - right
        str = Array(left + 1).join(char) + str + Array(right + 1).join(char)
        break

      default:
        str = str + Array(len + 1 - str.length).join(char)
    }

  return str
}
