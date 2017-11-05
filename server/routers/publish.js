let fileDao = require('../dao/file')
let helpers = require('../helpers')

async function publishToArs() {

}

async function publishToLocal(ctx, next) {
    let files = ctx.request.body.files

    let publishedList = await Promise.all(files.map(async function (file) {
        let published = helpers.publishLocal(ctx.pkg.name, ctx.pkg.version, file.path)
        
        return published
    }))


    fileDao.update({
        published: true
    }, {
        0: `id in (${files.map(file=>file.id).join(',')})`
    })

    ctx.body = publishedList


}

exports.publishToLocal = publishToLocal