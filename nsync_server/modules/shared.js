const fse = require('fs-extra')
const formidable = require('formidable')
const path = require('path')

var fileIndex = fse.readJSONSync('./users/admin/shareRecord.json')  //读取分享文件

function shared(req, res) {   //写入分享文件
    const form = formidable()
    form.parse(req)

    var info = {}

    form.on('field', (name, value) => {
        info[name] = value
    })

    form.on('end', () => {
        fileIndex.shared.push(info)
        fse.writeJSONSync('./users/admin/shareRecord.json', fileIndex, { spaces: 2 })
        res.end('shared success')
    })

}

function readShare(req, res) {
    const form = formidable()
    form.parse(req)


    form.on('end', () => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(fileIndex, null, 2))
    })

}

function unShared() {

}

function getShared(req, res) {
    const form = formidable()
    form.parse(req)

    var info = {}

    form.on('field', (name, value) => {
        info[name] = value
    })

    form.on('end', () => {
        for (let i = 0; i < fileIndex.shared.length; i++) {
            if (info.s === fileIndex.shared[i].code) {
                // if (new Date().getTime > fileIndex.shared[i].expire_time) {
                //     res.end('分享的文件已过期')
                //     return
                // }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(fileIndex.shared[i], null, 2))
                return
            }
            else {
                res.end('未找到分享文件')
            }
        }
    })
}


module.exports = {
    shared, readShare, getShared
}
