const fse = require('fs-extra')
const path = require('path')

const creatFile = (_path, fileName) => {
    fse.ensureFileSync(path.resolve(_path, fileName))

    return path.resolve(_path, fileName)
}

const writeJson = (filePath, jsonObj) => {
    fse.writeJSONSync(filePath, jsonObj, { spaces: 2 })
}

//读取json文件
function readItem(jsonFile) {
    let json = fse.readJSONSync(jsonFile)

    return json
}

//搜索json
// json文件，文件对象，对比字段，查询值
function findItem(jsonFile, _key, field, query) {
    let items = readItem(jsonFile)[_key]

    for (let i = 0; i < items.length; i++) {
        if (items[i][field] === query)
            return { index: i, info: items[i] }
    }

    return -1
}


module.exports = {
    creatFile, writeJson, readItem, findItem
}