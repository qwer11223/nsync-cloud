const fse = require('fs-extra')
const formidable = require('formidable')
const path = require('path')

const render = function (req, res) {
    var fileInfo = []
    const form = formidable()
    form.parse(req)
    form.once('field', (name, value) => {
        var _path = `./users/${value}`
        // console.log(_path)
        try {
            var files = fse.readdirSync(_path)

            for (let i = 0; i < files.length; i++) {
                let stat = fse.statSync(_path + files[i])
                let info = {
                    'name': files[i],
                    'size': stat.size,
                    'time': stat.ctimeMs,
                    'type': stat.isDirectory() ? 'folder' : path.extname(files[i]).split('.')[1],
                    'path': _path + files[i]
                }
                fileInfo.push(info)
            }
            // console.log(fileInfo)
        } catch (e) {
            console.log(e)
        }
    })
    form.on('end', () => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(fileInfo, null, 2))
        //console.log('done')
    })
}

module.exports = {
    render
}