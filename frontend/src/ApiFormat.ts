import axios from "axios";

export const Axios = axios.create({
  baseURL: "https://social-draw-full.onrender.com",
  withCredentials: true,
});
