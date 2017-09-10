var path = require('path')
var http = require('./http')
var tar = require('tar-fs')
var zlib = require('zlib')
var findit = require('findit')
var config = require('config')

function download(name, version) {
    var packagePath = path.resolve(config.get('npmTempDir'), name, version)

    return new Promise(function (resolve, reject) {
        http.get(`http://registry.npm.taobao.org/${name}/download/${name}-${version}.tgz`, {
            responseType: 'stream'
        }).then(function (data) {
            data.pipe(zlib.createGunzip())
                .pipe(tar.extract(packagePath))
                .on("finish", function(){
                    console.log(`tarball downloaded: ${name} ${packagePath}`)
                    // _this.buildFileTree(callback)
                    resolve(packagePath)
                })
                .on("error", function (err) {
                    reject(err)
                })
        }).catch(function (err) {
            reject(err)
        })
    })
}

function ls(directory) {
    return new Promise(function (resolve, reject) {
        var finder = findit(directory)
        var files = []
        
        finder.on('file', function (file, stat) {
            files.push(file.replace(path.resolve(directory, 'package'), ''))
        })
        
        finder.on('end', function () {
            resolve(files)
        })
        
        finder.on('error', function (err) {
            reject(err)
        })
    })
}

exports.download = download
exports.ls = ls