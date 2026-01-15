export interface IBaseError {
  message: string;
  errorCode: string;
  details: string;
  metadata: Record<string, any>;
}
