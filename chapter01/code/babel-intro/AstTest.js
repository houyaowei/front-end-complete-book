let { parse } = require("@babel/parser");
let traverse = require("@babel/traverse").default;
let types = require('@babel/types');
let generate = require('@babel/generator').default;

let code = "let compare=(a,b)=> a > b"
// let code2 = "let compare=(a,b)=> {return a > b}" // error, 对下面的traverse需要适配

let ast = parse(code,{
  sourceType: "module"
});

traverse(ast, {
  ArrowFunctionExpression: (path, state) => {
    let node = path.node;
    let id = path.parent.id;
    let params = node.params;
    let body= types.blockStatement([
      types.returnStatement(node.body)
    ]);
    let functionExpression = types.functionExpression(id,params,body,false,false);
    path.replaceWith(functionExpression);
  }
})

let targetCode = generate(ast)
console.log(targetCode)
