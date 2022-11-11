const fse = require('fs-extra')
const formidable = require('formidable')
const path = require('path')
const archiver = require('archiver')

function download(req, res) {
    var downList = []

    const form = formidable()   //解析req
    form.parse(req)

    form.on('field', (name, value) => {
        downList.push(value)    //添加到下载列表
    })

    form.on('end', () => {

        console.log(downList)

        if (downList.length === 1 && fse.statSync(downList[0]).isFile()) {  //单个文件&&非文件夹
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream', //二进制文件  
                'Content-Disposition': 'attachment; filename=' + encodeURIComponent(path.basename(downList[0])), //下载的文件  
            });

            let readStream = fse.createReadStream(downList[0])
            readStream.pipe(res)

            readStream.on('end', () => {
                res.end()
            })
        }
        else {
            var zipname = path.basename(downList[0]) + '.zip'   //压缩包名
            var zippath = downList[0].match(/(.*\/)root/)[1] + 'tmp/'   //例 ./users/admin/tmp/
            var output = fse.createWriteStream(zippath + zipname)  //创建可写流
            var archive = archiver('zip', {
                zlib: { level: 9 }
            })

            output.on('close', () => {
                console.log('文件归档完成')

                res.writeHead(200, {
                    'Content-Type': 'application/octet-stream', //告诉浏览器这是一个二进制文件  
                    'Content-Disposition': 'attachment; filename=' + encodeURIComponent(zipname), //告诉浏览器这是一个需要下载的文件  
                });

                let readStream = fse.createReadStream(zippath + zipname)
                readStream.pipe(res)

                readStream.on('end', () => {
                    res.end('压缩完成')
                    fse.removeSync(zippath + zipname)
                })
            })

            output.on('end', () => {
                console.log('operation end')
            })

            archive.on('error', (err) => {
                console.log(err)
            })

            archive.pipe(output)

            for (var i = 0; i < downList.length; i++) {
                let stat = fse.statSync(downList[i])
                if (stat.isDirectory())
                    archive.directory(downList[i], downList[i].match(/.*\/(.*)$/)[1])
                else
                    archive.file(downList[i], { name: path.basename(downList[i]) })
            }

            archive.finalize()
        }
    })

}

module.exports = {
    download
}