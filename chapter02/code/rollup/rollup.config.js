import babel from "rollup-plugin-babel"; //
import { eslint } from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve'; //配合resolve包使用
import commonjs from 'rollup-plugin-commonjs'; //将 commonjs 模块转成 es6 模块
import replace from "rollup-plugin-replace";
import { uglify } from "rollup-plugin-uglify";

module.exports={
  input: "src/scripts/main.js",
  output: {
    file: "dist/main.prod.js",
    format: "umd",
    name: "test",
    sourceMap: 'inline'
  },
  plugins: [
    resolve({
      jsnext: true,  //node ->ES6
      main: true,
      browser: true,
    }),
    commonjs(),
    eslint({
      include: ['src/**'],
      exclude: ['node_modules/**']
    }),
    babel({
      exclude: 'node_modules/**',
    }),
    replace({
      ENV: JSON.stringify(process.env.NODE_ENV) // 查找ENV,并用NODE_ENV替换
    }),
    process.env.NODE_ENV === "production" && uglify()
  ]
}