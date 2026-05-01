import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_HIKAREERS_API,
  withCredentials: true,
});

// ✅ Attach token if available
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("hikareers_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ Handle expired token
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("hikareers_token");

      // optional: redirect to login
      window.location.href = "/signin";
    }

    return Promise.reject(error);
  },
);

// ✅ API function
export const createJobInHiKareers = (data) => {
  return client.post("/jobs", data);
};

export default client;
