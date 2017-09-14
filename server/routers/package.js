var Package = require('../modules/package')

async function mountPackage(ctx, next) {
    var [name, version] = ctx.params.nameAndVersion.split('@')
    var pkg = await Package.create(name, version)

    ctx.pkg = pkg

    await next()
}

async function packageInfo(ctx) {
    ctx.body = await ctx.pkg.info()
}

async function packageVersions(ctx) {
    ctx.body = await ctx.pkg.versions()
}

async function packageFileList(ctx) {
    ctx.body = await ctx.pkg.fileList()
}

async function packageFile(ctx) {
    ctx.body = await ctx.pkg.file(ctx.params.filePath)
}

exports.mountPackage = mountPackage
exports.packageInfo = packageInfo
exports.packageFileList = packageFileList
exports.packageVersions = packageVersions
exports.packageFile = packageFile