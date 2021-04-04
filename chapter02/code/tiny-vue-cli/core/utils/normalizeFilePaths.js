const slash = require('slash')

// 用于转换 Windows 反斜杠路径转换为正斜杠路径 \ => /
function normalizeFilePaths(files) {
    Object.keys(files).forEach(file => {
        const normalized = slash(file)
        if (file !== normalized) {
            files[normalized] = files[file]
            delete files[file]
        }
    })
    
    return files
}
module.exports = normalizeFilePaths