const formidable = require('formidable')
const jwt = require('jsonwebtoken')

function login(req, res) {
    var user = 'admin'
    var pwd = '123456'

    const form = formidable()
    form.parse(req, (err, fields) => {
        if (err) { console.log(err); return }

        if (req.headers.authorization) {
            // console.log(req.headers.authorization)
            jwt.verify(req.headers.authorization, '123456', (err, decode) => {
                if (err) {
                    res.statusCode = 401
                    res.end('登陆失败')
                }
                else {
                    res.statusCode = 200
                    res.end(JSON.stringify({ mes: '登陆成功', token: req.headers.authorization, user: decode.user }))
                }
            })
            return
        }

        if (fields.user == user && fields.pwd == pwd) {
            var token = jwt.sign({ 'user': user }, '123456', {
                expiresIn: 60 * 60 * 12
            })

            res.statusCode = 200
            res.end(JSON.stringify({ mes: '登陆成功', token: token, user: user }))
        }
        else {
            res.statusCode = 401
            res.end('登陆失败')
        }
    })
}

module.exports = {
    login
}