import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ScanPage from "@/pages/scan-page";
import CartPage from "@/pages/cart-page";
import CheckoutPage from "@/pages/checkout-page";
import PaymentSuccessPage from "@/pages/payment-success-page";
import PaymentMethodPage from "@/pages/payment-method-page";
import AddCardPage from "@/pages/add-card-page";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/scan" component={ScanPage} />
      <ProtectedRoute path="/cart" component={CartPage} />
      <ProtectedRoute path="/checkout" component={CheckoutPage} />
      <ProtectedRoute path="/payment-success/:id" component={PaymentSuccessPage} />
      <ProtectedRoute path="/payment-methods" component={PaymentMethodPage} />
      <ProtectedRoute path="/add-card" component={AddCardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen max-w-md mx-auto relative bg-white">
        <Router />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
