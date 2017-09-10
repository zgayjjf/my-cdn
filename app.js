let Koa = require('koa')
let router = require('./router')
let config = require('config')

let server = new Koa()

server.use(router.routes())

server.listen(config.get('port'), function () {
    console.log(config.port, 5)
})

process.on('uncaughtException', function (err) {
    console.log(err)
})