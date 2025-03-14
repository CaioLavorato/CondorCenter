import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useScanner } from "@/hooks/use-scanner";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import ProductFoundPopup from "@/components/scan/product-found-popup";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@shared/schema";

export default function ScanPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { initScanner, stopScanner, scanBarcode } = useScanner();
  const { addToCart } = useCart();
  
  const [manualBarcode, setManualBarcode] = useState("");
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Initialize camera when component mounts
  useEffect(() => {
    const startScanner = async () => {
      try {
        if (videoRef.current) {
          await initScanner(videoRef.current, handleBarcodeScan);
        }
      } catch (error) {
        toast({
          title: "Erro ao iniciar câmera",
          description: "Verifique se você concedeu permissão de acesso à câmera.",
          variant: "destructive",
        });
      }
    };
    
    startScanner();
    
    // Cleanup when component unmounts
    return () => {
      stopScanner();
    };
  }, []);
  
  const handleBarcodeScan = async (barcode: string) => {
    try {
      const product = await scanBarcode(barcode);
      if (product) {
        setScannedProduct(product);
        setQuantity(1);
        setIsPopupVisible(true);
      }
    } catch (error) {
      toast({
        title: "Produto não encontrado",
        description: "O código de barras escaneado não corresponde a nenhum produto.",
        variant: "destructive",
      });
    }
  };
  
  const handleManualSearch = async () => {
    if (!manualBarcode.trim()) {
      toast({
        title: "Código em branco",
        description: "Por favor, insira um código de barras válido.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const product = await scanBarcode(manualBarcode);
      if (product) {
        setScannedProduct(product);
        setQuantity(1);
        setIsPopupVisible(true);
      }
    } catch (error) {
      toast({
        title: "Produto não encontrado",
        description: "O código de barras inserido não corresponde a nenhum produto.",
        variant: "destructive",
      });
    }
  };
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    if (scannedProduct) {
      addToCart(scannedProduct, quantity);
      toast({
        title: "Produto adicionado",
        description: `${scannedProduct.name} foi adicionado ao carrinho.`,
      });
      setIsPopupVisible(false);
    }
  };
  
  const handleBuyNow = () => {
    if (scannedProduct) {
      addToCart(scannedProduct, quantity);
      navigate("/cart");
    }
  };
  
  const closePopup = () => {
    setIsPopupVisible(false);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-white p-4 flex items-center">
        <Button variant="ghost" size="icon" className="mr-2 text-white" onClick={() => navigate("/")}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold">Escanear produto</h1>
      </header>
      
      <main className="flex-1 flex flex-col">
        {/* Camera Viewfinder */}
        <div className="relative flex-1 bg-black">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            playsInline
            muted
          />
          
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Scanning frame */}
            <div className="w-4/5 h-32 border-2 border-primary rounded"></div>
          </div>
        </div>
        
        {/* Manual entry option */}
        <div className="p-4 bg-white">
          <p className="text-sm text-neutral-500 mb-2">
            Não consegue escanear? Digite o código manualmente:
          </p>
          <div className="flex">
            <Input
              type="text"
              placeholder="Digite o código de barras"
              className="flex-1 rounded-r-none"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
            />
            <Button
              className="rounded-l-none"
              onClick={handleManualSearch}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
      
      {/* Product found popup */}
      {isPopupVisible && scannedProduct && (
        <ProductFoundPopup
          product={scannedProduct}
          quantity={quantity}
          onQuantityChange={handleQuantityChange}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onClose={closePopup}
        />
      )}
    </div>
  );
}
