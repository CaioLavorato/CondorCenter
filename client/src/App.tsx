import { Switch, Route } from "wouter";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "./hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import ScannerPage from "@/pages/scanner-page";
import CartPage from "@/pages/cart-page";
import ProfilePage from "@/pages/profile-page";
import PaymentMethodsPage from "@/pages/payment-methods-page";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function Router() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/scanner" component={ScannerPage} />
      <ProtectedRoute path="/cart" component={CartPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/profile/payment-methods" component={PaymentMethodsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
