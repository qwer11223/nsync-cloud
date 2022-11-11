const fse = require('fs-extra')
const request = require('request')
const path = require('path')

const downlaodURL = (url, localPath) => {
    let savePath = path.resolve(localPath, url.split('/root/')[1])
    if (!fse.existsSync(savePath)) {
        return new Promise((resolve, reject) => {
            // console.log(`${url} , ${localPath} , ${savePath}`)
            fse.ensureFileSync(savePath)
            let stream = fse.createWriteStream(savePath)
            request(encodeURI(url)).pipe(stream).on('close', err => {
                if (err) {
                    reject(err)
                }
                else {
                    console.log(url.split('/root/')[1] + ' downloaded')
                    resolve()
                }
            })
        })
    }
}

module.exports = { downlaodURL }