/*  src/App.jsx  */
import {
  Routes, Route, Navigate,
} from "react-router-dom";

/* ─ layouts ─ */
import MainLayout      from "./layouts/MainLayout";
import InventoryLayout from "./layouts/InventoryLayout";

/* ─ public pages ─ */
import Home         from "./pages/Home";
import About        from "./pages/About";
import Collection   from "./pages/Collection";
import Content      from "./pages/Content";
import Product      from "./pages/Product";
import Cart         from "./pages/Cart";
import Search       from "./pages/Search";
import Login        from "./pages/Login";
import SignUp       from "./pages/SignUp";

/* ─ customer‑only pages ─ */
import Orders       from "./pages/Orders";
import Shipping     from "./pages/Shipping";
import PlaceOrder   from "./pages/PlaceOrder";
import OrderSuccess from "./pages/OrderSuccess";

/* ─ admin pages ─ */
import Inventory    from "./pages/Inventory";
import Dashboard    from "./pages/Dashboard";
import AddProduct   from "./pages/Inventory/AddProduct";

/* ─ route guard ─ */
import PrivateRoute from "./routes/PrivateRoute";      // ✅ correct



export default function App() {
  return (
    <Routes>
      {/* ─────────────────────────── Public routes ────────────────────────── */}
      <Route element={<MainLayout />}>
        <Route path="/"               element={<Home />} />
        <Route path="about"        element={<About />} />
        <Route path="search"       element={<Search />} />
        <Route path="cart"         element={<Cart />} />
        <Route path="collection"   element={<Collection />} />
        <Route path="collection/:id" element={<Collection />} />
        <Route path="content"      element={<Content />} />
        <Route path="product/:productId" element={<Product />} />
        <Route path="login"        element={<Login />} />
        <Route path="signup"       element={<SignUp />} />
      </Route>

      {/* ───────────────────────── Logged‑in user routes ───────────────────── */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="orders"        element={<Orders />} />
          <Route path="shipping"      element={<Shipping />} />
          <Route path="place-order"   element={<PlaceOrder />} />
          <Route path="order-success" element={<OrderSuccess />} />
        </Route>
      </Route>

      {/* ─────────────────────────── Admin‑only routes ─────────────────────── */}
      <Route element={<PrivateRoute adminOnly />}>
        <Route element={<InventoryLayout />}>
          <Route path="inventory"               element={<Inventory />} />
          <Route path="dashboard"               element={<Dashboard />} />
          <Route path="sales"                   element={<div>Sales Management</div>} />
          <Route path="logistics"               element={<div>Logistics</div>} />
          <Route path="customers"               element={<div>Customers</div>} />
          <Route path="settings"                element={<div>Settings</div>} />
          <Route path="inventory/add-product"   element={<AddProduct />} />
        </Route>
      </Route>

      {/* ───────── fallback: unknown paths go home ───────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
