const formidable = require('formidable')
const config = require('../config/config')
const fse = require('fs-extra')
const path = require('path')

//上传临时目录
const UPLOAD_DIR = config.upload.uploadDir

function upload(req, res) {
    var count = 0   //文件计数
    //var savePath = ''
    const form = formidable({
        uploadDir: UPLOAD_DIR
    })
    form.parse(req, (err, fields, files) => {
        if (!err) {
            const chunk = files.chunk
            const hash = fields.hash
            const chunkhash = fields.chunkhash
            const chunkDir = path.resolve(UPLOAD_DIR, hash)

            //切片目录不存在，创建切片目录
            if (!fse.existsSync(chunkDir))
                fse.mkdirSync(chunkDir)

            fse.moveSync(chunk.path, `${chunkDir}/${chunkhash}`)
            count++
        }
        else console.log(err)
    })

    form.on('end', () => {
        console.log(`Recevied ${count} files`)
        res.setHeader('Content-Type', 'text/plain');
        res.end('Received ' + count + ' files')
    })
}

module.exports = {
    upload
}