"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@mui+x-internals@7.23.6_@types+react@19.0.4_react@19.0.0";
exports.ids = ["vendor-chunks/@mui+x-internals@7.23.6_@types+react@19.0.4_react@19.0.0"];
exports.modules = {

/***/ "(ssr)/../../node_modules/.pnpm/@mui+x-internals@7.23.6_@types+react@19.0.4_react@19.0.0/node_modules/@mui/x-internals/esm/warning/warning.js":
/*!**********************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@mui+x-internals@7.23.6_@types+react@19.0.4_react@19.0.0/node_modules/@mui/x-internals/esm/warning/warning.js ***!
  \**********************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   clearWarningsCache: () => (/* binding */ clearWarningsCache),\n/* harmony export */   warnOnce: () => (/* binding */ warnOnce)\n/* harmony export */ });\nconst warnedOnceCache = new Set();\n\n// TODO move to @base_ui/internals. Base UI, etc. need this helper.\nfunction warnOnce(message, gravity = 'warning') {\n  if (false) {}\n  const cleanMessage = Array.isArray(message) ? message.join('\\n') : message;\n  if (!warnedOnceCache.has(cleanMessage)) {\n    warnedOnceCache.add(cleanMessage);\n    if (gravity === 'error') {\n      console.error(cleanMessage);\n    } else {\n      console.warn(cleanMessage);\n    }\n  }\n}\nfunction clearWarningsCache() {\n  warnedOnceCache.clear();\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BtdWkreC1pbnRlcm5hbHNANy4yMy42X0B0eXBlcytyZWFjdEAxOS4wLjRfcmVhY3RAMTkuMC4wL25vZGVfbW9kdWxlcy9AbXVpL3gtaW50ZXJuYWxzL2VzbS93YXJuaW5nL3dhcm5pbmcuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7QUFFQTtBQUNPO0FBQ1AsTUFBTSxLQUFxQyxFQUFFLEVBRTFDO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQSIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxpbmZvXFxEb2N1bWVudHNcXERpc2NvcmQgQm90XFxDaGltZXJhXFxub2RlX21vZHVsZXNcXC5wbnBtXFxAbXVpK3gtaW50ZXJuYWxzQDcuMjMuNl9AdHlwZXMrcmVhY3RAMTkuMC40X3JlYWN0QDE5LjAuMFxcbm9kZV9tb2R1bGVzXFxAbXVpXFx4LWludGVybmFsc1xcZXNtXFx3YXJuaW5nXFx3YXJuaW5nLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHdhcm5lZE9uY2VDYWNoZSA9IG5ldyBTZXQoKTtcblxuLy8gVE9ETyBtb3ZlIHRvIEBiYXNlX3VpL2ludGVybmFscy4gQmFzZSBVSSwgZXRjLiBuZWVkIHRoaXMgaGVscGVyLlxuZXhwb3J0IGZ1bmN0aW9uIHdhcm5PbmNlKG1lc3NhZ2UsIGdyYXZpdHkgPSAnd2FybmluZycpIHtcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgY2xlYW5NZXNzYWdlID0gQXJyYXkuaXNBcnJheShtZXNzYWdlKSA/IG1lc3NhZ2Uuam9pbignXFxuJykgOiBtZXNzYWdlO1xuICBpZiAoIXdhcm5lZE9uY2VDYWNoZS5oYXMoY2xlYW5NZXNzYWdlKSkge1xuICAgIHdhcm5lZE9uY2VDYWNoZS5hZGQoY2xlYW5NZXNzYWdlKTtcbiAgICBpZiAoZ3Jhdml0eSA9PT0gJ2Vycm9yJykge1xuICAgICAgY29uc29sZS5lcnJvcihjbGVhbk1lc3NhZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oY2xlYW5NZXNzYWdlKTtcbiAgICB9XG4gIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBjbGVhcldhcm5pbmdzQ2FjaGUoKSB7XG4gIHdhcm5lZE9uY2VDYWNoZS5jbGVhcigpO1xufSJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/../../node_modules/.pnpm/@mui+x-internals@7.23.6_@types+react@19.0.4_react@19.0.0/node_modules/@mui/x-internals/esm/warning/warning.js\n");

/***/ })

};
;