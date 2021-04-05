const readline = require('readline')
// 清空控制台
function clearConsole(title) {
    //TTY表示控制台
    if (process.stdout.isTTY) {
        const blank = '\n'.repeat(process.stdout.rows)
        readline.cursorTo(process.stdout, 0, 0)
        readline.clearScreenDown(process.stdout)
    }
}

module.exports = clearConsole