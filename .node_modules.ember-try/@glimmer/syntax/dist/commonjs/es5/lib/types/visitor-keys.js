"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _util = require("@glimmer/util");

// ensure stays in sync with typing
// ParentNode and ChildKey types are derived from VisitorKeysMap
var visitorKeys = {
  Program: (0, _util.tuple)('body'),
  Template: (0, _util.tuple)('body'),
  Block: (0, _util.tuple)('body'),
  MustacheStatement: (0, _util.tuple)('path', 'params', 'hash'),
  BlockStatement: (0, _util.tuple)('path', 'params', 'hash', 'program', 'inverse'),
  ElementModifierStatement: (0, _util.tuple)('path', 'params', 'hash'),
  PartialStatement: (0, _util.tuple)('name', 'params', 'hash'),
  CommentStatement: (0, _util.tuple)(),
  MustacheCommentStatement: (0, _util.tuple)(),
  ElementNode: (0, _util.tuple)('attributes', 'modifiers', 'children', 'comments'),
  AttrNode: (0, _util.tuple)('value'),
  TextNode: (0, _util.tuple)(),
  ConcatStatement: (0, _util.tuple)('parts'),
  SubExpression: (0, _util.tuple)('path', 'params', 'hash'),
  PathExpression: (0, _util.tuple)(),
  StringLiteral: (0, _util.tuple)(),
  BooleanLiteral: (0, _util.tuple)(),
  NumberLiteral: (0, _util.tuple)(),
  NullLiteral: (0, _util.tuple)(),
  UndefinedLiteral: (0, _util.tuple)(),
  Hash: (0, _util.tuple)('pairs'),
  HashPair: (0, _util.tuple)('value')
};
var _default = visitorKeys;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdHlwZXMvdmlzaXRvci1rZXlzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFHQTtBQUNBO0FBQ0EsSUFBTSxXQUFXLEdBQUc7QUFDbEIsRUFBQSxPQUFPLEVBQUUsaUJBRFMsTUFDVCxDQURTO0FBRWxCLEVBQUEsUUFBUSxFQUFFLGlCQUZRLE1BRVIsQ0FGUTtBQUdsQixFQUFBLEtBQUssRUFBRSxpQkFIVyxNQUdYLENBSFc7QUFLbEIsRUFBQSxpQkFBaUIsRUFBRSxpQkFBSyxNQUFMLEVBQUssUUFBTCxFQUxELE1BS0MsQ0FMRDtBQU1sQixFQUFBLGNBQWMsRUFBRSxpQkFBSyxNQUFMLEVBQUssUUFBTCxFQUFLLE1BQUwsRUFBSyxTQUFMLEVBTkUsU0FNRixDQU5FO0FBT2xCLEVBQUEsd0JBQXdCLEVBQUUsaUJBQUssTUFBTCxFQUFLLFFBQUwsRUFQUixNQU9RLENBUFI7QUFRbEIsRUFBQSxnQkFBZ0IsRUFBRSxpQkFBSyxNQUFMLEVBQUssUUFBTCxFQVJBLE1BUUEsQ0FSQTtBQVNsQixFQUFBLGdCQUFnQixFQVRFLGtCQUFBO0FBVWxCLEVBQUEsd0JBQXdCLEVBVk4sa0JBQUE7QUFXbEIsRUFBQSxXQUFXLEVBQUUsaUJBQUssWUFBTCxFQUFLLFdBQUwsRUFBSyxVQUFMLEVBWEssVUFXTCxDQVhLO0FBWWxCLEVBQUEsUUFBUSxFQUFFLGlCQVpRLE9BWVIsQ0FaUTtBQWFsQixFQUFBLFFBQVEsRUFiVSxrQkFBQTtBQWVsQixFQUFBLGVBQWUsRUFBRSxpQkFmQyxPQWVELENBZkM7QUFnQmxCLEVBQUEsYUFBYSxFQUFFLGlCQUFLLE1BQUwsRUFBSyxRQUFMLEVBaEJHLE1BZ0JILENBaEJHO0FBaUJsQixFQUFBLGNBQWMsRUFqQkksa0JBQUE7QUFtQmxCLEVBQUEsYUFBYSxFQW5CSyxrQkFBQTtBQW9CbEIsRUFBQSxjQUFjLEVBcEJJLGtCQUFBO0FBcUJsQixFQUFBLGFBQWEsRUFyQkssa0JBQUE7QUFzQmxCLEVBQUEsV0FBVyxFQXRCTyxrQkFBQTtBQXVCbEIsRUFBQSxnQkFBZ0IsRUF2QkUsa0JBQUE7QUF5QmxCLEVBQUEsSUFBSSxFQUFFLGlCQXpCWSxPQXlCWixDQXpCWTtBQTBCbEIsRUFBQSxRQUFRLEVBQUUsaUJBQUssT0FBTDtBQTFCUSxDQUFwQjtlQWtDQSxXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdHVwbGUgfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCAqIGFzIEFTVCBmcm9tICcuLi90eXBlcy9ub2Rlcyc7XG5cbi8vIGVuc3VyZSBzdGF5cyBpbiBzeW5jIHdpdGggdHlwaW5nXG4vLyBQYXJlbnROb2RlIGFuZCBDaGlsZEtleSB0eXBlcyBhcmUgZGVyaXZlZCBmcm9tIFZpc2l0b3JLZXlzTWFwXG5jb25zdCB2aXNpdG9yS2V5cyA9IHtcbiAgUHJvZ3JhbTogdHVwbGUoJ2JvZHknKSxcbiAgVGVtcGxhdGU6IHR1cGxlKCdib2R5JyksXG4gIEJsb2NrOiB0dXBsZSgnYm9keScpLFxuXG4gIE11c3RhY2hlU3RhdGVtZW50OiB0dXBsZSgncGF0aCcsICdwYXJhbXMnLCAnaGFzaCcpLFxuICBCbG9ja1N0YXRlbWVudDogdHVwbGUoJ3BhdGgnLCAncGFyYW1zJywgJ2hhc2gnLCAncHJvZ3JhbScsICdpbnZlcnNlJyksXG4gIEVsZW1lbnRNb2RpZmllclN0YXRlbWVudDogdHVwbGUoJ3BhdGgnLCAncGFyYW1zJywgJ2hhc2gnKSxcbiAgUGFydGlhbFN0YXRlbWVudDogdHVwbGUoJ25hbWUnLCAncGFyYW1zJywgJ2hhc2gnKSxcbiAgQ29tbWVudFN0YXRlbWVudDogdHVwbGUoKSxcbiAgTXVzdGFjaGVDb21tZW50U3RhdGVtZW50OiB0dXBsZSgpLFxuICBFbGVtZW50Tm9kZTogdHVwbGUoJ2F0dHJpYnV0ZXMnLCAnbW9kaWZpZXJzJywgJ2NoaWxkcmVuJywgJ2NvbW1lbnRzJyksXG4gIEF0dHJOb2RlOiB0dXBsZSgndmFsdWUnKSxcbiAgVGV4dE5vZGU6IHR1cGxlKCksXG5cbiAgQ29uY2F0U3RhdGVtZW50OiB0dXBsZSgncGFydHMnKSxcbiAgU3ViRXhwcmVzc2lvbjogdHVwbGUoJ3BhdGgnLCAncGFyYW1zJywgJ2hhc2gnKSxcbiAgUGF0aEV4cHJlc3Npb246IHR1cGxlKCksXG5cbiAgU3RyaW5nTGl0ZXJhbDogdHVwbGUoKSxcbiAgQm9vbGVhbkxpdGVyYWw6IHR1cGxlKCksXG4gIE51bWJlckxpdGVyYWw6IHR1cGxlKCksXG4gIE51bGxMaXRlcmFsOiB0dXBsZSgpLFxuICBVbmRlZmluZWRMaXRlcmFsOiB0dXBsZSgpLFxuXG4gIEhhc2g6IHR1cGxlKCdwYWlycycpLFxuICBIYXNoUGFpcjogdHVwbGUoJ3ZhbHVlJyksXG59O1xuXG50eXBlIFZpc2l0b3JLZXlzTWFwID0gdHlwZW9mIHZpc2l0b3JLZXlzO1xuXG5leHBvcnQgdHlwZSBWaXNpdG9yS2V5cyA9IHsgW1AgaW4ga2V5b2YgVmlzaXRvcktleXNNYXBdOiBWaXNpdG9yS2V5c01hcFtQXVtudW1iZXJdIH07XG5leHBvcnQgdHlwZSBWaXNpdG9yS2V5PE4gZXh0ZW5kcyBBU1QuTm9kZT4gPSBWaXNpdG9yS2V5c1tOWyd0eXBlJ11dICYga2V5b2YgTjtcblxuZXhwb3J0IGRlZmF1bHQgdmlzaXRvcktleXM7XG4iXSwic291cmNlUm9vdCI6IiJ9