import axios from '@/config'
const $axios = axios.axios
import store from '../store'

//文件分片大小
const CHUNK_SIZE = 1024 * 1024 * 100 //100mb


async function uploadFile(e, $route) {
    ////////拼接当前用户+页面路径////////
    let user = store.getters.getUser //从vuex获取用户名
    let _path = user + Object.keys($route.query).toString() + '/root' + '/' //拼接文件夹路径 例‘/admin/root/.../’

    ////////判断拖拽上传///////////
    var files = {}
    try {
        files = e.target.files
    } catch (err) {
        files = e
    }

    //移除size为0的文件
    let i = files.length - 1
    while (i >= 0) {
        if (files[i].size == 0)
            files.splice(i, 1)
        i--
    }
    if (files.length == 0) return -1;

    store.state.uploadList = []
    store.commit('showUpload') //展开上传列表

    for (let i = 0; i < files.length; i++) {
        let upFile = {
            name: files[i].name,
            size: files[i].size,
            progress: 0,
            chunkTotal: 0,
            currentChunk: 0,
            state: 'pending'
        }
        store.commit('setUploadList', upFile)   //添加到上传列表

    }

    for (let i = 0; i < files.length; i++) {
        await handleUpload(files[i], i, _path)
    }

    return new Promise(resolve => { resolve() })

}

///////////////文件分片/////////////////////

//切片上传
async function handleUpload(file, file_index, _path) {
    if (!file) return
    return new Promise(async resolve => {
        var uploadSuccess = 0  //上传成功数
        var chunkList = creatChunk(file)    //分片列表
        var chunkCount = chunkList.length   //分片数
        var hash = await calculateHash(chunkList, file_index)   //计算文件hash

        //设置uploadList
        store.state.uploadList[file_index].chunkTotal = chunkCount

        var success = new FormData();
        success.append('hash', hash);
        success.append('chunksize', CHUNK_SIZE);
        success.append('userpath', _path);
        success.append('storePath', file.webkitRelativePath === '' ? _path + file.name : file.webkitRelativePath);
        success.append('name', file.name);
        success.append('path', file.webkitRelativePath);
        success.append('size', file.size);
        success.append('time', file.lastModified);


        var data = chunkList.map(({ fileChunk }, index) => ({
            chunk: fileChunk,
            chunkhash: hash + '-' + index
        }))

        //构造分片FormData
        var requestList = data.map(({ chunk, chunkhash }) => {
            var formData = new FormData()
            formData.append('chunk', chunk) //文件分片blob
            formData.append('chunkhash', chunkhash) //文件hash+分片index
            formData.append('hash', hash)   //文件hash

            return { formData }
        })

        //上传分片FormData (<=10并发上传  >10顺序上传)
        if (requestList.length <= 10) {
            requestList.map(async ({ formData }, index) => {
                await $axios.post('/api/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: e => {
                        store.state.uploadList[file_index].progress = Math.ceil(e.loaded / e.total * 100)
                    }
                }).then(async (e) => {
                    uploadSuccess++
                    store.state.uploadList[file_index].currentChunk++
                    if (uploadSuccess == chunkCount) {
                        let state = await $axios.post('/api/merge', success)
                        if (state.data == 200)
                            store.state.uploadList[file_index].state = 'success'
                        resolve()
                    }
                })
            })
        }
        else {
            for (let i = 0; i < requestList.length; i++) {
                await $axios.post('/api/upload', requestList[i].formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: e => {
                        store.state.uploadList[file_index].progress = Math.ceil(e.loaded / e.total * 100)
                    }
                })
                uploadSuccess++
                store.state.uploadList[file_index].currentChunk++
                if (uploadSuccess == chunkCount) {
                    let state = await $axios.post('/api/merge', success)
                    if (state.data == 200)
                        store.state.uploadList[file_index].state = 'success'
                    resolve()
                }

            }
        }
    })

}

//创建分片
function creatChunk(file) {
    var fileChunkList = [] //单文件分片列表
    var chunkSize = CHUNK_SIZE //分片大小
    let current = 0
    while (current < file.size) {
        let chunk = file.slice(current, current + chunkSize)
        fileChunkList.push({ fileChunk: chunk })
        current += chunkSize
    }
    return fileChunkList
}

//计算文件hash
async function calculateHash(fileChunkList, file_index) {
    return new Promise((resolve, reject) => {
        var worker = new Worker('worker.js') //开启worker线程
        worker.postMessage(fileChunkList)   //发送分片列表到worker线程计算md5
        worker.addEventListener('message', e => {
            let { hash, chunkIndex } = e.data
            if (chunkIndex) {
                store.state.uploadList[file_index].chunkTotal = chunkIndex
            }
            if (hash)
                resolve(hash)
        })
    })
}




export default {
    uploadFile
}