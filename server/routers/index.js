var path = require('path')
// var request = require('request')
var Router = require('koa-router')
var lodash = require('lodash')
var config = require('config')
var http = require('../modules/http')
var fsp = require('../modules/fs-p')
var helpers = require('../helpers')
var router = new Router()
var npmTempDir = './package-temp'
var npm = require('./package')

router.get('/package/:nameAndVersion/info', npm.mountPackage, npm.packageInfo)
router.get('/package/:nameAndVersion/info/versions', npm.mountPackage, npm.packageVersions)
router.get('/package/:nameAndVersion/files', npm.mountPackage, npm.packageFileList)
router.get('/package/:nameAndVersion/files/:filePath', npm.mountPackage, npm.packageFile)



// router.get('/package/:packageName/', async function (ctx) {
//     var info = await http.get(ctx.params.packageName)
//
//     ctx.body = info
// })

// router.get('/package/:packageName/versions', async function (ctx) {
//     var packageName = ctx.params.packageName
//     var info = await http.get(packageName)
//     var versions = lodash.reduce(info.versions, function (arr, version) {
//         arr.push({
//             version:version.version,
//             url: `http://${ctx.req.headers.host}/npm/${packageName}/${version.version}`
//         })
//         return arr
//     }, [])
//
//     ctx.body = versions
// })

router.get('/package/:packageName/:version', async function (ctx) {
    var {packageName, version} = ctx.params
    var packagePath = path.resolve(config.npmTempDir, packageName, version)
    var stat = await fsp.stat(packagePath)
    
    if (!stat) {
        packagePath = await helpers.download(packageName, version)
    }

    var fileList = await helpers.ls(packagePath)

    fileList = await Promise.all(fileList.map(async function (file) {
        var url = [config.cdnPrefix, packageName+'@'+version, file].join('/')
        var inCdn = await helpers.inCdn(url)

        var ret = {
            path: file,
            inCdn,
            url
        }
        return ret
    }))

    ctx.body = fileList
})

router.get('/publish', async function (ctx) {
    var files = JSON.parse(ctx.query.files)
    var publishedList = await Promise.all(files.map(async function (file) {
        var published = helpers.publish(file)
        return published
    }))
    ctx.body = publishedList
})

module.exports = router