import { FirebaseError } from 'firebase/app';
import { AppError } from './AppError';

export function mapError(error: unknown, defaultMessage: string = 'An unexpected error occurred'): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof FirebaseError) {
    return mapFirebaseError(error);
  }

  if (error instanceof Error) {
    return new AppError('UNKNOWN_ERROR', error.message || defaultMessage, error);
  }

  return new AppError('UNKNOWN_ERROR', defaultMessage, error);
}

function mapFirebaseError(error: FirebaseError): AppError {
  switch (error.code) {
    case 'permission-denied':
      return new AppError('PERMISSION_DENIED', 'You do not have permission to perform this action.', error);
    case 'not-found':
      return new AppError('NOT_FOUND', 'The requested resource was not found.', error);
    case 'already-exists':
      return new AppError('DUPLICATE_ERROR', 'The resource already exists.', error);
    case 'network-request-failed':
      return new AppError('NETWORK_ERROR', 'Network error. Please check your connection.', error);
    case 'storage/unauthorized':
      return new AppError('PERMISSION_DENIED', 'You are not authorized to perform this storage operation.', error);
    case 'storage/object-not-found':
      return new AppError('NOT_FOUND', 'The specified file does not exist.', error);
    default:
      return new AppError('UNKNOWN_ERROR', `Firebase Error: ${error.message}`, error);
  }
}

