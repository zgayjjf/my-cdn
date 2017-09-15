/**
 * 基础的数据库链接类
 */
var mysql = require('mysql')
var config = require('config')
var GenSql = require('gen-sql')
var gen = new GenSql()
// var connection = mysql.createConnection({
//     host: config.db.host,
//     port: config.db.port,
//     user: config.db.user,
//     password: config.db.password
// })
//
// connection.connect(function (err) {
//     if (err) {
//         console.error('error connecting: ', err)
//     }
//
//     console.log('connect as id', connection.threadId)
// })
class Db {
    constructor(config) {
        this.pool = this.initPool(config)
    }

    initPool(config) {
        return mysql.createPool({
            connectionLimit: 50,
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database
        })
    }

    query(sql, sqlParam, connection) {
        var _this = this
        console.log(`执行sql: ${sql}` , `\n参数${JSON.stringify(sqlParam)}`)
        return new Promise(function (resolve, reject) {
            if (connection) {
                connection.query(sql, sqlParam, function (err, rows) {
                    if (err) return reject(err)

                    resolve(rows)
                })
            } else {
                _this.pool.getConnection(function (err, connection) {
                    if (err) {
                        connection && connection.release()
                        reject(err)
                        return
                    }

                    connection.query(sql, sqlParam, function (err, rows) {
                        connection.release()

                        if (err) return reject(err)

                        resolve(rows)
                    })
                })
            }
        })
    }

    async add(obj, connection) {
        let genObj = gen.add(obj)
        return await this.query(genObj.sql, genObj.data, connection)
    }
    async del(obj, connection) {
        let genObj = gen.del(obj)
        return await this.query(genObj.sql, genObj.data, connection)
    }
    async update(obj, connection) {
        let genObj = gen.update(obj)
        return await this.query(genObj.sql, genObj.data, connection)
    }
    async find(obj, connection) {
        let genObj = gen.find(obj)
        return await this.query(genObj.sql, genObj.data, connection)
    }
}

module.exports = new Db(config.db)