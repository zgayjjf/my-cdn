var path = require('path')
var axios = require('axios')
var lodash = require('lodash')
var zlib = require('zlib')
var tar = require('tar-fs')
var fsp = require('./fs-p')
var config = require('config')

var registry = config.get('registry')
var downloadDir = config.get('npmTempDir')

axios.defaults.baseURL = registry


class Package {
    constructor(name, version) {
        this.name = name
        this.version = version
        this.registry = `${registry}/${name}`
        this.tarball = `${registry}/${name}/download/${name}-${version}.tgz`
        this.downloadDir = path.resolve(downloadDir, name, version)
        this.downloaded = false
    }

    static async create(name, version = 'latest') {
        var pkg = new this(name, version)
        // 获取最新的包
        if (version === 'latest') {
            var info = await pkg.info()
            version = info['dist-tags'].latest

            pkg.version = version
            pkg.registry = `${registry}/${name}`
            pkg.tarball = `${registry}/${name}/download/${name}-${version}.tgz`
            pkg.downloadDir = path.resolve(downloadDir, name, version)
        }

        return pkg
    }

    // 获取包信息
    async info() {
        console.log(`请求：${this.registry}`)
        var info = await axios.get(this.registry)

        return info
    }

    // 获取包版本列表
    async versions() {
        var info = await this.info()
        var versions = lodash.reduce(info.versions, function (arr, version) {
            arr.push(version.version)
            return arr
        }, [])

        return versions
    }

    async download() {
        var downloadDir = this.downloadDir
        var _this = this

        return new Promise(function (resolve, reject) {
            console.log(`请求：${_this.tarball}`)
            axios.get(_this.tarball, {
                responseType: 'stream'
            }).then(function (data) {
                data.pipe(zlib.createGunzip())
                    .pipe(tar.extract(downloadDir))
                    .on("finish", function(){
                        console.log(`tarball downloaded: ${this.name} ${downloadDir}`)

                        _this.downloaded = true
                        resolve(downloadDir)
                    })
                    .on("error", function (err) {
                        reject(err)
                    })
            }).catch(reject)
        })
    }

    async packageDownloaded() {
        if (this.downloaded) {
            return this.downloaded
        } else {
            this.downloaded = await fsp.stat(this.downloadDir)
            return this.downloaded
        }
    }

    async fileList() {
        var packageDownloaded = await this.packageDownloaded()

        if (!packageDownloaded) {
            await this.download()
        }

        return await fsp.ls(this.downloadDir)
    }

    async file(pathToFile) {
        var packageDownloaded = await this.packageDownloaded()

        if (!packageDownloaded) {
            await this.download()
        }
        return await fsp.readFile(path.resolve(this.downloadDir, 'package', pathToFile))
    }
}



module.exports = Package