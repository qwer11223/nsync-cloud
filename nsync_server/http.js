const http = require('http')
const config = require('./config/config')
const { returnStatic, openDefaultBrowser, showFileList } = require('./modules/http_ext')
const { upload } = require('./modules/upload')
const { render } = require('./modules/renderList')
const { merge } = require('./modules/mergeChunk')
const { login } = require('./modules/verification')
const { download } = require('./modules/download')
const { moveTrash, recover, crush } = require('./modules/recycle')
const { shared, readShare,getShared } = require('./modules/shared')

///////////变量配置/////////

const server = http.createServer()

var host = config.server.host
var port = config.server.port


////////监听端口/////////

server.listen(port, host, () => {
    console.log(`The service is running at http://${host}:${port}`)
    // openDefaultBrowser(`http://${host}:${port}`)
    openDefaultBrowser('http://127.0.0.1:8080')
})


///////响应请求////////

server.on('request', (request, response) => {
    ////////CORS/////////
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader("Access-Control-Allow-Headers", "*");
    response.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    response.setHeader("Access-Control-Expose-Headers", '*')

    /////解析URL////
    var url = decodeURI(request.url)

    if (config.server.console_urlPath) console.log(url)  //终端显示请求信息
    // if (request.url.split('/')[0] != 'api')
    //returnStatic(response, config.server.base_path, url)    //显示服务器内文件列表

    /////return OPTIONS request////
    if (request.method == 'OPTIONS') {
        response.statusCode = 200
        response.end()
        return
    }

    ////////router///////
    if (request.url === '/api/download') download(request, response) //下载文件
    if (request.url === '/api/upload') upload(request, response)    //处理上传请求
    if (request.url === '/api/list') render(request, response)  //返回文件列表
    if (request.url === '/api/merge') merge(request, response)    //合并分片
    if (request.url === '/api/login') login(request, response)    //合并分片
    if (request.url === '/api/del') moveTrash(request, response)    //删除文件
    if (request.url === '/api/recover') recover(request, response)  //恢复文件
    if (request.url === '/api/crush') crush(request, response)  //粉碎文件
    if (request.url === '/api/shared') shared(request, response)    //分享文件
    if (request.url === '/api/readshared') readShare(request, response) //返回分享文件列表
    if (request.url === '/api/getshared') getShared(request, response) //读取分享文件


})

