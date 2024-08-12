import mongoose from 'mongoose';
import app from './app';
import config from './config';
import { logger, errLogger } from './shared/logger';
import { Server } from 'http';

process.on('uncaughtException', err => {
  errLogger.error(err);
  process.exit(1);
});

let server: Server;

async function mainServer() {
  try {
    await mongoose.connect(config.database_url as string);
    logger.info(`📡 Database connection successfully`);

    server = app.listen(config.PORT, () =>
      logger.info('Server Running on ', config.PORT)
    );
  } catch (error) {
    errLogger.error('❌❌❌ Database connection failed!!!', error);
  }

  process.on('unhandledRejection', err => {
    console.log('UnhandledRejection is detected, we are closing our server');
    if (server) {
      server.close(() => {
        errLogger.error(err);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

mainServer();

process.on('SIGTERM', () => {
  logger.info('SIGTERM is received');
  if (server) {
    server.close();
  }
});
