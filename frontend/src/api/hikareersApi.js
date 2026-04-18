import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_HIKAREERS_API,
  withCredentials: true,
});

// Add a request interceptor to include the Bearer token
client.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("hikareers_token");

  // If no token, attempt to log in using admin credentials
  if (!token && !config.url.includes("/auth/login")) {
    try {
      const loginRes = await axios.post(`${config.baseURL}/auth/login`, {
        email: import.meta.env.VITE_HIKAREERS_ADMIN_EMAIL,
        password: import.meta.env.VITE_HIKAREERS_ADMIN_PASSWORD,
      });
      token = loginRes.data.data.accessToken;
      localStorage.setItem("hikareers_token", token);
    } catch (err) {
      console.error("HiKareers auto-login failed:", err);
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle expired tokens
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem("hikareers_token");
      // The request interceptor will handle the new login on the next attempt
      return client(originalRequest);
    }
    return Promise.reject(error);
  },
);

export const createJobInHiKareers = (data) => client.post("/jobs", data);

export default client;
