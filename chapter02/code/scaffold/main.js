#!/usr/bin/env node
const fs = require("fs")
const commander = require("commander");
const inquirer = require("inquirer");
const chalk = require("chalk");
const download = require("download-git-repo")
const ora = require("ora")

//项目模板
const url = "https://github.com/houyaowei/vue-dev-template.git"
const branch = "master"

commander.version(require('./package').version, '-v, --version')
  .description("初始化模板").action((name) => {
    if (fs.existsSync(name)) {
      chalk.red.bgRed.bold("project is exist")
      process.exit()
    }
    inquirer.prompt([
      {
        name: "description",
        message: "请输入项目描述"
      },
      {
        name: "author",
        message: "请输入作者名称"
      }
    ]).then(answers => {
      //
      download(url+ '#' + branch, name, err=> {
        const spinner = ora("正在下载模板...");
        spinner.start();

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
  commander.parse(process.argv);