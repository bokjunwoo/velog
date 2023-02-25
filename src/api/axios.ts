import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8000/api",
  timeout: 1000,
});

const logOnDev = (message: string) => {
  if (process.env.NODE_ENV === "development") {
    console.log(message);
  }
};

const onError = (message: string) => {
  alert(message);
};

const onRequest = (config: AxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
  if (!config.data) {
    return Promise.reject(new Error("Request data is missing"));
  }
  const token: string | null = localStorage.getItem("token");
  const { method, url } = config;
  if (!config.headers) {
    config.headers = {};
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  logOnDev(`[API] ${method?.toUpperCase()} ${url} | Request`);

  return Promise.resolve(config as InternalAxiosRequestConfig);
};

const onResponse = (response: AxiosResponse): AxiosResponse => {
  const { method, url } = response.config;
  const { status } = response;

  logOnDev(`[API] ${method?.toUpperCase()} ${url} | Request ${status}`);

  return response;
};

const onErrorResponse = (error: AxiosError | Error) => {
  if (axios.isAxiosError(error)) {
    const { message } = error;
    const { method, url } = error.config as AxiosRequestConfig;
    const { status, statusText } = error.response as AxiosResponse;

    logOnDev(
      `[API] ${method?.toUpperCase()} ${url} | Error ${status} ${statusText} | ${message}`
    );

    switch (status) {
      case 401: {
        console.log("ffff");
        break;
      }
      case 403: {
        onError("권환이 없음");
        break;
      }
      case 404: {
        onError("잘못된 요청");
        break;
      }
      case 500: {
        onError("서버에 문제 발생");
        break;
      }
      default: {
        onError("알 수 없는 오류 발생");
      }
    }
  } else {
    logOnDev(`[API] | Error ${error.message}`);
    onError(error.message);
  }

  return Promise.reject(error);
};

const setupInterceptors = (axiosInstance: AxiosInstance): AxiosInstance => {
  axiosInstance.interceptors.request.use(onRequest);
  axiosInstance.interceptors.response.use(onResponse, onErrorResponse);

  return axiosInstance;
};

setupInterceptors(instance);

export default instance;
