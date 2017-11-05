// let path = require('path')
// let helpers = require('../helpers')
let Router = require('koa-router')
let router = new Router()
let npm = require('./package')
let publish = require('./publish')

router.get('/npm/:nameAndVersion/info', npm.mountPackage, npm.packageInfo)
router.get('/npm/:nameAndVersion/versions', npm.mountPackage, npm.packageVersions)
router.get('/npm/:nameAndVersion/files', npm.mountPackage, npm.packageFiles)
router.get('/npm/:nameAndVersion/files/:filePath', npm.mountPackage, npm.packageFile)

router.post('/npm/:nameAndVersion/publish', npm.mountPackage, publish.publishToLocal)
router.post('/npm/:nameAndVersion/publish_confirm', npm.mountPackage, publish.publishToLocal)

module.exports = router