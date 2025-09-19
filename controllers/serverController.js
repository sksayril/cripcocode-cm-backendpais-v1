const mongoose = require('mongoose');
const os = require('os');
const ResponseHelper = require('../utils/responseHelper');

class ServerController {
  // Basic health check
  static async healthCheck(req, res) {
    try {
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.version,
        database: {
          status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
          name: mongoose.connection.name || 'CRM_Database'
        }
      };

      return ResponseHelper.success(res, healthData, 'Server is healthy');
    } catch (error) {
      return ResponseHelper.internalError(res, 'Health check failed');
    }
  }

  // Comprehensive server status check
  static async serverStatus(req, res) {
    try {
      const statusData = {
        server: {
          status: 'running',
          timestamp: new Date().toISOString(),
          uptime: {
            seconds: process.uptime(),
            formatted: this.formatUptime(process.uptime())
          },
          environment: process.env.NODE_ENV || 'development',
          nodeVersion: process.version,
          platform: os.platform(),
          arch: os.arch()
        },
        database: {
          status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
          name: mongoose.connection.name || 'CRM_Database',
          host: mongoose.connection.host || 'unknown',
          port: mongoose.connection.port || 'unknown'
        },
        system: {
          cpu: {
            cores: os.cpus().length,
            model: os.cpus()[0]?.model || 'Unknown',
            loadAverage: os.loadavg()
          },
          memory: {
            total: os.totalmem(),
            free: os.freemem(),
            used: os.totalmem() - os.freemem(),
            usagePercentage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
          },
          uptime: {
            seconds: os.uptime(),
            formatted: this.formatUptime(os.uptime())
          }
        },
        process: {
          pid: process.pid,
          memoryUsage: process.memoryUsage(),
          platform: process.platform,
          nodeVersion: process.version
        },
        api: {
          endpoints: [
            '/health',
            '/api/status',
            '/api/auth',
            '/api/admin',
            '/api/company',
            '/api/client',
            '/api/project',
            '/api/employee',
            '/api/task'
          ]
        }
      };

      return ResponseHelper.success(res, statusData, 'Server status retrieved successfully');
    } catch (error) {
      console.error('Server status check error:', error);
      return ResponseHelper.internalError(res, 'Server status check failed');
    }
  }

  // Database connection test
  static async databaseTest(req, res) {
    try {
      const dbStatus = {
        connected: mongoose.connection.readyState === 1,
        readyState: mongoose.connection.readyState,
        readyStateDescription: this.getReadyStateDescription(mongoose.connection.readyState),
        name: mongoose.connection.name || 'CRM_Database',
        host: mongoose.connection.host || 'unknown',
        port: mongoose.connection.port || 'unknown',
        timestamp: new Date().toISOString()
      };

      if (dbStatus.connected) {
        return ResponseHelper.success(res, dbStatus, 'Database connection is healthy');
      } else {
        return ResponseHelper.error(res, 'Database connection failed', 503, dbStatus);
      }
    } catch (error) {
      console.error('Database test error:', error);
      return ResponseHelper.internalError(res, 'Database test failed');
    }
  }

  // System resources check
  static async systemResources(req, res) {
    try {
      const resources = {
        cpu: {
          cores: os.cpus().length,
          model: os.cpus()[0]?.model || 'Unknown',
          loadAverage: os.loadavg(),
          usage: this.calculateCPUUsage()
        },
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          usagePercentage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2),
          formatted: {
            total: this.formatBytes(os.totalmem()),
            free: this.formatBytes(os.freemem()),
            used: this.formatBytes(os.totalmem() - os.freemem())
          }
        },
        process: {
          memoryUsage: process.memoryUsage(),
          formattedMemoryUsage: {
            rss: this.formatBytes(process.memoryUsage().rss),
            heapTotal: this.formatBytes(process.memoryUsage().heapTotal),
            heapUsed: this.formatBytes(process.memoryUsage().heapUsed),
            external: this.formatBytes(process.memoryUsage().external)
          }
        },
        timestamp: new Date().toISOString()
      };

      return ResponseHelper.success(res, resources, 'System resources retrieved successfully');
    } catch (error) {
      console.error('System resources check error:', error);
      return ResponseHelper.internalError(res, 'System resources check failed');
    }
  }

  // Helper methods
  static formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  }

  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getReadyStateDescription(readyState) {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[readyState] || 'unknown';
  }

  static calculateCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(core => {
      for (type in core.times) {
        totalTick += core.times[type];
      }
      totalIdle += core.times.idle;
    });

    return {
      idle: totalIdle / cpus.length,
      total: totalTick / cpus.length,
      percentage: (100 - (totalIdle / totalTick * 100)).toFixed(2)
    };
  }

  // Ping endpoint for basic connectivity test
  static async ping(req, res) {
    try {
      const pingData = {
        message: 'pong',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      };

      return ResponseHelper.success(res, pingData, 'Server is responding');
    } catch (error) {
      return ResponseHelper.internalError(res, 'Ping failed');
    }
  }
}

module.exports = ServerController;
