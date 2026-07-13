const upstreamTransformer = require("@expo/metro-config/babel-transformer");
const linguiTransformer = require("@lingui/metro-transformer/expo");

module.exports.transform = function (params) {
  if (params.filename.endsWith(".po")) {
    return linguiTransformer.transform(params);
  }
  return upstreamTransformer.transform(params);
};
