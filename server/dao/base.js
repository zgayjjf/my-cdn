class Base {
    constructor(db, tableName, attr) {
        this.db = db
        this.tableName = tableName
        this.attr = attr
    }

    async add(data, connection) {
        let obj = {
            table: this.tableName,
            data
        }

        return await this.db.add(obj, connection)
    }

    async del(condition, connection) {
        let obj = {
            table: this.tableName,
            condition
        }

        return await this.db.del(obj, connection)
    }

    async update(data, condition, connection) {
        let obj = {
            table: this.tableName,
            data,
            condition
        }

        return await this.db.update(obj, connection)
    }

    async find(condition, connection) {
        let obj = {
            field: {
                attr: this.attr
            },
            table: this.tableName,
            condition
        }

        return await this.db.find(obj, connection)
    }
}

module.exports = Base