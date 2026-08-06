import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("agromart_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function saveAuth(data) {
  localStorage.setItem("agromart_token", data.token);
  localStorage.setItem("agromart_email", data.email);
  localStorage.setItem("agromart_role", data.role);
}

export function clearAuth() {
  localStorage.removeItem("agromart_token");
  localStorage.removeItem("agromart_email");
  localStorage.removeItem("agromart_role");
}

export function getAuth() {
  return {
    token: localStorage.getItem("agromart_token"),
    email: localStorage.getItem("agromart_email"),
    role: localStorage.getItem("agromart_role")
  };
}

export function formatResponse(data) {
  if (typeof data === "string") return data;
  return JSON.stringify(data, null, 2);
}

export function extractError(error) {
  if (error.response) {
    const body = error.response.data;
    const message =
      typeof body === "string" ? body : JSON.stringify(body, null, 2);

    return `HTTP ${error.response.status}\n${message}`;
  }

  return error.message || "Request failed";
}

export default api;
