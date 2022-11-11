importScripts('./spark-md5.min.js')

self.addEventListener('message', e => {
    const fileListChunk = e.data
    const spark = new self.SparkMD5.ArrayBuffer()
    let count = 0

    const loadNext = index => {
        const reader = new FileReader()
        reader.readAsArrayBuffer(fileListChunk[index].fileChunk)

        //读取文件进度
        reader.addEventListener('progress', e => {
            self.postMessage({
                // chunkRead: (e.loaded / e.total * 100),
                chunkIndex: index,
                hash: ''
            })
            console.log(`chunk ${index} 读取进度：${e.loaded / e.total * 100}`)
        })

        //文件加载完成
        reader.addEventListener('load', e => {
            count++
            spark.append(e.target.result)
            if (count === fileListChunk.length) {
                console.log('正在计算文件md5...')
                self.postMessage({
                    hash: spark.end()
                })
                console.log('计算完成')
                self.close()    //关闭worker线程
            }
            loadNext(count)
        })
    }
    loadNext(0)
})