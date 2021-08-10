const fs = require('fs-extra')
const path = require('path')

async function writeFiles(dir, files) {
    Object.keys(files).forEach(name => {
        //构造文件路径
        const _filePath = path.join(dir, name)
        fs.ensureDirSync(path.dirname(_filePath))
        fs.writeFileSync(_filePath, files[name])
    })
}
module.exports = writeFiles