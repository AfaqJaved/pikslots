export class BaseErrorResponse {
  readonly message: string;
  readonly statusCode: number;
  readonly timestamp: string;

  constructor(message: string, statusCode: number) {
    this.message = message;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}
