var config = require('config')
var axios = require('axios')

axios.defaults.baseURL = config.get('registry')
axios.interceptors.response.use(function (response) {
    return response.data
}, function (error) {
    return Promise.reject(error)
})

module.exports = axios