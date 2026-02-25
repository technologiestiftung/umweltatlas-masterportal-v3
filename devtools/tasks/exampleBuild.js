const buildFunctions = require("./buildFunctions");

global.exampleCopy = true;

console.warn("build Basic Portal");
buildFunctions({
    portalPath: "portal"
});
