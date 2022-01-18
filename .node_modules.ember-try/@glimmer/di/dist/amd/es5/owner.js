define('@glimmer/di/owner', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.getOwner = getOwner;
    exports.setOwner = setOwner;
    // TODO - use symbol
    var OWNER = exports.OWNER = '__owner__';
    function getOwner(object) {
        return object[OWNER];
    }
    function setOwner(object, owner) {
        object[OWNER] = owner;
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3duZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzcmMvb3duZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFHQSxBQUFvQixBQUNwQixBQUFNO0FBQUMsUUFBTSxBQUFLLHdCQUFHLEFBQVcsQUFBQyxBQUVqQyxBQUFNO3NCQUFtQixBQUFjLFFBQ3JDLEFBQU07ZUFBQyxBQUFNLE9BQUMsQUFBSyxBQUFDLEFBQUMsQUFDdkIsQUFBQztBQUVELEFBQU07c0JBQW1CLEFBQWMsUUFBRSxBQUFZLE9BQ25ELEFBQU07ZUFBQyxBQUFLLEFBQUMsU0FBRyxBQUFLLEFBQUMsQUFDeEIsQUFBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlZ2lzdHJhdGlvbk9wdGlvbnMgfSBmcm9tICcuL3JlZ2lzdHJ5JztcbmltcG9ydCB7IEZhY3RvcnkgfSBmcm9tICcuL2ZhY3RvcnknO1xuXG4vLyBUT0RPIC0gdXNlIHN5bWJvbFxuZXhwb3J0IGNvbnN0IE9XTkVSID0gJ19fb3duZXJfXyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRPd25lcihvYmplY3Q6IE9iamVjdCk6IE93bmVyIHtcbiAgcmV0dXJuIG9iamVjdFtPV05FUl07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRPd25lcihvYmplY3Q6IE9iamVjdCwgb3duZXI6IE93bmVyKTogdm9pZCB7XG4gIG9iamVjdFtPV05FUl0gPSBvd25lcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBPd25lciB7XG4gIGlkZW50aWZ5KHNwZWNpZmllcjogc3RyaW5nLCByZWZlcnJlcj86IHN0cmluZyk6IHN0cmluZztcblxuICBmYWN0b3J5Rm9yKHNwZWNpZmllcjogc3RyaW5nLCByZWZlcnJlcj86IHN0cmluZyk6IEZhY3Rvcnk8YW55PjtcbiAgXG4gIGxvb2t1cChzcGVjaWZpZXI6IHN0cmluZywgcmVmZXJyZXI/OiBzdHJpbmcpOiBhbnk7XG59XG4iXX0=