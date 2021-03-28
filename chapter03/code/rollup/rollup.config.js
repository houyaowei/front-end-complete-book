 import babel from "@rollup/plugin-babel";
import { eslint } from 'rollup-plugin-eslint';
import replace from "rollup-plugin-replace";
import { uglify } from "rollup-plugin-uglify";
import builtins from 'rollup-plugin-node-builtins';
import resolve from "@rollup/plugin-node-resolve";
import json from '@rollup/plugin-json';
import commonjs from "@rollup/plugin-commonjs";

module.exports={
  input: "src/scripts/main.js",
  output: {
    file: "dist/encrypt.min.js",
    format: "umd",
    name: "test",
    sourceMap: 'inline'
  },
  plugins: [
    json(),
    builtins(),
    resolve(),
    commonjs(),
    // eslint({
    //   include: ['src/**'],
    //   exclude: ['node_modules/**']
    // }),
    babel({
      exclude: 'node_modules/**',
    }),
    replace({
      ENV: JSON.stringify(process.env.NODE_ENV) // 查找ENV,并用NODE_ENV替换
    }),
    process.env.NODE_ENV === "production" && uglify()
  ]
}