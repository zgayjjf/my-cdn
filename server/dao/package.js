var Base = require('./base')
// var config = require('config')
var db = require('../db/index')

class Package extends Base {
    constructor(config) {
        super(db, 'package', [
            'id',
            'name',
            'version'
        ])
    }
}

module.exports = new Package()