export interface BaseResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

export interface BaseErrorResponse {
  message: string;
  statusCode: number;
  timestamp: string;
}
