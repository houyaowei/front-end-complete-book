var square = require("./moduleA");
console.log(square(4));

//test exports and module.exports
console.log(module.exports);
console.log(exports == module.exports);
console.log(module);
