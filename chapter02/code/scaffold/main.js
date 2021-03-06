#!/usr/bin/env node
const fs = require("fs")
const { program } = require('commander');
const handlebars = require("handlebars")
const inquirer = require("inquirer");
const chalk = require("chalk");
const download = require("download-git-repo")
const ora = require("ora")

//项目模板
const url = "direct:https://github.com/houyaowei/vue-dev-template.git"
const branch = "master"
// console.log(program.command)
program.version(require('./package').version, '-v, --version')
  .description("初始化模板").
  action((name) => {
    if (fs.existsSync(name)) {
      chalk.red.bgRed.bold("project is exist")
      process.exit()
    }
    inquirer.prompt([
      {
        name: "projName",
        message: "请输入项目名字"
      },
      {
        name: "description",
        message: "请输入项目描述"
      },
      {
        name: "author",
        message: "请输入作者名称"
      }
    ]).then(answers => {
      const spinner = ora("正在下载模板...");
      spinner.start(); 
      let name = answers.projName
      download(url+ '#' + branch, name, {clone: true}, err=> {
        if(!err){
          spinner.succeed();
          const meta = {
            name,
            description: answers.description,
            author: answers.author
          };
          const fileName = `${name}/package.json`;
          if (fs.existsSync(fileName)) {
            const content = fs.readFileSync(fileName).toString();
            const result = handlebars.compile(content)(meta);
            fs.writeFileSync(fileName, result);
          }
          console.log(chalk.green("项目初始化完成"));

        } else {
          spinner.fail();
          console.log(chalk.red(`拉取远程仓库失败${err}`));
        }
      })
    })
  })
  program.parse(process.argv);