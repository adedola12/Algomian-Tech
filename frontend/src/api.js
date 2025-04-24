import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,                      // <- receive httpOnly cookie too
});

// 🔹 PRODUCTS
export const fetchProducts = (params = {}) =>
  api.get("/api/products", { params }).then((r) => r.data);

export const fetchProduct  = (id) =>
  api.get(`/api/products/${id}`).then((r) => r.data);

/* inject token on every request */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("algomian:token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* auto-logout on 401 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("algomian:token");
      window.dispatchEvent(new Event("algomian-logout"));
    }
    return Promise.reject(err);
  }
);

export default api;
