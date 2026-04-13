import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const registerUser = (data) => {
  return axios.post(`${API}/api/v1/auth/register`, data);
};

export const loginUser = (data) => {
  return axios.post(`${API}/api/v1/auth/login`, data);
};
console.log("API:", API);