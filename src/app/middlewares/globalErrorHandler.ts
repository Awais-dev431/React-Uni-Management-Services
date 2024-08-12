/* eslint-disable @typescript-eslint/no-explicit-any */
import { ErrorRequestHandler } from 'express';
import config from '../../config';
import { IGenericErrorMessage } from '../../interfaces/error';
import handleValidationError from '../../errors/handleValidationError';
import ApiError from '../../errors/ApiError';
import { errLogger } from '../../shared/logger';
import { ZodError } from 'zod';
import handleZodError from '../../errors/handleZodError';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  config.environment === 'development'
    ? console.log('🚀 globalErrorHandler ~', err)
    : errLogger.error('🚀 globalErrorHandler ~', err);

  let statusCode = 500;
  let message = 'Something went wrong!!!';
  let errorMessages: IGenericErrorMessage[] = [];

  if (err?.name === 'ValidatorError') {
    const simplefiedError = handleValidationError(err);
    statusCode = simplefiedError.statusCode;
    message = simplefiedError.message;
    errorMessages = simplefiedError.errorMessages;
  } else if (err instanceof ZodError) {
    const simplefiedError = handleZodError(err);
    statusCode = simplefiedError.statusCode;
    message = simplefiedError.message;
    errorMessages = simplefiedError.errorMessages;
  } else if (err instanceof ApiError) {
    statusCode = err?.statusCode;
    message = err?.message;
    4;
    errorMessages = err?.message
      ? [
          {
            path: '',
            message: err?.message,
          },
        ]
      : [];
  } else if (err instanceof Error) {
    message = err?.message;
    errorMessages = err?.message
      ? [
          {
            path: '',
            message: err?.message,
          },
        ]
      : [];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: config.environment !== 'production' ? err?.stack : undefined,
  });
  next();
};

export default globalErrorHandler;
