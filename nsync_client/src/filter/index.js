const timeFilter = function (time) {
    var d = new Date(Math.floor(parseInt(time)))
    var year = d.getFullYear()
    var month = d.getMonth()+1 
    var date = d.getDate()
    var hour = d.getHours()
    var minute = d.getMinutes()
    var second = d.getSeconds()
    return (`${year}-${month}-${date} ${hour}:${minute}:${second}`)
}

const byteFilter = function (bytes) {
    if (bytes === 0) return '0 B';
    var k = 1024
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    var i = Math.floor(Math.log(bytes) / Math.log(k));

    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

export {
    timeFilter, byteFilter
}
