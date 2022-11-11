const mime = require('../config/mime')
const config = require('../config/config')
const fs = require('fs')

//自动打开浏览器
const openDefaultBrowser = function (url) {
    if (config.server.open_browser) {
        var exec = require('child_process').exec
        try {
            switch (process.platform) {
                case 'darwin':
                    exec(`open ${url}`);
                    break;
                case 'win32':
                    exec(`start ${url}`);
                    break;
                default:
                    exec(`open ${url}`);
            }
        }
        catch (e) {
            console.log(e)
        }
    }
}

//返回静态资源
const returnStatic = function (response, basePath, url) {

    var extName = url.match(/^.*(\..*)$/i) //匹配文件扩展名
    if (extName) extName = extName[1]

    var html = `<h1>Index of ${url}</h1><ul>`
    fs.readdir(`${basePath}${url}`, (err, data) => {
        if (err) {
            fs.readFile(`${basePath}${url}`, (err, data) => {
                if (err)
                    response.end('Read file error!')
                else {
                    if (extName && mime.hasOwnProperty(extName)) {
                        response.setHeader('Content-Type', mime[extName])   //设置文件mime类型
                        // console.log(mime[extName])
                    }

                    response.end(data)
                }

            })
        }
        else {
            for (var i = 0; i < data.length; i++) {
                if (url === '/')
                    html += `<li><a href="${data[i]}">${data[i]}</a></li>`
                else
                    html += `<li><a href="${url}/${data[i]}">${data[i]}</a></li>`
            }

            response.setHeader('Content-Type', 'text/html')
            response.end(html + '</ul>')
        }
    })
}

module.exports = {
    openDefaultBrowser, returnStatic
}