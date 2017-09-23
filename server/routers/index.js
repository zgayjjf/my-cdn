var path = require('path')
// var request = require('request')
var Router = require('koa-router')
// var lodash = require('lodash')
// var config = require('config')
// var http = require('../modules/http')
// var fsp = require('../modules/fs-p')
var helpers = require('../helpers')
var router = new Router()
// var npmTempDir = './package-temp'
var npm = require('./package')
var publish = require('./publish')

router.get('/package/:nameAndVersion/info', npm.mountPackage, npm.packageInfo)
router.get('/package/:nameAndVersion/info/versions', npm.mountPackage, npm.packageVersions)
router.get('/package/:nameAndVersion/files', npm.mountPackage, npm.packageFileList)
router.get('/package/:nameAndVersion/files/:filePath', npm.mountPackage, npm.packageFile)

router.get('/publish', publish.publishToLocal)

module.exports = router