var path = require('path')
var axios = require('axios')
var lodash = require('lodash')
var zlib = require('zlib')
var tar = require('tar-fs')
var packageDao = require('../dao/package')
var fileDao = require('../dao/file')
var fsp = require('../modules/fs-p')
var config = require('config')
var semver = require('semver')
var Error = require('../error/index')

var registry = config.get('registry')
var downloadDir = config.get('npmTempDir')

axios.defaults.baseURL = registry

const MAX_PACKAGE_CACHE_LENGTH = 100

class Package {
    constructor(name, version/*, packageDao, fileDao*/) {
        this.name = name
        this.version = version
        this.packageDao = packageDao
        this.fileDao = fileDao
        this.registry = `${registry}/${name}`
        this.tarball = `${registry}/${name}/download/${name}-${version}.tgz`
        this.downloadDir = path.resolve(downloadDir, name, version)
        this._downloaded = false            // 缓存下载与否
        this._info = null                   // 缓存包信息
    }

    /**
     * 静态方法，生成并返回一个package实例（主要是用到一些异步的东西，所以必须async，不能单纯用constructor）
     * @param name
     * @param version
     // * @param packageDao        数据库操作对象
     // * @param fileDao           数据库操作对象
     * @returns {Promise.<Package>}
     */

    static async create(name, version = 'latest'/*, packageDao, fileDao*/) {
        var info = await Package.info(name)

        if (version === 'latest') {
            version = info['dist-tags'].latest
        } else {
            var versions = Package.extractVersions(info)

            version = semver.maxSatisfying(versions, version)
        }

        // 如果缓存中存在该包，直接返回
        for (var i = 0, cachedPkg; i < Package.cachedPackages.length; i++) {
            cachedPkg = Package.cachedPackages[i]
            if (cachedPkg.name === name && cachedPkg.version === version) {
                return cachedPkg
            }
        }

        var pkg = new Package(name, version/*, packageDao, fileDao*/)

        await pkg.download()
        pkg.packageId = await pkg.savePackageToDb()

        // 将该包加入缓存后，移除超缓存限制的包
        Package.cachedPackages.unshift(pkg)
        if (Package.cachedPackages.length > MAX_PACKAGE_CACHE_LENGTH) {
            Package.cachedPackages.length = MAX_PACKAGE_CACHE_LENGTH
        }

        return pkg
    }

    // 获取包信息
    static async info(packageName) {
        var url = `${registry}/${packageName}`
        try {
            return await axios.get(url)
        } catch (e) {
            if (e.response.status === 404) {
                throw new Error.E404(url)
            }
        }

    }

    static extractVersions(info) {
        var versions = lodash.reduce(info.versions, function (arr, version) {
            arr.push(version.version)
            return arr
        }, [])
        return versions
    }
    // 获取包信息
    async info() {
        if (this._info) {
            return this._info
        }

        var info = await Package.info(this.name)
        this._info = info

        return info
    }

    // 获取包版本列表
    async versions() {
        var info = await this.info()

        return Package.extractVersions(info)
    }

    async download() {
        var packageDownloaded = await this.packageDownloaded()

        if (packageDownloaded) {
            return Promise.resolve(this.downloadDir)
        } else {
            var downloadDir = this.downloadDir
            var _this = this

            return new Promise(function (resolve, reject) {
                console.log(`请求：${_this.tarball}`)
                axios.get(_this.tarball, {
                    responseType: 'stream'
                }).then(function (data) {
                    data.pipe(zlib.createGunzip())
                        .pipe(tar.extract(downloadDir))
                        .on("finish", function () {
                            console.log(`tarball downloaded: ${_this.name} ${downloadDir}`)

                            _this._downloaded = true

                            resolve(downloadDir)
                        })
                        .on("error", function (err) {
                            reject(err)
                        })
                }).catch(function (err) {
                    if (err.response.status === 404) {
                        reject(new Error.E404(`${_this.name}@${_this.version}`))
                    }
                    reject(err)
                })
            })
        }
    }

    async savePackageToDb() {
        var packageRows = await this.packageDao.find({
            name: this.name,
            version: this.version
        })

        if (packageRows.length) {
            var row = packageRows[0]
            return row.id
        }

        var data = {
            name: this.name,
            version: this.version
        }

        var saveRet = await this.packageDao.add(data)

        await this.saveFilesToDb(saveRet.insertId)

        return saveRet.insertId
    }

    async updateFileStatus(fileId, data) {
        return await this.fileDao.update(data)
    }

    async saveFileToDb(filePath, packageId) {
        return await this.fileDao.add({
            path: filePath,
            package_id: packageId
        })
    }

    async saveFilesToDb(packageId) {
        var _this = this
        var files = await fsp.ls(this.downloadDir)

        await Promise.all(files.map(function (file) {
            return _this.saveFileToDb(file, packageId)
        }))
    }

    /**
     * 检查package是否已经下载
     * @returns {Promise.<boolean|*>}
     */
    async packageDownloaded() {
        if (this._downloaded) {
            return this._downloaded
        } else {
            this._downloaded = await fsp.stat(this.downloadDir)
            return this._downloaded
        }
    }

    async files() {
        var files = await this.fileDao.find({
            package_id: this.packageId
        })
        return files
    }

    async file(pathToFile) {
        var packageDownloaded = await this.packageDownloaded()

        if (!packageDownloaded) {
            await this.download()
        }
        return await fsp.readFile(path.resolve(this.downloadDir, 'package', pathToFile))
    }
}

Package.cachedPackages = []

module.exports = Package