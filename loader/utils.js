"use strict";

var t = require("babel-types");

var template = require("@babel/template");

var loaderUtils = require("loader-utils");

var _require = require("./constant"),
  typeMap = _require.typeMap;

var createCatchIdentifier = function createCatchIdentifier() {
  var catchIdentifier = t.identifier("catch");
  return catchIdentifier;
};

function createArguments(type) {
  var _ref = loaderUtils.getOptions(this) || {},
    needReturn = _ref.needReturn,
    consoleError = _ref.consoleError,
    customizeCatchCode = _ref.customizeCatchCode;

  var returnResult = needReturn && type && typeMap[type];
  var code = "";
  var returnStatement = null;

  if (returnResult) {
    code = "return ".concat(returnResult);
  }

  if (code) {
    returnStatement = template.statement(code)();
  }
  var consoleStatement =
    consoleError && template.statement("console.log(error)")();
  var customizeCatchCodeStatement =
    typeof customizeCatchCode === "string" &&
    template.statement(customizeCatchCode)();
  var blockStatementMap = [
    customizeCatchCodeStatement,
    consoleStatement,
    returnStatement,
  ].filter(Boolean);
  var blockStatement = t.blockStatement(blockStatementMap); // 创建ArrowFunctionExpression

  var ArrowFunctionExpression_1 = t.arrowFunctionExpression(
    [t.identifier("error")],
    blockStatement
  );
  return ArrowFunctionExpression_1;
}

module.exports = {
  createCatchIdentifier: createCatchIdentifier,
  createArguments: createArguments,
};