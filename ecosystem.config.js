// ecosystem.config.js (in the root folder)
module.exports = {
  apps: [
    {
      name: 'vue-dev',
      script: 'npm',
      args: 'run serve',
      cwd: 'sites', //  The cwd is now sites
      env: {
        PORT: 8080,
        NODE_ENV: 'development'
      }
    },
    {
      name: 'api-server',
      script: 'server/server.js', // Adjusted path
      cwd: '.', // Current working directory (project root)
      watch: true,
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
}