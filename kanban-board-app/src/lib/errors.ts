interface ErrorDict {
  [key: string]: string[];
}

interface ErrorData {
  title?: string;
  status?: number;
  detail?: string;
  errors?: ErrorDict;
}

interface AxiosError {
  code?: string;
  name?: string;
  status?: number;
  message?: string;
  response?: {
    data?: ErrorData;
    status?: number;
  };
}

const collectAllErrors = (errorDict: ErrorDict) =>
  Object.keys(errorDict).reduce((acc, key) => [...acc, ...errorDict[key]], [] as string[]);

export { type AxiosError, collectAllErrors };
