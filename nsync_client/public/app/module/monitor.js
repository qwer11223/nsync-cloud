const chokidar = require('chokidar')
const axios = require('axios')
// const jsDiff = require('diff')
const _path = require('path')
const fs = require('fs')
const { downlaodURL } = require('./download')
const common = require('./common')

const serverApi = 'http://iwen.link:9000/api';
const server = 'http://iwen.link'

const watch = (path, userPath, windows) => {
    const watcher = chokidar.watch(path, { ignoreInitial: true })

    watcher
        .on('error', error => console.log(`Watcher error: ${error}`))
        .on('ready', async () => {
            //初始化同步服务器文件夹
            await axios.post(serverApi + '/search', { k: '.*' }).then(async res => {
                common.writeJson(common.creatFile(userPath, 'fileRecoder.json'), { "fileIndex": res.data })

                for (let i = 0; i < res.data.length; i++) {
                    await downlaodURL(`${server}/download/nsync_server${res.data[i].path.substring(1)}`, path)
                }
            })

            watcher
                .on('add', path => {
                    console.log(`File ${path} has been added`)

                    fs.readFile(path, (err, data) => {
                        if (err) throw err
                        windows.webContents.send('read-file', data, _path.basename(path))
                    })

                    //1.添加文件触发
                    //2.读取文件转为File对象
                    //3.发送到前端上传组件
                    //4.获取最新fileRecorder
                })
                .on('unlink', async (path) => {
                    console.log(`File ${path} has been removed`)

                    //1.删除文件触发
                    //2.查找fileRecorder文件path地址
                    console.log(`./users/admin/root/${_path.basename(path)}`)
                    axios.post(serverApi + '/deleted', { path: `./users/admin/root/${_path.basename(path)}` }).then(res => {
                        console.log(res.data)
                    })
                    //3.发送deleted请求
                    //4.获取最新fileRecorder

                })
                .on('addDir', path => console.log(`Directory ${path} has been added`))
                .on('unlinkDir', path => {
                    // console.log(`Directory ${path} has been removed`)
                    // console.log(`./users/admin/root/${_path.basename(path)}`)
                    // axios.post(serverApi + '/deleted', { path: `./users/admin/root/${_path.basename(path)}` }).then(res => {
                    //     console.log(res.data)
                    // })
                })
                .on('change', path => console.log(`File ${path} has been changed`))
        })


    return watcher
}

const close = (watcher) => {
    return watcher.close().then(() => console.log('closed'))
}

module.exports = { watch, close }

