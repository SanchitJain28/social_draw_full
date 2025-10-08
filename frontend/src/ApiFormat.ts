import axios from "axios";

export const Axios = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL_BACKEND,
  withCredentials: true,
});

Axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); 
    console.log("TOKEN",token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(config)
    return config;
  },
  (error) => Promise.reject(error)
);
