let { parse } = require("@babel/parser");
let  {default:traverse} = require("@babel/traverse") ;
let {default: generate} = require('@babel/generator');

const code = `function square(n) {
  return n * n;
}`;

const ast = parse(code);

//方法一
// traverse(ast, {
//   enter(path) {
//     if (path.isIdentifier({ name: "n" })) {
//       path.node.name = "multiple";
//     }
//   },
// });
//方法二：
traverse(ast, {
  FunctionDeclaration: function(path) {
    path.node.id.name = "multiple";
  }
})

let targetCode = generate(ast)
console.log(targetCode)