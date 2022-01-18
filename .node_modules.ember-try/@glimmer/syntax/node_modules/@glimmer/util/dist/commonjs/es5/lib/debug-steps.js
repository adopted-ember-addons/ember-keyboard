"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logStep = exports.verifySteps = exports.endTestSteps = exports.beginTestSteps = void 0;

var _assert = _interopRequireDefault(require("./assert"));

var _platformUtils = require("./platform-utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var beginTestSteps;
exports.beginTestSteps = beginTestSteps;
var endTestSteps;
exports.endTestSteps = endTestSteps;
var verifySteps;
exports.verifySteps = verifySteps;
var logStep;
exports.logStep = logStep;

if (false
/* LOCAL_DEBUG */
) {
    var LOGGED_STEPS = null;

    exports.beginTestSteps = beginTestSteps = function beginTestSteps() {
      (0, _assert.default)(LOGGED_STEPS === null, 'attempted to start steps, but it already began');
      LOGGED_STEPS = {};
    };

    exports.endTestSteps = endTestSteps = function endTestSteps() {
      (0, _assert.default)(LOGGED_STEPS, 'attempted to end steps, but they were not started');
      LOGGED_STEPS = null;
    };

    exports.logStep = logStep = function logStep(type, step) {
      if (LOGGED_STEPS === null) return;
      LOGGED_STEPS[type] = LOGGED_STEPS[type] || [];
      LOGGED_STEPS[type].push(step);
    };

    exports.verifySteps = verifySteps = function verifySteps(type, expectedSteps, message) {
      var loggedSteps = (0, _platformUtils.expect)(LOGGED_STEPS, 'attempetd to verify steps, but steps were not started');
      var steps = loggedSteps[type] || [];
      loggedSteps[type] = [];

      if (Array.isArray(expectedSteps)) {
        QUnit.config.current.assert.deepEqual(steps, expectedSteps, message);
      } else {
        expectedSteps(steps);
      }
    };
  }
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2RlYnVnLXN0ZXBzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7QUFDQTs7OztBQUVPLElBQUEsY0FBQTs7QUFDQSxJQUFBLFlBQUE7O0FBRUEsSUFBQSxXQUFBOztBQUdBLElBQUEsT0FBQTs7O0FBRVAsSUFBQTtBQUFBO0FBQUEsRUFBaUI7QUFDZixRQUFJLFlBQVksR0FBaEIsSUFBQTs7QUFFQSw2QkFBQSxjQUFjLEdBQUcsU0FBQSxjQUFBLEdBQUs7QUFDcEIsMkJBQU8sWUFBWSxLQUFiLElBQU4sRUFBQSxnREFBQTtBQUVBLE1BQUEsWUFBWSxHQUFaLEVBQUE7QUFIRixLQUFBOztBQU1BLDJCQUFBLFlBQVksR0FBRyxTQUFBLFlBQUEsR0FBSztBQUNsQiwyQkFBTSxZQUFOLEVBQUEsbURBQUE7QUFFQSxNQUFBLFlBQVksR0FBWixJQUFBO0FBSEYsS0FBQTs7QUFNQSxzQkFBQSxPQUFPLEdBQUcsU0FBQSxPQUFBLENBQUEsSUFBQSxFQUFBLElBQUEsRUFBZ0M7QUFDeEMsVUFBSSxZQUFZLEtBQWhCLElBQUEsRUFBMkI7QUFFM0IsTUFBQSxZQUFZLENBQVosSUFBWSxDQUFaLEdBQXFCLFlBQVksQ0FBWixJQUFZLENBQVosSUFBckIsRUFBQTtBQUNBLE1BQUEsWUFBWSxDQUFaLElBQVksQ0FBWixDQUFBLElBQUEsQ0FBQSxJQUFBO0FBSkYsS0FBQTs7QUFPQSwwQkFBQSxXQUFXLEdBQUcsU0FBQSxXQUFBLENBQUEsSUFBQSxFQUFBLGFBQUEsRUFBQSxPQUFBLEVBSVY7QUFDRixVQUFJLFdBQVcsR0FBRywyQkFBTSxZQUFOLEVBQWxCLHVEQUFrQixDQUFsQjtBQUVBLFVBQUksS0FBSyxHQUFHLFdBQVcsQ0FBWCxJQUFXLENBQVgsSUFBWixFQUFBO0FBRUEsTUFBQSxXQUFXLENBQVgsSUFBVyxDQUFYLEdBQUEsRUFBQTs7QUFFQSxVQUFJLEtBQUssQ0FBTCxPQUFBLENBQUosYUFBSSxDQUFKLEVBQWtDO0FBQ2hDLFFBQUEsS0FBSyxDQUFMLE1BQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLEVBQUEsYUFBQSxFQUFBLE9BQUE7QUFERixPQUFBLE1BRU87QUFDTCxRQUFBLGFBQWEsQ0FBYixLQUFhLENBQWI7QUFDRDtBQWZILEtBQUE7QUFpQkQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMT0NBTF9ERUJVRyB9IGZyb20gJ0BnbGltbWVyL2xvY2FsLWRlYnVnLWZsYWdzJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnLi9hc3NlcnQnO1xuaW1wb3J0IHsgZXhwZWN0IH0gZnJvbSAnLi9wbGF0Zm9ybS11dGlscyc7XG5cbmV4cG9ydCBsZXQgYmVnaW5UZXN0U3RlcHM6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbmV4cG9ydCBsZXQgZW5kVGVzdFN0ZXBzOiAoKCkgPT4gdm9pZCkgfCB1bmRlZmluZWQ7XG5cbmV4cG9ydCBsZXQgdmVyaWZ5U3RlcHM6XG4gIHwgKCh0eXBlOiBzdHJpbmcsIHN0ZXBzOiB1bmtub3duW10gfCAoKHN0ZXBzOiB1bmtub3duW10pID0+IHZvaWQpLCBtZXNzYWdlPzogc3RyaW5nKSA9PiB2b2lkKVxuICB8IHVuZGVmaW5lZDtcbmV4cG9ydCBsZXQgbG9nU3RlcDogKCh0eXBlOiBzdHJpbmcsIHN0ZXBzOiB1bmtub3duKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcblxuaWYgKExPQ0FMX0RFQlVHKSB7XG4gIGxldCBMT0dHRURfU1RFUFM6IFJlY29yZDxzdHJpbmcsIHVua25vd25bXT4gfCBudWxsID0gbnVsbDtcblxuICBiZWdpblRlc3RTdGVwcyA9ICgpID0+IHtcbiAgICBhc3NlcnQoTE9HR0VEX1NURVBTID09PSBudWxsLCAnYXR0ZW1wdGVkIHRvIHN0YXJ0IHN0ZXBzLCBidXQgaXQgYWxyZWFkeSBiZWdhbicpO1xuXG4gICAgTE9HR0VEX1NURVBTID0ge307XG4gIH07XG5cbiAgZW5kVGVzdFN0ZXBzID0gKCkgPT4ge1xuICAgIGFzc2VydChMT0dHRURfU1RFUFMsICdhdHRlbXB0ZWQgdG8gZW5kIHN0ZXBzLCBidXQgdGhleSB3ZXJlIG5vdCBzdGFydGVkJyk7XG5cbiAgICBMT0dHRURfU1RFUFMgPSBudWxsO1xuICB9O1xuXG4gIGxvZ1N0ZXAgPSAodHlwZTogc3RyaW5nLCBzdGVwOiB1bmtub3duKSA9PiB7XG4gICAgaWYgKExPR0dFRF9TVEVQUyA9PT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgTE9HR0VEX1NURVBTW3R5cGVdID0gTE9HR0VEX1NURVBTW3R5cGVdIHx8IFtdO1xuICAgIExPR0dFRF9TVEVQU1t0eXBlXS5wdXNoKHN0ZXApO1xuICB9O1xuXG4gIHZlcmlmeVN0ZXBzID0gKFxuICAgIHR5cGU6IHN0cmluZyxcbiAgICBleHBlY3RlZFN0ZXBzOiB1bmtub3duW10gfCAoKHN0ZXBzOiB1bmtub3duW10pID0+IHZvaWQpLFxuICAgIG1lc3NhZ2U/OiBzdHJpbmdcbiAgKSA9PiB7XG4gICAgbGV0IGxvZ2dlZFN0ZXBzID0gZXhwZWN0KExPR0dFRF9TVEVQUywgJ2F0dGVtcGV0ZCB0byB2ZXJpZnkgc3RlcHMsIGJ1dCBzdGVwcyB3ZXJlIG5vdCBzdGFydGVkJyk7XG5cbiAgICBsZXQgc3RlcHMgPSBsb2dnZWRTdGVwc1t0eXBlXSB8fCBbXTtcblxuICAgIGxvZ2dlZFN0ZXBzW3R5cGVdID0gW107XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShleHBlY3RlZFN0ZXBzKSkge1xuICAgICAgUVVuaXQuY29uZmlnLmN1cnJlbnQuYXNzZXJ0LmRlZXBFcXVhbChzdGVwcywgZXhwZWN0ZWRTdGVwcywgbWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cGVjdGVkU3RlcHMoc3RlcHMpO1xuICAgIH1cbiAgfTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=