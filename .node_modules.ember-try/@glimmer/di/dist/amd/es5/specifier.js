define('@glimmer/di/specifier', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.isSpecifierStringAbsolute = isSpecifierStringAbsolute;
    exports.isSpecifierObjectAbsolute = isSpecifierObjectAbsolute;
    exports.serializeSpecifier = serializeSpecifier;
    exports.serializeSpecifierPath = serializeSpecifierPath;
    exports.deserializeSpecifier = deserializeSpecifier;
    function isSpecifierStringAbsolute(specifier) {
        var _specifier$split = specifier.split(':'),
            type = _specifier$split[0],
            path = _specifier$split[1];

        return !!(type && path && path.indexOf('/') === 0 && path.split('/').length > 3);
    }
    function isSpecifierObjectAbsolute(specifier) {
        return specifier.rootName !== undefined && specifier.collection !== undefined && specifier.name !== undefined && specifier.type !== undefined;
    }
    function serializeSpecifier(specifier) {
        var type = specifier.type;
        var path = serializeSpecifierPath(specifier);
        if (path) {
            return type + ':' + path;
        } else {
            return type;
        }
    }
    function serializeSpecifierPath(specifier) {
        var path = [];
        if (specifier.rootName) {
            path.push(specifier.rootName);
        }
        if (specifier.collection) {
            path.push(specifier.collection);
        }
        if (specifier.namespace) {
            path.push(specifier.namespace);
        }
        if (specifier.name) {
            path.push(specifier.name);
        }
        if (path.length > 0) {
            var fullPath = path.join('/');
            if (isSpecifierObjectAbsolute(specifier)) {
                fullPath = '/' + fullPath;
            }
            return fullPath;
        }
    }
    function deserializeSpecifier(specifier) {
        var obj = {};
        if (specifier.indexOf(':') > -1) {
            var _specifier$split2 = specifier.split(':'),
                type = _specifier$split2[0],
                path = _specifier$split2[1];

            obj.type = type;
            var pathSegments = void 0;
            if (path.indexOf('/') === 0) {
                pathSegments = path.substr(1).split('/');
                obj.rootName = pathSegments.shift();
                obj.collection = pathSegments.shift();
            } else {
                pathSegments = path.split('/');
            }
            if (pathSegments.length > 0) {
                obj.name = pathSegments.pop();
                if (pathSegments.length > 0) {
                    obj.namespace = pathSegments.join('/');
                }
            }
        } else {
            obj.type = specifier;
        }
        return obj;
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlY2lmaWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3JjL3NwZWNpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozt1Q0FRMEMsQUFBaUIsV0FDekQsQUFBSTsrQkFBZSxBQUFTLFVBQUMsQUFBSyxNQUFDLEFBQUcsQUFBQyxBQUFDO1lBQW5DLEFBQUk7WUFBRSxBQUFJLEFBQUMsd0JBQ2hCLEFBQU07O2VBQUMsQ0FBQyxBQUFDLEVBQUMsQUFBSSxRQUFJLEFBQUksUUFBSSxBQUFJLEtBQUMsQUFBTyxRQUFDLEFBQUcsQUFBQyxTQUFLLEFBQUMsS0FBSSxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQUcsQUFBQyxLQUFDLEFBQU0sU0FBRyxBQUFDLEFBQUMsQUFBQyxBQUNuRixBQUFDO0FBRUQsQUFBTTt1Q0FBb0MsQUFBb0IsV0FDNUQsQUFBTTtlQUFDLEFBQVMsVUFBQyxBQUFRLGFBQUssQUFBUyxhQUNoQyxBQUFTLFVBQUMsQUFBVSxlQUFLLEFBQVMsYUFDbEMsQUFBUyxVQUFDLEFBQUksU0FBSyxBQUFTLGFBQzVCLEFBQVMsVUFBQyxBQUFJLFNBQUssQUFBUyxBQUFDLEFBQ3RDLEFBQUM7QUFFRCxBQUFNO2dDQUE2QixBQUFvQixXQUNyRDtZQUFJLEFBQUksT0FBRyxBQUFTLFVBQUMsQUFBSSxBQUFDLEFBQzFCO1lBQUksQUFBSSxPQUFHLEFBQXNCLHVCQUFDLEFBQVMsQUFBQyxBQUFDLEFBRTdDLEFBQUUsQUFBQztZQUFDLEFBQUksQUFBQyxNQUFDLEFBQUMsQUFDVCxBQUFNO21CQUFDLEFBQUksT0FBRyxBQUFHLE1BQUcsQUFBSSxBQUFDLEFBQzNCLEFBQUMsQUFBQyxBQUFJO2VBQUMsQUFBQyxBQUNOLEFBQU07bUJBQUMsQUFBSSxBQUFDLEFBQ2QsQUFBQyxBQUNIO0FBQUM7QUFFRCxBQUFNO29DQUFpQyxBQUFvQixXQUN6RDtZQUFJLEFBQUksT0FBRyxBQUFFLEFBQUMsQUFDZCxBQUFFLEFBQUM7WUFBQyxBQUFTLFVBQUMsQUFBUSxBQUFDLFVBQUMsQUFBQyxBQUN2QixBQUFJO2lCQUFDLEFBQUksS0FBQyxBQUFTLFVBQUMsQUFBUSxBQUFDLEFBQUMsQUFDaEMsQUFBQztBQUNELEFBQUUsQUFBQztZQUFDLEFBQVMsVUFBQyxBQUFVLEFBQUMsWUFBQyxBQUFDLEFBQ3pCLEFBQUk7aUJBQUMsQUFBSSxLQUFDLEFBQVMsVUFBQyxBQUFVLEFBQUMsQUFBQyxBQUNsQyxBQUFDO0FBQ0QsQUFBRSxBQUFDO1lBQUMsQUFBUyxVQUFDLEFBQVMsQUFBQyxXQUFDLEFBQUMsQUFDeEIsQUFBSTtpQkFBQyxBQUFJLEtBQUMsQUFBUyxVQUFDLEFBQVMsQUFBQyxBQUFDLEFBQ2pDLEFBQUM7QUFDRCxBQUFFLEFBQUM7WUFBQyxBQUFTLFVBQUMsQUFBSSxBQUFDLE1BQUMsQUFBQyxBQUNuQixBQUFJO2lCQUFDLEFBQUksS0FBQyxBQUFTLFVBQUMsQUFBSSxBQUFDLEFBQUMsQUFDNUIsQUFBQztBQUVELEFBQUUsQUFBQztZQUFDLEFBQUksS0FBQyxBQUFNLFNBQUcsQUFBQyxBQUFDLEdBQUMsQUFBQyxBQUNwQjtnQkFBSSxBQUFRLFdBQUcsQUFBSSxLQUFDLEFBQUksS0FBQyxBQUFHLEFBQUMsQUFBQyxBQUM5QixBQUFFLEFBQUM7Z0JBQUMsQUFBeUIsMEJBQUMsQUFBUyxBQUFDLEFBQUMsWUFBQyxBQUFDLEFBQ3pDLEFBQVE7MkJBQUcsQUFBRyxNQUFHLEFBQVEsQUFBQyxBQUM1QixBQUFDO0FBQ0QsQUFBTTttQkFBQyxBQUFRLEFBQUMsQUFDbEIsQUFBQyxBQUNIO0FBQUM7QUFFRCxBQUFNO2tDQUErQixBQUFpQixXQUNwRDtZQUFJLEFBQUcsTUFBYyxBQUFFLEFBQUMsQUFFeEIsQUFBRSxBQUFDO1lBQUMsQUFBUyxVQUFDLEFBQU8sUUFBQyxBQUFHLEFBQUMsT0FBRyxDQUFDLEFBQUMsQUFBQyxHQUFDLEFBQUMsQUFDaEMsQUFBSTtvQ0FBZSxBQUFTLFVBQUMsQUFBSyxNQUFDLEFBQUcsQUFBQyxBQUFDO2dCQUFuQyxBQUFJO2dCQUFFLEFBQUksQUFBQyx5QkFDaEIsQUFBRzs7Z0JBQUMsQUFBSSxPQUFHLEFBQUksQUFBQyxBQUVoQjtnQkFBSSxBQUFZLEFBQUMsb0JBRWpCLEFBQUUsQUFBQztnQkFBQyxBQUFJLEtBQUMsQUFBTyxRQUFDLEFBQUcsQUFBQyxTQUFLLEFBQUMsQUFBQyxHQUFDLEFBQUMsQUFDNUIsQUFBWTsrQkFBRyxBQUFJLEtBQUMsQUFBTSxPQUFDLEFBQUMsQUFBQyxHQUFDLEFBQUssTUFBQyxBQUFHLEFBQUMsQUFBQyxBQUN6QyxBQUFHO29CQUFDLEFBQVEsV0FBRyxBQUFZLGFBQUMsQUFBSyxBQUFFLEFBQUMsQUFDcEMsQUFBRztvQkFBQyxBQUFVLGFBQUcsQUFBWSxhQUFDLEFBQUssQUFBRSxBQUFDLEFBQ3hDLEFBQUMsQUFBQyxBQUFJO21CQUFDLEFBQUMsQUFDTixBQUFZOytCQUFHLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBRyxBQUFDLEFBQUMsQUFDakMsQUFBQztBQUVELEFBQUUsQUFBQztnQkFBQyxBQUFZLGFBQUMsQUFBTSxTQUFHLEFBQUMsQUFBQyxHQUFDLEFBQUMsQUFDNUIsQUFBRztvQkFBQyxBQUFJLE9BQUcsQUFBWSxhQUFDLEFBQUcsQUFBRSxBQUFDLEFBRTlCLEFBQUUsQUFBQztvQkFBQyxBQUFZLGFBQUMsQUFBTSxTQUFHLEFBQUMsQUFBQyxHQUFDLEFBQUMsQUFDNUIsQUFBRzt3QkFBQyxBQUFTLFlBQUcsQUFBWSxhQUFDLEFBQUksS0FBQyxBQUFHLEFBQUMsQUFBQyxBQUN6QyxBQUFDLEFBQ0g7QUFBQyxBQUVIO0FBQUMsQUFBQyxBQUFJO2VBQUMsQUFBQyxBQUNOLEFBQUc7Z0JBQUMsQUFBSSxPQUFHLEFBQVMsQUFBQyxBQUN2QixBQUFDO0FBRUQsQUFBTTtlQUFDLEFBQUcsQUFBQyxBQUNiLEFBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgaW50ZXJmYWNlIFNwZWNpZmllciB7XG4gIHJvb3ROYW1lPzogc3RyaW5nO1xuICBjb2xsZWN0aW9uPzogc3RyaW5nO1xuICBuYW1lc3BhY2U/OiBzdHJpbmc7XG4gIG5hbWU/OiBzdHJpbmc7XG4gIHR5cGU/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1NwZWNpZmllclN0cmluZ0Fic29sdXRlKHNwZWNpZmllcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGxldCBbdHlwZSwgcGF0aF0gPSBzcGVjaWZpZXIuc3BsaXQoJzonKTtcbiAgcmV0dXJuICEhKHR5cGUgJiYgcGF0aCAmJiBwYXRoLmluZGV4T2YoJy8nKSA9PT0gMCAmJiBwYXRoLnNwbGl0KCcvJykubGVuZ3RoID4gMyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1NwZWNpZmllck9iamVjdEFic29sdXRlKHNwZWNpZmllcjogU3BlY2lmaWVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBzcGVjaWZpZXIucm9vdE5hbWUgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgc3BlY2lmaWVyLmNvbGxlY3Rpb24gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgc3BlY2lmaWVyLm5hbWUgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgc3BlY2lmaWVyLnR5cGUgIT09IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZVNwZWNpZmllcihzcGVjaWZpZXI6IFNwZWNpZmllcik6IHN0cmluZyB7XG4gIGxldCB0eXBlID0gc3BlY2lmaWVyLnR5cGU7XG4gIGxldCBwYXRoID0gc2VyaWFsaXplU3BlY2lmaWVyUGF0aChzcGVjaWZpZXIpO1xuXG4gIGlmIChwYXRoKSB7XG4gICAgcmV0dXJuIHR5cGUgKyAnOicgKyBwYXRoO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0eXBlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVTcGVjaWZpZXJQYXRoKHNwZWNpZmllcjogU3BlY2lmaWVyKTogc3RyaW5nIHtcbiAgbGV0IHBhdGggPSBbXTtcbiAgaWYgKHNwZWNpZmllci5yb290TmFtZSkge1xuICAgIHBhdGgucHVzaChzcGVjaWZpZXIucm9vdE5hbWUpO1xuICB9XG4gIGlmIChzcGVjaWZpZXIuY29sbGVjdGlvbikge1xuICAgIHBhdGgucHVzaChzcGVjaWZpZXIuY29sbGVjdGlvbik7XG4gIH1cbiAgaWYgKHNwZWNpZmllci5uYW1lc3BhY2UpIHtcbiAgICBwYXRoLnB1c2goc3BlY2lmaWVyLm5hbWVzcGFjZSk7XG4gIH1cbiAgaWYgKHNwZWNpZmllci5uYW1lKSB7XG4gICAgcGF0aC5wdXNoKHNwZWNpZmllci5uYW1lKTtcbiAgfVxuXG4gIGlmIChwYXRoLmxlbmd0aCA+IDApIHtcbiAgICBsZXQgZnVsbFBhdGggPSBwYXRoLmpvaW4oJy8nKTtcbiAgICBpZiAoaXNTcGVjaWZpZXJPYmplY3RBYnNvbHV0ZShzcGVjaWZpZXIpKSB7XG4gICAgICBmdWxsUGF0aCA9ICcvJyArIGZ1bGxQYXRoO1xuICAgIH1cbiAgICByZXR1cm4gZnVsbFBhdGg7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlc2VyaWFsaXplU3BlY2lmaWVyKHNwZWNpZmllcjogc3RyaW5nKTogU3BlY2lmaWVyIHtcbiAgbGV0IG9iajogU3BlY2lmaWVyID0ge307XG5cbiAgaWYgKHNwZWNpZmllci5pbmRleE9mKCc6JykgPiAtMSkge1xuICAgIGxldCBbdHlwZSwgcGF0aF0gPSBzcGVjaWZpZXIuc3BsaXQoJzonKTtcbiAgICBvYmoudHlwZSA9IHR5cGU7XG5cbiAgICBsZXQgcGF0aFNlZ21lbnRzO1xuXG4gICAgaWYgKHBhdGguaW5kZXhPZignLycpID09PSAwKSB7XG4gICAgICBwYXRoU2VnbWVudHMgPSBwYXRoLnN1YnN0cigxKS5zcGxpdCgnLycpO1xuICAgICAgb2JqLnJvb3ROYW1lID0gcGF0aFNlZ21lbnRzLnNoaWZ0KCk7XG4gICAgICBvYmouY29sbGVjdGlvbiA9IHBhdGhTZWdtZW50cy5zaGlmdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXRoU2VnbWVudHMgPSBwYXRoLnNwbGl0KCcvJyk7XG4gICAgfVxuXG4gICAgaWYgKHBhdGhTZWdtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICBvYmoubmFtZSA9IHBhdGhTZWdtZW50cy5wb3AoKTtcblxuICAgICAgaWYgKHBhdGhTZWdtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIG9iai5uYW1lc3BhY2UgPSBwYXRoU2VnbWVudHMuam9pbignLycpO1xuICAgICAgfVxuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIG9iai50eXBlID0gc3BlY2lmaWVyO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cbiJdfQ==