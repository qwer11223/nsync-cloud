import axios from '@/config'
const $axios = axios.axios

const render = function (url, args, callback) {
    var params = new URLSearchParams()
    Object.keys(args).forEach(key => {
        params.append(key, args[key])
        //console.log(key, args[key])
    })

    $axios.post(url, params).then(res => {
        if (callback) {
            callback(res.data)
        }
        // console.log(res.data)
    })
}

export default {
    render
}