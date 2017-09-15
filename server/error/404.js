class E404 extends Error {
    constructor(path, extra) {
        var message = `Error: Not Found ${path}`
        super(message)

        this.name = 'E404'
        this.status = 404
    }
}

module.exports = E404