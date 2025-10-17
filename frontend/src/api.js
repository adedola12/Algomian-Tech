import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || // production  ← ENV
    (import.meta.env.DEV
      ? "http://localhost:5000" // dev fallback
      : "/"), // *never* blank
  withCredentials: true, // keep your cookies / JWTs working
});

export const createOrder = (payload) => api.post("/api/orders", payload); // ← send payload as JSON as-is

export const fetchMyOrders = () =>
  api.get("/api/orders/myorders").then((res) => res.data);

export const fetchOrderById = (id) =>
  api.get(`/api/orders/${id}`).then((res) => res.data);

export const updateOrderStatus = (id, statusData) =>
  api.put(`/api/orders/${id}/status`, statusData).then((res) => res.data);

// admin
export const fetchAllOrders = () =>
  api.get("/api/orders").then((res) => res.data);

// 🔹 USERS
export const fetchCustomerById = (id) =>
  api.get(`/api/users/${id}`).then((res) => res.data);

export const fetchCustomerOrders = (id) =>
  api.get(`/api/users/${id}/orders`).then((res) => res.data);

// 🔹 PRODUCTS
export const fetchProducts = (params = {}) =>
  api.get("/api/products", { params }).then((r) => r.data);

export const fetchProduct = (id) =>
  api.get(`/api/products/${id}`).then((r) => r.data);

export const deleteProduct = (id) =>
  api.delete(`/api/products/${id}`).then((r) => r.data);

/* inject token on every request */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("algomian:token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// export async function createBulkOrders(payload) {
//   const { data } = await api.post("/api/orders/bulk", payload, {
//     withCredentials: true,
//   });
//   return data;
// }

export const createBulkOrders = (payload) =>
  api.post("/api/orders/bulk", payload).then((r) => r.data);

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
