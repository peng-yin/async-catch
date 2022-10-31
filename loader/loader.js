'use strict';

var traverse = require("babel-traverse")["default"];

var babel = require("@babel/core");

var t = require("babel-types");

var parser = require("@babel/parser");

var _require = require("./utils.js"),
    createCatchIdentifier = _require.createCatchIdentifier,
    createArguments = _require.createArguments;

module.exports = function (source) {
  var self = this;
  var ast = parser.parse(source, {
    sourceType: "module",
    plugins: ["dynamicImport", "jsx"]
  });
  var awaitMap = [];

  var pathChange = function pathChange(path) {
    if (!awaitMap.length) return path.skip();
    awaitMap.forEach(function (item, index) {
      if (item === path.node) {
        var callee = path.node.callee;
        var returnType = path.node.returnType;
        if (t.isMemberExpression(callee)) return;
        var MemberExpression = t.memberExpression(item, createCatchIdentifier());
        var createArgumentsSelf = createArguments.bind(self);
        var ArrowFunctionExpression_1 = createArgumentsSelf(returnType);
        var CallExpression = t.callExpression(MemberExpression, [ArrowFunctionExpression_1]);
        path.replaceWith(CallExpression);
        awaitMap[index] = null;
      }
    });
  };

  var options = {
    AwaitExpression: function AwaitExpression(path) {
      var tryCatchPath = path.findParent(function (p) {
        return t.isTryStatement(p);
      });
      if (tryCatchPath) return path.skip();
      var leftId = path.parent.id;

      if (leftId) {
        var type = leftId.type;
        path.node.argument.returnType = type;
      }

      awaitMap.push(path.node.argument);
    }
  };
  options.CallExpression = pathChange;
  options.Identifier = pathChange;
  traverse(ast, options);

  var _babel$transformFromA = babel.transformFromAstSync(ast, null, {
    configFile: false
  }),
      code = _babel$transformFromA.code;

  return code;
};