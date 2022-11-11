const formidable = require('formidable')
const config = require('../config/config')
const fse = require('fs-extra')
const path = require('path')

//上传临时目录
const UPLOAD_DIR = config.upload.uploadDir

const merge = function (req, res) {
    const form = formidable()
    form.parse(req, (err, fields) => {
        if (fields) {
            var hash = fields.hash
            var filename = fields.name
            var chunksize = fields.chunksize
            var path = fields.path
            var userpath = fields.userpath

            if (path != '')
                filename = path

            fileFolder = `./users/${userpath}${filename}`.match(/.*\//)[0]

            if (!fse.existsSync(fileFolder))
                fse.ensureDirSync(fileFolder)

            mergeFileChunk(`./users/${userpath}${filename}`, hash, chunksize)

            res.end('200')
        }
    })

}


//合并分片
async function mergeFileChunk(filePath, hash, size) {
    const chunkDir = path.resolve(UPLOAD_DIR, hash)
    const chunkPaths = fse.readdirSync(chunkDir)

    chunkPaths.sort((a, b) => a.split('-')[1] - b.split('-')[1])    //分片排序


    await Promise.all(
        chunkPaths.map(async (chunkPath, index) => {
           await pipeStream(
                path.resolve(chunkDir, chunkPath),
                fse.createWriteStream(filePath, {
                    start: index * size,
                    end: (index + 1) * size
                }))
        })
    )

    fse.rmdirSync(chunkDir)
}

//管道流
function pipeStream(path, writeStream) {
    return new Promise(resolve => {
        const readStream = fse.createReadStream(path)
        readStream.pipe(writeStream)

        readStream.on('end', () => {
            fse.unlinkSync(path)
            resolve()
        })
    })
}


module.exports = {
    merge
}