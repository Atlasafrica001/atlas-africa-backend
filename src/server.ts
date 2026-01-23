import { env } from './config/env';  // ← Validates on import
import app from './app';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Atlas Africa Backend Server');
  console.log('================================');
  console.log(`📝 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/v1/auth/login`);
  console.log('================================');
  console.log('');
});

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log('');
  console.log(`⚠️  Received ${signal}, starting graceful shutdown...`);
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    console.log('✅ Graceful shutdown complete');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});