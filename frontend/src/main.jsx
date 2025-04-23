// src/index.jsx  (or main.jsx)
import React      from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App                 from "./App";
import { AuthProvider   }  from "./context/AuthContext";
import ShopContextProvider from "./context/ShopContext";
import { SearchProvider }  from "./context/SearchContext";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ShopContextProvider>
          <SearchProvider>
            <App />
          </SearchProvider>
        </ShopContextProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
