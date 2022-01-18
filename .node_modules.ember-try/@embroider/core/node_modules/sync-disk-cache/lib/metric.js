'use strict';

module.exports = class Metric {
  constructor() {
    this.count = 0;
    this.time = 0;
    this.startTime = undefined;
  }

  start() {
    this.startTime = process.hrtime();
    this.count++;
  }

  stop() {
    let change = process.hrtime(this.startTime);

    this.time += change[0] * 1e9 + change[1];
    this.startTime = undefined;
  }

  toJSON() {
    return {
      count: this.count,
      time: this.time
    };
  }
}
