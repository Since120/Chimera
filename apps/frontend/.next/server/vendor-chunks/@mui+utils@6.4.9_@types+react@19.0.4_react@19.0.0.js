"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@mui+utils@6.4.9_@types+react@19.0.4_react@19.0.0";
exports.ids = ["vendor-chunks/@mui+utils@6.4.9_@types+react@19.0.4_react@19.0.0"];
exports.modules = {

/***/ "(ssr)/../../node_modules/.pnpm/@mui+utils@6.4.9_@types+react@19.0.4_react@19.0.0/node_modules/@mui/utils/esm/exactProp/exactProp.js":
/*!*************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@mui+utils@6.4.9_@types+react@19.0.4_react@19.0.0/node_modules/@mui/utils/esm/exactProp/exactProp.js ***!
  \*************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ exactProp)\n/* harmony export */ });\n// This module is based on https://github.com/airbnb/prop-types-exact repository.\n// However, in order to reduce the number of dependencies and to remove some extra safe checks\n// the module was forked.\n\nconst specialProperty = 'exact-prop: \\u200b';\nfunction exactProp(propTypes) {\n  if (false) {}\n  return {\n    ...propTypes,\n    [specialProperty]: props => {\n      const unsupportedProps = Object.keys(props).filter(prop => !propTypes.hasOwnProperty(prop));\n      if (unsupportedProps.length > 0) {\n        return new Error(`The following props are not supported: ${unsupportedProps.map(prop => `\\`${prop}\\``).join(', ')}. Please remove them.`);\n      }\n      return null;\n    }\n  };\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BtdWkrdXRpbHNANi40LjlfQHR5cGVzK3JlYWN0QDE5LjAuNF9yZWFjdEAxOS4wLjAvbm9kZV9tb2R1bGVzL0BtdWkvdXRpbHMvZXNtL2V4YWN0UHJvcC9leGFjdFByb3AuanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTs7QUFFQTtBQUNlO0FBQ2YsTUFBTSxLQUFxQyxFQUFFLEVBRTFDO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1FQUFtRSxrQ0FBa0MsS0FBSyxnQkFBZ0I7QUFDMUg7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxpbmZvXFxEb2N1bWVudHNcXERpc2NvcmQgQm90XFxDaGltZXJhXFxub2RlX21vZHVsZXNcXC5wbnBtXFxAbXVpK3V0aWxzQDYuNC45X0B0eXBlcytyZWFjdEAxOS4wLjRfcmVhY3RAMTkuMC4wXFxub2RlX21vZHVsZXNcXEBtdWlcXHV0aWxzXFxlc21cXGV4YWN0UHJvcFxcZXhhY3RQcm9wLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFRoaXMgbW9kdWxlIGlzIGJhc2VkIG9uIGh0dHBzOi8vZ2l0aHViLmNvbS9haXJibmIvcHJvcC10eXBlcy1leGFjdCByZXBvc2l0b3J5LlxuLy8gSG93ZXZlciwgaW4gb3JkZXIgdG8gcmVkdWNlIHRoZSBudW1iZXIgb2YgZGVwZW5kZW5jaWVzIGFuZCB0byByZW1vdmUgc29tZSBleHRyYSBzYWZlIGNoZWNrc1xuLy8gdGhlIG1vZHVsZSB3YXMgZm9ya2VkLlxuXG5jb25zdCBzcGVjaWFsUHJvcGVydHkgPSAnZXhhY3QtcHJvcDogXFx1MjAwYic7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBleGFjdFByb3AocHJvcFR5cGVzKSB7XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgcmV0dXJuIHByb3BUeXBlcztcbiAgfVxuICByZXR1cm4ge1xuICAgIC4uLnByb3BUeXBlcyxcbiAgICBbc3BlY2lhbFByb3BlcnR5XTogcHJvcHMgPT4ge1xuICAgICAgY29uc3QgdW5zdXBwb3J0ZWRQcm9wcyA9IE9iamVjdC5rZXlzKHByb3BzKS5maWx0ZXIocHJvcCA9PiAhcHJvcFR5cGVzLmhhc093blByb3BlcnR5KHByb3ApKTtcbiAgICAgIGlmICh1bnN1cHBvcnRlZFByb3BzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFcnJvcihgVGhlIGZvbGxvd2luZyBwcm9wcyBhcmUgbm90IHN1cHBvcnRlZDogJHt1bnN1cHBvcnRlZFByb3BzLm1hcChwcm9wID0+IGBcXGAke3Byb3B9XFxgYCkuam9pbignLCAnKX0uIFBsZWFzZSByZW1vdmUgdGhlbS5gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcbn0iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/../../node_modules/.pnpm/@mui+utils@6.4.9_@types+react@19.0.4_react@19.0.0/node_modules/@mui/utils/esm/exactProp/exactProp.js\n");

/***/ })

};
;