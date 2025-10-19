import axios from 'axios'; // , { HttpStatusCode, type AxiosRequestConfig }

const _axios = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string).replace('<host>', location.hostname),
  allowAbsoluteUrls: false,
  headers: { Authorization: 'Bearer: <some_token>', 'X-Custom-Header': 'foobar' },
});

// _axios.interceptors.response.use(undefined, async (error) => {
//   if (error.response?.status === HttpStatusCode.Unauthorized) {
//     // await refreshToken();
//     return _axios(error.config); // Retry original request
//   }
//   throw error;
// });

// const _request = (url: string, config?: AxiosRequestConfig) =>
//   _axios(url, { ...config, headers: { ...(config ?? {}).headers, 'Authorize': '<some_token>' } });

// const _get = (url: string, config?: AxiosRequestConfig) => _request(url, { method: 'get', ...config });

// const _delete = (url: string, config?: AxiosRequestConfig) => _request(url, { method: 'delete', ...config });

// const _post = (url: string, data: object | string = {}, config?: AxiosRequestConfig) =>
//   _request(url, { method: 'post', data, ...config });

// const _put = (url: string, data: object | string = {}, config?: AxiosRequestConfig) =>
//   _request(url, { method: 'put', data, ...config });

// export default {
//   get: _get,
//   delete: _delete,
//   post: _post,
//   put: _put,
// };

export default _axios;
