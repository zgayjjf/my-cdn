var Base = require('./base')
// var config = require('config')
var db = require('../db/index')

class File extends Base {
    constructor(config) {
        super(db, 'file', [
            'package_id',
            'path',
            'published'
        ])
    }
}

module.exports = new File()