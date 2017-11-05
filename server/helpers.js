var path = require('path')
var http = require('./modules/http')
var fsp = require('./modules/fs-p')
var fse = require('fs-extra')
var tar = require('tar-fs')
var zlib = require('zlib')

var config = require('config')

/**
 * 检查某个文件在外网cdn是否存在
 * @param url
 * @returns {Promise}
 */
function inCdn(url) {
    return new Promise(function (resolve, reject) {
        console.log(url)
        http.get(url).then(function (data) {
            if (data) {
                resolve(true)
            } else {
                resolve(false)
            }
            console.log(data)
        }).catch(function (err) {
            console.log(err.request.path)
            if (err.response.status === 404) {
                resolve(false)
            } else {
                console.log(err)
                reject(err)
            }
        })
    })
}

/**
 * 将某个本地文件发布到外网
 * @param name
 * @param version
 * @param fileInPackage
 */
async function publish(name, version, fileInPackage) {
    var filePath = path.join(name, version, 'package', fileInPackage)
    var src = path.join(config.npmTempDir, filePath)
    var dest = path.join(config.publishedDir, filePath)

    var stat = await fsp.stat(src)

    if (stat) {
        var published = await fse.copy(src, dest)
    } else {
        throw `file not exist ${filePath}`
    }
    return published
}

exports.inCdn = inCdn
exports.publishLocal = publish