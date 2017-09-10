var path = require('path')
// 使用了npm上config包，请参见config的使用方式
module.exports = {
    port: 8090,
    registry: 'https://registry.npm.taobao.org',
    npmTempDir: path.resolve(__dirname, '../npm-temp')
}