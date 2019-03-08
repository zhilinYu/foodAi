/**
 * http配置
 */
// 引入axio
import Vue from 'vue'
import axios from 'axios'
import router from "@/router"
import Toast from "components/Toast/toast"
// 超时时间
axios.defaults.timeout = 30000;
// http请求拦截器
axios.interceptors.request.use(config => {
  config.headers["Content-Type"] = "application/json";
  config.headers.channelType = "3";
  return config
}, error => {
  // 加载超时
  router.push({
    path: "/error",
    name: "ErrorPage",
    query: {
      errorType: "onloaderror"
    }
  });
  return Promise.reject(error)
})
//http响应拦截器
axios.interceptors.response.use(res => {
  return res
}, error => {
  if (error && error.response) {
    switch (error.response.status) {
      case 400:
      case 401:
      case 403:
      case 404:
      case 408:
        Toast("请求出错");
        break;
      case 500:
      case 501:
      case 502:
      case 503:
      case 504:
      case 505:
        Toast("服务器异常，请稍后重试");
        break;
      default:
        Toast("连接出错");
    }
  }
  console.log(error);
  return Promise.reject(error)
})

export default axios
