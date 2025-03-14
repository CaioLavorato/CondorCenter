import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./hooks/use-auth";
import { CartProvider } from "./context/cart-context";
import { ProductProvider } from "./context/product-context";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ProductProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </ProductProvider>
  </AuthProvider>
);
