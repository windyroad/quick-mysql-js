import qc from '../lib/index'
import Docker from 'dockerode'
import waitOnMysql from '@windyroad/wait-on-mysql'

import testDbConnection from './test-db-connection'
const docker = new Docker()

const PORT_A = '3206'
const PORT_B = '3207'

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
