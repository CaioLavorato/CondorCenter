import { useState } from "react";
import { useLocation } from "wouter";
import { BarcodeScanner } from "@/components/ui/barcode-scanner";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";

export default function ScannerPage() {
  const [, navigate] = useLocation();
  const [isScanning, setIsScanning] = useState(true);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const { addItem } = useCart();
  
  const { data: product, isLoading: isProductLoading } = useQuery<Product>({
    queryKey: [`/api/products/barcode/${scannedBarcode}`],
    enabled: !!scannedBarcode,
  });
  
  const handleScan = (barcode: string) => {
    setScannedBarcode(barcode);
    setIsScanning(false);
  };
  
  const handleAddToCart = () => {
    if (product) {
      addItem(product.id);
    }
  };
  
  const handleBuyNow = () => {
    if (product) {
      addItem(product.id);
      navigate("/cart");
    }
  };
  
  const handleRescan = () => {
    setScannedBarcode(null);
    setIsScanning(true);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary px-4 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          <button onClick={() => navigate("/")} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-white">Escanear Produto</h1>
          <div className="w-6"></div>
        </div>
      </header>
      
      <div className="p-4">
        {/* Scanner Viewfinder */}
        <BarcodeScanner 
          onScan={handleScan} 
          isScanning={isScanning} 
        />
        
        {/* Scanned Product Info */}
        {scannedBarcode && !isProductLoading && product && (
          <div className="mt-6 bg-white rounded-xl shadow p-4">
            <div className="flex">
              <img 
                src={product.imageUrl || "https://via.placeholder.com/100"} 
                alt={product.name} 
                className="w-24 h-24 object-cover rounded-lg mr-4"
              />
              <div>
                <h2 className="font-bold text-lg">{product.name}</h2>
                <p className="text-gray-600 text-sm">Código: {product.barcode}</p>
                <p className="font-bold text-xl text-primary mt-2">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </div>
            {product.description && (
              <p className="text-sm text-gray-600 mt-2">{product.description}</p>
            )}
            <div className="flex justify-between mt-4">
              <Button 
                variant="outline"
                className="w-1/2 mr-2 border-primary text-primary" 
                onClick={handleAddToCart}
              >
                Adicionar ao Carrinho
              </Button>
              <Button 
                className="w-1/2 ml-2 bg-primary text-white" 
                onClick={handleBuyNow}
              >
                Comprar Agora
              </Button>
            </div>
            <Button 
              variant="ghost"
              className="w-full mt-2 text-gray-600" 
              onClick={handleRescan}
            >
              Escanear outro produto
            </Button>
          </div>
        )}
        
        {/* Loading state */}
        {scannedBarcode && isProductLoading && (
          <div className="mt-6 bg-white rounded-xl shadow p-6 flex justify-center">
            <LoadingSpinner />
          </div>
        )}
        
        {/* Product not found state */}
        {scannedBarcode && !isProductLoading && !product && (
          <div className="mt-6 bg-white rounded-xl shadow p-6">
            <h2 className="font-bold text-lg text-center">Produto não encontrado</h2>
            <p className="text-gray-600 text-center mt-2">
              O código {scannedBarcode} não foi encontrado em nossa base de dados.
            </p>
            <Button 
              className="w-full mt-4 bg-primary text-white" 
              onClick={handleRescan}
            >
              Tentar novamente
            </Button>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
}
