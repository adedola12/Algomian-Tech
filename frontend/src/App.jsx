// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

/* ─ layouts ─ */
import MainLayout from "./layouts/MainLayout";
import InventoryLayout from "./layouts/InventoryLayout";

/* ─ public pages ─ */
import Home from "./pages/Home";
import About from "./pages/About";
import Collection from "./pages/Collection";
import Content from "./pages/Content";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Search from "./pages/Search";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

/* ─ customer-only pages ─ */
import Orders from "./pages/Orders";
import Shipping from "./pages/Shipping";
import PlaceOrder from "./pages/PlaceOrder";
import OrderSuccess from "./pages/OrderSuccess";

/* ─ admin pages ─ */
import Inventory from "./pages/Inventory";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/Inventory/AddProduct";
import EditProduct from "./pages/Inventory/EditProduct";
import InventoryOrder from "./pages/InventoryOrder";
import CustomerOrderDetails from "./pages/CustomerOrderDetails";
import SalesManage from "./pages/Inventory/SalesManage";
import Logistics from "./pages/Inventory/Logistics";
import CreateShipment from "./components/Logistics/CreatShipment";
import CustomerInventoryOrderDetails from "./pages/Inventory/CustomerInventoryOrderDetails";
import CustomerAccountDetails from "./pages/Inventory/CustomerAccountDetails";
import Settings from "./pages/Inventory/Settings";

/* ─ route guard ─ */
import PrivateRoute from "./routes/PrivateRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import InvMan from "./pages/InvMan";
import InvManOrderDetails from "./components/InventoryManager/InvManOrderDetails";
import InvManViewOrder from "./components/InventoryManager/InvManViewOrder";
import BulkAddProduct from "./pages/Inventory/BulkAddProduct";

export default function App() {
  return (
    <>
      <Routes>
        {/* ─ Public ─ */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="search" element={<Search />} />
          <Route path="cart" element={<Cart />} />
          <Route path="collection" element={<Collection />} />
          <Route path="collection/:id" element={<Collection />} />
          <Route path="content" element={<Content />} />
          <Route path="product/:productId" element={<Product />} />
          <Route path="orders" element={<Orders />} />
          <Route path="shipping" element={<Shipping />} />
          <Route path="place-order" element={<PlaceOrder />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* ─ Logged-in users ─ */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}></Route>
        </Route>

        {/* ─ Admin only ─ */}
        <Route element={<PrivateRoute roles={true} />}>
          <Route element={<InventoryLayout />}>
            <Route path="inventory" element={<Inventory />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route
              path="customer-order-details/:id"
              element={<CustomerOrderDetails />}
            />
            <Route path="inventory/orders" element={<InventoryOrder />} />
            <Route path="inventoryManager" element={<InvMan />} />
            <Route
              path="/invman-order-details/:id"
              element={<InvManOrderDetails />}
            />
            <Route
              path="/invent-order-details/:id"
              element={<InvManViewOrder />}
            />

            <Route path="sales" element={<SalesManage />} />
            <Route path="logistics">
              <Route index element={<Logistics />} />
              <Route path="create-shipment" element={<CreateShipment />} />
            </Route>

            <Route path="customers">
              <Route index element={<CustomerInventoryOrderDetails />} />
              <Route path=":id" element={<CustomerAccountDetails />} />
              {/* ☝️ Use ":id" to match useParams().id */}
            </Route>

            <Route path="settings" element={<Settings />} />
            <Route path="inventory/add-product" element={<AddProduct />} />
            <Route
              path="inventory/edit-product/:id"
              element={<EditProduct />}
            />
            <Route path="inventory/bulk-product" element={<BulkAddProduct />} />
          </Route>
        </Route>

        {/* ─ Fallback ─ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </>
  );
}
