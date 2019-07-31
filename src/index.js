import waitOnMysql from '@windyroad/wait-on-mysql'
import qc from '@windyroad/quick-containers-js'

function ensureMySqlStarted (
  docker,
  version = 'latest',
  port = '3306',
  timeout = 60000,
  password = 'my-secret-pw',
  env = []
) {
  const options = {
    Image: `mysql:${version}`,
    Tty: false,
    ExposedPorts: {
      '3306/tcp': {}
    },
    HostConfig: {
      PortBindings: { '3306/tcp': [{ HostPort: `${port}` }] }
    },
    Env: env.concat([`MYSQL_ROOT_PASSWORD=${password}`]),
    name: `qc-mysql-${version}-${port}`
  }
  return qc.ensureStarted(docker, options, () => {
    return waitOnMysql(
      {
        host: 'localhost',
        port: port,
        user: 'root',
        password: password
      },
      {
        timeout: timeout
      }
    )
  })
}

exports.ensureMySqlStarted = ensureMySqlStarted
