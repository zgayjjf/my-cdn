var path = require('path')
// var request = require('request')
var Router = require('koa-router')
var lodash = require('lodash')
var config = require('config')
var http = require('./http')
var fsp = require('./fs-p')
var helpers = require('./helpers')
var router = new Router()
var npmTempDir = './npm-temp'


router.get('/list', async function (ctx) {
    ctx.body = {name:'jeff'}
})

router.get('/npm/:packageName/', async function (ctx) {
    var info = await http.get(ctx.params.packageName)

    ctx.body = info
})

router.get('/npm/:packageName/versions', async function (ctx) {
    var info = await http.get(ctx.params.packageName)
    var versions = lodash.reduce(info.versions, function (arr, version) {
        arr.push({
            version:version.version,
            url: `http://${ctx.req.headers.host}npm/${packageName}/${version.version}`
        })
        return arr
    }, [])

    ctx.body = versions
})

router.get('/npm/:packageName/:version', async function (ctx) {
    var {packageName, version} = ctx.params
    var packagePath = path.resolve(config.npmTempDir, packageName, version)
    var stat = await fsp.stat(packagePath)
    
    if (!stat) {
        packagePath = await helpers.download(packageName, version)
    }
    var fileList = await helpers.ls(packagePath)

    ctx.body = fileList
})

module.exports = router