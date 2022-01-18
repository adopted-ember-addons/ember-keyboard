"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logStep = exports.verifySteps = exports.endTestSteps = exports.beginTestSteps = void 0;

var _assert = _interopRequireDefault(require("./assert"));

var _platformUtils = require("./platform-utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let beginTestSteps;
exports.beginTestSteps = beginTestSteps;
let endTestSteps;
exports.endTestSteps = endTestSteps;
let verifySteps;
exports.verifySteps = verifySteps;
let logStep;
exports.logStep = logStep;

if (false
/* LOCAL_DEBUG */
) {
    let LOGGED_STEPS = null;

    exports.beginTestSteps = beginTestSteps = () => {
      (0, _assert.default)(LOGGED_STEPS === null, 'attempted to start steps, but it already began');
      LOGGED_STEPS = {};
    };

    exports.endTestSteps = endTestSteps = () => {
      (0, _assert.default)(LOGGED_STEPS, 'attempted to end steps, but they were not started');
      LOGGED_STEPS = null;
    };

    exports.logStep = logStep = (type, step) => {
      if (LOGGED_STEPS === null) return;
      LOGGED_STEPS[type] = LOGGED_STEPS[type] || [];
      LOGGED_STEPS[type].push(step);
    };

    exports.verifySteps = verifySteps = (type, expectedSteps, message) => {
      let loggedSteps = (0, _platformUtils.expect)(LOGGED_STEPS, 'attempetd to verify steps, but steps were not started');
      let steps = loggedSteps[type] || [];
      loggedSteps[type] = [];

      if (Array.isArray(expectedSteps)) {
        QUnit.config.current.assert.deepEqual(steps, expectedSteps, message);
      } else {
        expectedSteps(steps);
      }
    };
  }
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2RlYnVnLXN0ZXBzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7QUFDQTs7OztBQUVPLElBQUEsY0FBQTs7QUFDQSxJQUFBLFlBQUE7O0FBRUEsSUFBQSxXQUFBOztBQUdBLElBQUEsT0FBQTs7O0FBRVAsSUFBQTtBQUFBO0FBQUEsRUFBaUI7QUFDZixRQUFJLFlBQVksR0FBaEIsSUFBQTs7QUFFQSw2QkFBQSxjQUFjLEdBQUcsTUFBSztBQUNwQiwyQkFBTyxZQUFZLEtBQWIsSUFBTixFQUFBLGdEQUFBO0FBRUEsTUFBQSxZQUFZLEdBQVosRUFBQTtBQUhGLEtBQUE7O0FBTUEsMkJBQUEsWUFBWSxHQUFHLE1BQUs7QUFDbEIsMkJBQU0sWUFBTixFQUFBLG1EQUFBO0FBRUEsTUFBQSxZQUFZLEdBQVosSUFBQTtBQUhGLEtBQUE7O0FBTUEsc0JBQUEsT0FBTyxHQUFHLENBQUEsSUFBQSxFQUFBLElBQUEsS0FBZ0M7QUFDeEMsVUFBSSxZQUFZLEtBQWhCLElBQUEsRUFBMkI7QUFFM0IsTUFBQSxZQUFZLENBQVosSUFBWSxDQUFaLEdBQXFCLFlBQVksQ0FBWixJQUFZLENBQVosSUFBckIsRUFBQTtBQUNBLE1BQUEsWUFBWSxDQUFaLElBQVksQ0FBWixDQUFBLElBQUEsQ0FBQSxJQUFBO0FBSkYsS0FBQTs7QUFPQSwwQkFBQSxXQUFXLEdBQUcsQ0FBQSxJQUFBLEVBQUEsYUFBQSxFQUFBLE9BQUEsS0FJVjtBQUNGLFVBQUksV0FBVyxHQUFHLDJCQUFNLFlBQU4sRUFBbEIsdURBQWtCLENBQWxCO0FBRUEsVUFBSSxLQUFLLEdBQUcsV0FBVyxDQUFYLElBQVcsQ0FBWCxJQUFaLEVBQUE7QUFFQSxNQUFBLFdBQVcsQ0FBWCxJQUFXLENBQVgsR0FBQSxFQUFBOztBQUVBLFVBQUksS0FBSyxDQUFMLE9BQUEsQ0FBSixhQUFJLENBQUosRUFBa0M7QUFDaEMsUUFBQSxLQUFLLENBQUwsTUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsRUFBQSxhQUFBLEVBQUEsT0FBQTtBQURGLE9BQUEsTUFFTztBQUNMLFFBQUEsYUFBYSxDQUFiLEtBQWEsQ0FBYjtBQUNEO0FBZkgsS0FBQTtBQWlCRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExPQ0FMX0RFQlVHIH0gZnJvbSAnQGdsaW1tZXIvbG9jYWwtZGVidWctZmxhZ3MnO1xuaW1wb3J0IGFzc2VydCBmcm9tICcuL2Fzc2VydCc7XG5pbXBvcnQgeyBleHBlY3QgfSBmcm9tICcuL3BsYXRmb3JtLXV0aWxzJztcblxuZXhwb3J0IGxldCBiZWdpblRlc3RTdGVwczogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuZXhwb3J0IGxldCBlbmRUZXN0U3RlcHM6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcblxuZXhwb3J0IGxldCB2ZXJpZnlTdGVwczpcbiAgfCAoKHR5cGU6IHN0cmluZywgc3RlcHM6IHVua25vd25bXSB8ICgoc3RlcHM6IHVua25vd25bXSkgPT4gdm9pZCksIG1lc3NhZ2U/OiBzdHJpbmcpID0+IHZvaWQpXG4gIHwgdW5kZWZpbmVkO1xuZXhwb3J0IGxldCBsb2dTdGVwOiAoKHR5cGU6IHN0cmluZywgc3RlcHM6IHVua25vd24pID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuXG5pZiAoTE9DQUxfREVCVUcpIHtcbiAgbGV0IExPR0dFRF9TVEVQUzogUmVjb3JkPHN0cmluZywgdW5rbm93bltdPiB8IG51bGwgPSBudWxsO1xuXG4gIGJlZ2luVGVzdFN0ZXBzID0gKCkgPT4ge1xuICAgIGFzc2VydChMT0dHRURfU1RFUFMgPT09IG51bGwsICdhdHRlbXB0ZWQgdG8gc3RhcnQgc3RlcHMsIGJ1dCBpdCBhbHJlYWR5IGJlZ2FuJyk7XG5cbiAgICBMT0dHRURfU1RFUFMgPSB7fTtcbiAgfTtcblxuICBlbmRUZXN0U3RlcHMgPSAoKSA9PiB7XG4gICAgYXNzZXJ0KExPR0dFRF9TVEVQUywgJ2F0dGVtcHRlZCB0byBlbmQgc3RlcHMsIGJ1dCB0aGV5IHdlcmUgbm90IHN0YXJ0ZWQnKTtcblxuICAgIExPR0dFRF9TVEVQUyA9IG51bGw7XG4gIH07XG5cbiAgbG9nU3RlcCA9ICh0eXBlOiBzdHJpbmcsIHN0ZXA6IHVua25vd24pID0+IHtcbiAgICBpZiAoTE9HR0VEX1NURVBTID09PSBudWxsKSByZXR1cm47XG5cbiAgICBMT0dHRURfU1RFUFNbdHlwZV0gPSBMT0dHRURfU1RFUFNbdHlwZV0gfHwgW107XG4gICAgTE9HR0VEX1NURVBTW3R5cGVdLnB1c2goc3RlcCk7XG4gIH07XG5cbiAgdmVyaWZ5U3RlcHMgPSAoXG4gICAgdHlwZTogc3RyaW5nLFxuICAgIGV4cGVjdGVkU3RlcHM6IHVua25vd25bXSB8ICgoc3RlcHM6IHVua25vd25bXSkgPT4gdm9pZCksXG4gICAgbWVzc2FnZT86IHN0cmluZ1xuICApID0+IHtcbiAgICBsZXQgbG9nZ2VkU3RlcHMgPSBleHBlY3QoTE9HR0VEX1NURVBTLCAnYXR0ZW1wZXRkIHRvIHZlcmlmeSBzdGVwcywgYnV0IHN0ZXBzIHdlcmUgbm90IHN0YXJ0ZWQnKTtcblxuICAgIGxldCBzdGVwcyA9IGxvZ2dlZFN0ZXBzW3R5cGVdIHx8IFtdO1xuXG4gICAgbG9nZ2VkU3RlcHNbdHlwZV0gPSBbXTtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KGV4cGVjdGVkU3RlcHMpKSB7XG4gICAgICBRVW5pdC5jb25maWcuY3VycmVudC5hc3NlcnQuZGVlcEVxdWFsKHN0ZXBzLCBleHBlY3RlZFN0ZXBzLCBtZXNzYWdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXhwZWN0ZWRTdGVwcyhzdGVwcyk7XG4gICAgfVxuICB9O1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==