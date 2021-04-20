let { parse } = require("@babel/parser");
let { default: traverse } = require("@babel/traverse");
let types = require('@babel/types');
let {default: generate} = require('@babel/generator');

let code = "let compare= (a,b)=> {" +
  "return a > b;" +
"}";

let ast = parse(code);

traverse(ast, {
  enter(path) {
    let node = path.node
    if(types.isBlockStatement(node)){
      let id = path.parent.id;
      let params = path.parent.params
      console.log(params)
      let func = types.functionExpression(id, params, node, false, false)
      console.log(node)
      path.replaceWith(func)
    }
    // let blockStatement = path.node.body
    // console.log("-------------")
    // console.log(blockStatement)
    // let id = path.parent.id;
    // let func = types.functionExpression(id, params, blockStatement, false, false)
    //     //替换节点
    // path.replaceWith(func)
      //将ArrowFunctionExpression  转化为  FunctionExpression ，传入不要的参数
      // let functionExpression = types.functionExpression(id,params,body,false,false);
      // path.replaceWith(functionExpression);
  },
});

let targetCode = generate(ast)
// console.log(targetCode)
