var fs = require('fs')

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