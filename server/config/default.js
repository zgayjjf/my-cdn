var path = require('path')
// 使用了npm上config包，请参见config的使用方式
module.exports = {
    port: 8090,
    registry: 'http://r.tnpm.oa.com',
    npmTempDir: path.resolve(__dirname, '../.npm-temp'),
    // cdnPrefix: 'http://s.url.cn/npm/'
    cdnPrefix: 'https://cdn.jsdelivr.net/package',
    publishedDir: path.resolve(__dirname, '../.npm-cdn')
}