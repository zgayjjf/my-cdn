async function publishToArs() {

}

async function publishToLocal(ctx, next) {
    var files = JSON.parse(ctx.query.files)
    var publishedList = await Promise.all(files.map(async function (file) {
        var published = helpers.publish(file)
        
        return published
    }))
    ctx.body = publishedList
}

exports.publishToLocal = publishToLocal