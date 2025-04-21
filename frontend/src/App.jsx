import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Collection from './pages/Collection';
import Content from './pages/Content';
import Orders from './pages/Orders';
import PlaceOrder from './pages/PlaceOrder';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Search from './pages/Search';
import Shipping from './pages/Shipping';
import OrderSuccess from './pages/OrderSuccess';
import SignUp from './pages/SignUp';
import Inventory from './pages/Inventory';
import Dashboard from './pages/Dashboard';
import InventoryLayout from './layouts/InventoryLayout';
import MainLayout from './layouts/MainLayout';
import AddProduct from './pages/Inventory/AddProduct';

const App = () => {
  const location = useLocation();

  const inventoryRoutes = [
    "/inventory",
    "/dashboard",
    "/inventOrders",
    "/sales",
    "/logistics",
    "/customers",
    "/settings"
  ];

  const isInventoryPage = inventoryRoutes.some(path =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {isInventoryPage ? (
        <InventoryLayout>
          <Routes>
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sales" element={<div>Sales Management</div>} />
            <Route path="/logistics" element={<div>Logistics</div>} />
            <Route path="/customers" element={<div>Customers</div>} />
            <Route path="/settings" element={<div>Settings</div>} />
            <Route path="/inventory/add-product" element={<AddProduct />} />

          </Routes>
        </InventoryLayout>
      ) : (
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/search" element={<Search />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/content" element={<Content />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/place-order" element={<PlaceOrder />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/orders" element={<Orders />} />

            <Route path="/product/:productId" element={<Product />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/collection/:id" element={<Collection />} />
          </Routes>
        </MainLayout>
      )}
    </>
  );
};

export default App;
