import axios from "axios";
import StatusCode from "@/constants/statusCode";

const instance = axios.create({
  baseURL: "",
  timeout: 50000,
  xsrfCookieName: "xsrf-token",
});

instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加一个响应拦截器
instance.interceptors.response.use(
  (response) => {
    if (response.data.rtn_code === StatusCode.SUCCESS) {
      return response.data;
    }
    if (response.data.rtn_code === StatusCode.FAILED) {
      history.push("/login");

      // 定义一个messagecode在后面会用到
      return Promise.reject();
    }
    console.log(response.data);
    return Promise.reject(response.data);
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;