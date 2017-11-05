let Koa = require('koa')
let Body = require('koa-body')
let router = require('./routers/index')
let config = require('config')

let server = new Koa()

server.use(Body())
server.use(router.routes())

server.listen(config.get('port'), function () {
    console.log(config.port)
})

// process.on('uncaughtException', function (err) {
//     console.log(err)
// })