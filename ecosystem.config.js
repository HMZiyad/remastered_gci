module.exports = {
  apps: [
    {
      name: 'gci-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 2,           // Cluster mode: 2 workers
      exec_mode: 'cluster',   // Load balance across 2 instances
      autorestart: true,
      watch: false,
      max_memory_restart: '400M', // Protect 1GB total Node budget (400M x 2)
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'gci-worker',
      script: 'npm',
      args: 'run worker',
      instances: 1,           // Single background worker
      autorestart: true,
      watch: false,
      max_memory_restart: '200M', // Sharp memory is managed internally via WORKER_CONCURRENCY, but this catches leaks
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
