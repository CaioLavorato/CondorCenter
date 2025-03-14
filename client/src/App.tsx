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
import ScanPage from "@/pages/scan-page";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useEffect, useState } from "react";
import { isNativeApp, initApp } from "./lib/capacitor";
import { useMobileDevice } from "./hooks/use-mobile-device";

function Router() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/scanner" component={ScannerPage} />
      <ProtectedRoute path="/scan" component={ScanPage} />
      <ProtectedRoute path="/cart" component={CartPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/profile/payment-methods" component={PaymentMethodsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [appInitialized, setAppInitialized] = useState(false);
  const { deviceInfo, isNativeApp: isNative } = useMobileDevice();
  
  // Inicializa o aplicativo nativo (Capacitor) se estiver rodando em ambiente nativo
  useEffect(() => {
    async function initialize() {
      if (isNativeApp()) {
        const success = await initApp();
        setAppInitialized(success);
        console.log("Aplicativo nativo inicializado:", success);
      } else {
        setAppInitialized(true);
      }
    }
    
    initialize();
  }, []);
  
  // Aplicando as classes apropriadas para estilos específicos de plataforma
  useEffect(() => {
    if (isNative) {
      document.body.classList.add('native-app');
      
      if (deviceInfo.platform === 'ios') {
        document.body.classList.add('ios-app');
      } else if (deviceInfo.platform === 'android') {
        document.body.classList.add('android-app');
      }
    }
  }, [isNative, deviceInfo]);
  
  if (!appInitialized) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
