const waitOnMysql = require('@windyroad/wait-on-mysql')

function testDbConnection (port) {
  return waitOnMysql({
    host: 'localhost',
    port: port,
    user: 'root',
    password: 'my-secret-pw'
  }, {
    timeout: 60000
  }, true).then((mysqlConnection) => {
    return new Promise(function (resolve, reject) {
      console.log('quering')
      mysqlConnection.query('select 1 from dual', function (err, result, fields) {
        if (err) {
          reject(err)
        } else {
          console.log(result)
          resolve(mysqlConnection)
        }
      })
    })
  }).then((mysqlConnection) => {
    return new Promise(function (resolve, reject) {
      console.log('disconnecting')
      mysqlConnection.end(function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(mysqlConnection)
        }
      })
    })
  })
}

module.exports = testDbConnection
