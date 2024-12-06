// ecosystem.config.js
module.exports = {
    apps: [
      {
        name: 'vue-dev',
        script: 'npm',
        args: 'run sites',
        env: {
          PORT: 8080,
          NODE_ENV: 'development'
        }
      },
      {
        name: 'api-server',
        script: '../server/server.js',
        watch: true,
        env: {
          NODE_ENV: 'development'
        }
      }
    ]
  }