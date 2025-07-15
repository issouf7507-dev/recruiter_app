module.exports = {
  apps: [
    {
      name: "marabuweb",
      script: "npm",
      args: "start",
      cwd: "/var/www/webapp/marabuweb/current",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/www/webapp/marabuweb/logs/err.log",
      out_file: "/var/www/webapp/marabuweb/logs/out.log",
      log_file: "/var/www/webapp/marabuweb/logs/combined.log",
      time: true,
    },
  ],
};
