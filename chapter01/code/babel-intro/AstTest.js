let { parse } = require("@babel/parser");
let {default: generate} = require('@babel/generator');

let code = "let compare= (a,b)=> {" +
  "return a > b;" +
"}";

let ast = parse(code);
console.log(ast)

let targetCode = generate(ast)
console.log(targetCode)
