export interface IBaseError<T = unknown> {
  message: string;
  errorCode: string;
  details: string;
  metadata: T;
}
