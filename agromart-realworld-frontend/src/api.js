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

export function saveSession(loginResponse) {
  localStorage.setItem("agromart_token", loginResponse.token);
  localStorage.setItem("agromart_email", loginResponse.email);
  localStorage.setItem("agromart_role", loginResponse.role);
}

export function saveUserId(userId) {
  localStorage.setItem("agromart_user_id", String(userId));
}

export function getSession() {
  return {
    token: localStorage.getItem("agromart_token"),
    email: localStorage.getItem("agromart_email"),
    role: localStorage.getItem("agromart_role"),
    userId: localStorage.getItem("agromart_user_id")
      ? Number(localStorage.getItem("agromart_user_id"))
      : null
  };
}

export function clearSession() {
  [
    "agromart_token",
    "agromart_email",
    "agromart_role",
    "agromart_user_id"
  ].forEach((key) => localStorage.removeItem(key));
}

export function errorMessage(error) {
  if (error?.response) {
    const body = error.response.data;
    return typeof body === "string"
      ? body
      : JSON.stringify(body, null, 2);
  }

  return error?.message || "Request failed";
}

export default api;
