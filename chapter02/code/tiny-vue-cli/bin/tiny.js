#!/usr/bin/env node
/**
 * npm link后，可以执行
 */
const program = require('commander')
const create = require('../core/create')

program
.version('0.0.1')
.command('create <name>')
.description('create a new project')
.action(name => { 
    create(name)
})

program.parse()