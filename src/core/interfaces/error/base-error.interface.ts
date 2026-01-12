export interface IBaseError {
  message: string;
  errorCode: string;
  details: string;
  meta: Record<string, any>;
}
