import axios from "axios";

export const Axios = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL_BACKEND,
  withCredentials: true,
});
