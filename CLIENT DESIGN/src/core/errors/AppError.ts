export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'STORAGE_ERROR'
  | 'UNKNOWN_ERROR'
  | 'DUPLICATE_ERROR';

export class AppError extends Error {
  public code: ErrorCode;
  public override message: string;
  public originalError?: unknown;

  constructor(
    code: ErrorCode,
    message: string,
    originalError?: unknown
  ) {
    super(message);
    this.code = code;
    this.message = message;
    this.originalError = originalError;
    this.name = 'AppError';
    
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
