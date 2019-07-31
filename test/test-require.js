const qc = require('../lib/index')
const Docker = require('dockerode')
const waitOnMysql = require('@windyroad/wait-on-mysql')

const testDbConnection = require('./test-db-connection')
const docker = new Docker()

const PORT_A = '3106'
const PORT_B = '3107'

qc.ensurePulled(docker, 'mysql:5.7.26')
  .then(() => {
    console.log('pulled')
    return qc.ensureStarted(docker, {
      Image: 'mysql:5.7.26',
      Tty: false,
      ExposedPorts: {
        '3306/tcp': {}
      },
      HostConfig: {
        PortBindings: { '3306/tcp': [{ HostPort: PORT_A }] }
      },
      Env: [
        'MYSQL_ROOT_PASSWORD=my-secret-pw'
      ],
      name: `qc-mysql-5.7.26-${PORT_A}`
    }, () => {
      return waitOnMysql({
        host: 'localhost',
        port: PORT_A,
        user: 'root',
        password: 'my-secret-pw'
      },
      {
        timeout: 60000
      })
    })
  }).then((container) => {
    console.log('started')
    return container
  }).then((container) => {
    return testDbConnection(PORT_A).then(() => { return container })
  }).catch(err => {
    console.error(err)
    process.exit(1)
  })

qc.ensurePulled(docker, 'mysql:5.7.26')
  .then(() => {
    return qc.ensureMySqlStarted(docker, '5.7.26', PORT_B)
  }).then((container) => {
    return testDbConnection(PORT_B).then(() => { return container })
  }).catch(err => {
    console.error(err)
    process.exit(1)
  })
