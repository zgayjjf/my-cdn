/**
 * Promise 化的 fs 相关函数
 */
var fs = require('fs')
var path = require('path')
var findit = require('findit')

exports.stat = function (path) {
    return new Promise(function (resolve, reject) {
        fs.stat(path, function (err, stat) {
            if (err) {
                if (err.code === 'ENOENT') {
                    return resolve(null)
                } else {
                    return reject(err)
                }
            }

            console.log(stat)
            resolve(stat)
        })
    })
}

/**
 * 复制文件
 * @param src
 * @param dest
 * @returns {Promise}
 */
exports.cp = function (src, dest) {
    return new Promise(function (resolve, reject) {
        var readStream = fs.createReadStream(src)
        var writeStream = fs.createWriteStream(dest)
        readStream.pipe(writeStream)
        writeStream.on('finish', function () {
            resolve(true)
        })
        writeStream.on('error', function (error) {
            reject(error)
        })
    })
}

/**
 * 列出某个目录下【所有】的文件
 * @param directory
 * @returns {Promise<Array>}
 */
exports.ls = function ls(directory) {
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

/**
 * 读取文件
 * @param path
 * @returns {Promise<File>}
 */
exports.readFile = function (path) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path, function (err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}