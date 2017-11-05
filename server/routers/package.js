var Package = require('../models/package')
var packageDao = require('../dao/package')
var fileDao = require('../dao/file')
var mime = require('mime')

async function mountPackage(ctx, next) {
    var [name, version] = ctx.params.nameAndVersion.split('@')
    var pkg = await Package.create(name, version, packageDao, fileDao)

    ctx.pkg = pkg

    await next()
}

async function packageInfo(ctx) {
    ctx.body = await ctx.pkg.info()
}

async function packageVersions(ctx) {
    ctx.body = await ctx.pkg.versions()
}

async function packageFiles(ctx) {
    ctx.body = await ctx.pkg.files()
}

async function packageFile(ctx) {
    var file = await ctx.pkg.file(ctx.params.filePath)
    ctx.set('Content-Type', mime.getType(ctx.params.filePath))
    ctx.set('Cache-Control', 'max-age=31536000')
    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.body = file
}

exports.mountPackage = mountPackage
exports.packageInfo = packageInfo
exports.packageFiles = packageFiles
exports.packageVersions = packageVersions
exports.packageFile = packageFile