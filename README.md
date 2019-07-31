# quick-mysql-js

Utility methods for quickly starting up a mysql container. Useful for when you're testing code that depends on a mysql databases.

[`quick-mysql-js`](https://github.com/windyroad/quick-mysql-js) uses [`dockerode`](https://github.com/apocas/dockerode) and you need to install it as a peer dependency

# Why

Sometimes I need a mysql database for the code I'm testing to connect to. The easiest way to make sure one is available is to pull the relevant Docker image and start up a container. This code tries to make that quick and easy.

# Installation

```
npm install @windyroad/quick-mysql-js dockerode --save-dev
```

# Usage

## ensureMySqlStarted(docker, version = 'latest', port = '3306', timeout = 60000, password = 'my-secret-pw', env = [])

ensureStarted will start try to start a msql container. It returns a promise that resolves when a connection can be made to to container on the specified port.

```js

import qc from '@windyroad/quick-containers-js'
import qmysql from '@windyroad/quick-mysql-js'
import Docker from 'dockerode'
import waitport from 'wait-port'
...

const docker = new Docker();
qc.ensurePulled(docker, 'mysql:latest', console.log).then(...).catch(...)
qmysql.ensureMySqlStarted(docker); 
// 👆same as qm.ensureMySqlStarted(Docker, 'latest', '3306', 60000, 'my-secret-pw', []);
```

`qmysql.ensureMySqlStarted(docker, version, port, timeout, password, env);` is equivalent to

```js
qc.ensureStarted(
  docker,
  {
    Image: `mysql:${version}`,
    Tty: false,
    ExposedPorts: {
      '3306/tcp': {},
    },
    HostConfig: {
      PortBindings: { '3306/tcp': [{ HostPort: `${port}` }] },
    },
    Env: env.concat([`MYSQL_ROOT_PASSWORD=${password}`]),
    name: `qc-mysql-${version}-${port}`,
  },
  () => {
    return waitOnMysql(
      {
        host: 'localhost',
        port: port,
        user: 'root',
        password: password,
      },
      {
        timeout: timeout,
      },
    );
  },
);
```
